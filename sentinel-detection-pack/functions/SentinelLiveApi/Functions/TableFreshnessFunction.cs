using Azure;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using SentinelLiveApi.Models;
using SentinelLiveApi.Services;

namespace SentinelLiveApi.Functions;

/// <summary>
/// HTTP-triggered function that returns table freshness for recent ingestion.
/// </summary>
public class TableFreshnessFunction
{
    private readonly LogAnalyticsQueryService _queryService;
    private readonly ILogger<TableFreshnessFunction> _logger;

    /// <summary>
    /// Creates a new TableFreshnessFunction with injected dependencies.
    /// </summary>
    /// <param name="queryService">Log Analytics query service.</param>
    /// <param name="logger">Logger instance.</param>
    public TableFreshnessFunction(LogAnalyticsQueryService queryService, ILogger<TableFreshnessFunction> logger)
    {
        _queryService = queryService;
        _logger = logger;
    }

    /// <summary>
    /// Returns last-seen times for tables using the Usage table.
    /// </summary>
    /// <param name="req">HTTP request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>HTTP response with table freshness data or an empty payload if unavailable.</returns>
    [Function("GetTableFreshness")]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "table-freshness")] HttpRequestData req,
        CancellationToken cancellationToken)
    {
        var response = req.CreateResponse();
        try
        {
            // The Usage table exists even in most low-volume workspaces.
            var query = @"
                Usage
                | where TimeGenerated >= ago(7d)
                | summarize LastSeen=max(TimeGenerated) by DataType
                | order by LastSeen desc
                | take 75
            ";

            var rows = await _queryService.QueryAsync(query, TimeSpan.FromDays(7), cancellationToken);
            var now = DateTimeOffset.UtcNow;
            // Convert to freshness data and compute age in minutes.
            var items = rows.Select(row =>
            {
                var lastSeen = GetDateTimeOffset(row, "LastSeen");
                var ageMinutes = Math.Max(0, (now - lastSeen).TotalMinutes);
                return new TableFreshnessItem(
                    GetString(row, "DataType"),
                    lastSeen,
                    Math.Round(ageMinutes, 2)
                );
            }).ToList();

            var payload = new ApiResponse<TableFreshnessItem>("ok", DateTimeOffset.UtcNow, items);
            await response.WriteAsJsonAsync(payload, cancellationToken: cancellationToken);
        }
        catch (RequestFailedException ex) when (LogAnalyticsQueryService.IsMissingTableError(ex))
        {
            // Some workspaces may restrict Usage. Provide a warning to the UI.
            _logger.LogWarning(ex, "Usage table not available in workspace {WorkspaceId}", _queryService.WorkspaceId);
            var payload = new ApiResponse<TableFreshnessItem>(
                "empty",
                DateTimeOffset.UtcNow,
                Array.Empty<TableFreshnessItem>(),
                "Usage table not available in this workspace."
            );
            await response.WriteAsJsonAsync(payload, cancellationToken: cancellationToken);
        }
        catch (Exception ex)
        {
            // Return a generic error to avoid leaking implementation details.
            _logger.LogError(ex, "Failed to query table freshness.");
            response.StatusCode = System.Net.HttpStatusCode.InternalServerError;
            await response.WriteAsJsonAsync(new { error = "Failed to query table freshness." }, cancellationToken: cancellationToken);
        }

        return response;
    }

    // Safe helpers for row parsing and type conversion.
    private static string GetString(IDictionary<string, object?> row, string key)
        => row.TryGetValue(key, out var value) ? value?.ToString() ?? string.Empty : string.Empty;

    private static DateTimeOffset GetDateTimeOffset(IDictionary<string, object?> row, string key)
        => row.TryGetValue(key, out var value) && DateTimeOffset.TryParse(value?.ToString(), out var parsed)
            ? parsed
            : DateTimeOffset.UtcNow;
}
