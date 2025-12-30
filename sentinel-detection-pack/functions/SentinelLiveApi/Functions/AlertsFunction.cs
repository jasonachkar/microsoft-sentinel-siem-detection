using Azure;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using SentinelLiveApi.Models;
using SentinelLiveApi.Services;

namespace SentinelLiveApi.Functions;

/// <summary>
/// HTTP-triggered function that returns aggregated SecurityAlert data.
/// </summary>
public class AlertsFunction
{
    private readonly LogAnalyticsQueryService _queryService;
    private readonly ILogger<AlertsFunction> _logger;

    /// <summary>
    /// Creates a new AlertsFunction with injected dependencies.
    /// </summary>
    /// <param name="queryService">Log Analytics query service.</param>
    /// <param name="logger">Logger instance.</param>
    public AlertsFunction(LogAnalyticsQueryService queryService, ILogger<AlertsFunction> logger)
    {
        _queryService = queryService;
        _logger = logger;
    }

    /// <summary>
    /// Returns recent SecurityAlert summaries for the last 24 hours.
    /// </summary>
    /// <param name="req">HTTP request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>HTTP response with alert data or an empty payload if unavailable.</returns>
    [Function("GetAlerts")]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "alerts")] HttpRequestData req,
        CancellationToken cancellationToken)
    {
        var response = req.CreateResponse();
        try
        {
            // Summarize alerts by severity, name, and product in 15-minute buckets.
            var query = @"
                SecurityAlert
                | where TimeGenerated >= ago(24h)
                | summarize AlertCount=count() by bin(TimeGenerated, 15m), AlertSeverity, AlertName, ProductName
                | order by TimeGenerated desc
                | take 200
            ";

            var rows = await _queryService.QueryAsync(query, TimeSpan.FromDays(1), cancellationToken);
            // Transform query rows into strongly typed DTOs for the UI.
            var items = rows.Select(row => new AlertItem(
                GetDateTimeOffset(row, "TimeGenerated"),
                GetString(row, "AlertSeverity"),
                GetString(row, "AlertName"),
                GetString(row, "ProductName"),
                GetLong(row, "AlertCount")
            )).ToList();

            var payload = new ApiResponse<AlertItem>("ok", DateTimeOffset.UtcNow, items);
            await response.WriteAsJsonAsync(payload, cancellationToken: cancellationToken);
        }
        catch (RequestFailedException ex) when (LogAnalyticsQueryService.IsMissingTableError(ex))
        {
            // SecurityAlert isn't available if Sentinel/Defender connectors are not enabled.
            _logger.LogWarning(ex, "SecurityAlert table not available in workspace {WorkspaceId}", _queryService.WorkspaceId);
            var payload = new ApiResponse<AlertItem>(
                "empty",
                DateTimeOffset.UtcNow,
                Array.Empty<AlertItem>(),
                "SecurityAlert table not available in this workspace."
            );
            await response.WriteAsJsonAsync(payload, cancellationToken: cancellationToken);
        }
        catch (Exception ex)
        {
            // Return a generic error to avoid leaking implementation details.
            _logger.LogError(ex, "Failed to query alerts.");
            response.StatusCode = System.Net.HttpStatusCode.InternalServerError;
            await response.WriteAsJsonAsync(new { error = "Failed to query alerts." }, cancellationToken: cancellationToken);
        }

        return response;
    }

    // Safe helpers for row parsing and type conversion.
    private static string GetString(IDictionary<string, object?> row, string key)
        => row.TryGetValue(key, out var value) ? value?.ToString() ?? string.Empty : string.Empty;

    private static long GetLong(IDictionary<string, object?> row, string key)
        => row.TryGetValue(key, out var value) && long.TryParse(value?.ToString(), out var parsed) ? parsed : 0;

    private static DateTimeOffset GetDateTimeOffset(IDictionary<string, object?> row, string key)
        => row.TryGetValue(key, out var value) && DateTimeOffset.TryParse(value?.ToString(), out var parsed)
            ? parsed
            : DateTimeOffset.UtcNow;
}
