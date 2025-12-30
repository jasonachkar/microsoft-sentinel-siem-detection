using System.Text.Json;
using Azure;
using Azure.Identity;
using Azure.Monitor.Query;
using Azure.Monitor.Query.Models;

namespace SentinelLiveApi.Services;

/// <summary>
/// Wraps Log Analytics queries using managed identity.
/// </summary>
public class LogAnalyticsQueryService
{
    private readonly LogsQueryClient _client;
    private readonly string _workspaceId;
    private readonly TimeSpan _timeout;

    /// <summary>
    /// Initializes the query client and reads workspace configuration from environment variables.
    /// </summary>
    public LogAnalyticsQueryService()
    {
        // Use DefaultAzureCredential so the Function App managed identity is used in Azure.
        _client = new LogsQueryClient(new DefaultAzureCredential());
        // Workspace customer ID is required to issue Log Analytics queries.
        _workspaceId = Environment.GetEnvironmentVariable("LOG_ANALYTICS_WORKSPACE_ID") ?? string.Empty;
        var timeoutRaw = Environment.GetEnvironmentVariable("LOG_ANALYTICS_QUERY_TIMEOUT_SECONDS");
        _timeout = int.TryParse(timeoutRaw, out var seconds) ? TimeSpan.FromSeconds(seconds) : TimeSpan.FromSeconds(30);
    }

    /// <summary>
    /// Gets the configured workspace ID (customer ID).
    /// </summary>
    public string WorkspaceId => _workspaceId;

    /// <summary>
    /// Executes a Log Analytics query and returns rows as dictionaries.
    /// </summary>
    /// <param name="query">KQL query string.</param>
    /// <param name="timeRange">Time range for the query.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of row dictionaries keyed by column name.</returns>
    public async Task<IReadOnlyList<Dictionary<string, object?>>> QueryAsync(string query, TimeSpan timeRange, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(_workspaceId))
        {
            throw new InvalidOperationException("LOG_ANALYTICS_WORKSPACE_ID is not configured.");
        }

        // Apply a server-side timeout to avoid long-running queries.
        var options = new LogsQueryOptions { ServerTimeout = _timeout };
        var result = await _client.QueryWorkspaceAsync(
            _workspaceId,
            query,
            timeRange,
            options,
            cancellationToken
        );

        return ToRowDictionaries(result.Value.Table);
    }

    private static IReadOnlyList<Dictionary<string, object?>> ToRowDictionaries(LogsTable table)
    {
        var rows = new List<Dictionary<string, object?>>();
        foreach (var row in table.Rows)
        {
            var entry = new Dictionary<string, object?>(StringComparer.OrdinalIgnoreCase);
            for (var i = 0; i < table.Columns.Count; i += 1)
            {
                entry[table.Columns[i].Name] = NormalizeValue(row[i]);
            }
            rows.Add(entry);
        }

        return rows;
    }

    private static object? NormalizeValue(object? value)
    {
        // Convert JsonElement to primitive types for simpler serialization.
        if (value is JsonElement element)
        {
            return element.ValueKind switch
            {
                JsonValueKind.String => element.GetString(),
                JsonValueKind.Number => element.TryGetInt64(out var longValue) ? longValue : element.GetDouble(),
                JsonValueKind.True => true,
                JsonValueKind.False => false,
                JsonValueKind.Null => null,
                _ => element.ToString()
            };
        }

        return value;
    }

    /// <summary>
    /// Detects common errors for missing tables in Log Analytics workspaces.
    /// </summary>
    /// <param name="ex">Exception from LogsQueryClient.</param>
    /// <returns>True if the message indicates a missing table.</returns>
    public static bool IsMissingTableError(RequestFailedException ex)
    {
        return ex.Message.Contains("Failed to resolve table", StringComparison.OrdinalIgnoreCase)
               || ex.Message.Contains("Could not resolve table", StringComparison.OrdinalIgnoreCase)
               || ex.Message.Contains("Semantic error", StringComparison.OrdinalIgnoreCase);
    }
}
