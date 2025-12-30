using Azure;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using SentinelLiveApi.Models;
using SentinelLiveApi.Services;

namespace SentinelLiveApi.Functions;

/// <summary>
/// HTTP-triggered function that returns aggregated SecurityIncident data.
/// </summary>
public class IncidentsFunction
{
    private readonly LogAnalyticsQueryService _queryService;
    private readonly ILogger<IncidentsFunction> _logger;

    /// <summary>
    /// Creates a new IncidentsFunction with injected dependencies.
    /// </summary>
    /// <param name="queryService">Log Analytics query service.</param>
    /// <param name="logger">Logger instance.</param>
    public IncidentsFunction(LogAnalyticsQueryService queryService, ILogger<IncidentsFunction> logger)
    {
        _queryService = queryService;
        _logger = logger;
    }

    /// <summary>
    /// Returns recent SecurityIncident summaries for the last 14 days.
    /// </summary>
    /// <param name="req">HTTP request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>HTTP response with incident data or an empty payload if unavailable.</returns>
    [Function("GetIncidents")]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "incidents")] HttpRequestData req,
        CancellationToken cancellationToken)
    {
        var response = req.CreateResponse();
        try
        {
            // SecurityIncident exists only when Sentinel is enabled.
            var query = @"
                SecurityIncident
                | where TimeGenerated >= ago(14d)
                | summarize LastSeen=max(TimeGenerated) by IncidentName, Severity, Status, Owner=tostring(Owner.assignedTo)
                | order by LastSeen desc
                | take 100
            ";

            var rows = await _queryService.QueryAsync(query, TimeSpan.FromDays(14), cancellationToken);
            // Convert rows into a stable response shape for the UI.
            var items = rows.Select(row => new IncidentItem(
                GetString(row, "IncidentName"),
                GetString(row, "Severity"),
                GetString(row, "Status"),
                string.IsNullOrWhiteSpace(GetString(row, "Owner")) ? "Unassigned" : GetString(row, "Owner"),
                GetDateTimeOffset(row, "LastSeen")
            )).ToList();

            var payload = new ApiResponse<IncidentItem>("ok", DateTimeOffset.UtcNow, items);
            await response.WriteAsJsonAsync(payload, cancellationToken: cancellationToken);
        }
        catch (RequestFailedException ex) when (LogAnalyticsQueryService.IsMissingTableError(ex))
        {
            // If Sentinel is disabled, return an empty result with a warning for the UI.
            _logger.LogWarning(ex, "SecurityIncident table not available in workspace {WorkspaceId}", _queryService.WorkspaceId);
            var payload = new ApiResponse<IncidentItem>(
                "empty",
                DateTimeOffset.UtcNow,
                Array.Empty<IncidentItem>(),
                "SecurityIncident table not available in this workspace."
            );
            await response.WriteAsJsonAsync(payload, cancellationToken: cancellationToken);
        }
        catch (Exception ex)
        {
            // Return a generic error to avoid leaking implementation details.
            _logger.LogError(ex, "Failed to query incidents.");
            response.StatusCode = System.Net.HttpStatusCode.InternalServerError;
            await response.WriteAsJsonAsync(new { error = "Failed to query incidents." }, cancellationToken: cancellationToken);
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
