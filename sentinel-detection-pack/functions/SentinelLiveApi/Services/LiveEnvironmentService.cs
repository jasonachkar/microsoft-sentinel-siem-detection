using System.Text.Json;
using Azure.Identity;
using Azure.Monitor.Query;
using Azure.ResourceManager;
using Azure.ResourceManager.ResourceGraph;
using Azure.ResourceManager.ResourceGraph.Models;

namespace SentinelLiveApi.Services;

/// <summary>
/// Queries live cloud posture and cloud-native telemetry for the React command center.
/// </summary>
public class LiveEnvironmentService
{
    private readonly LogsQueryClient _logsClient;
    private readonly ArmClient _armClient;
    private readonly string _workspaceId;

    /// <summary>
    /// Initializes Azure SDK clients using DefaultAzureCredential.
    /// </summary>
    public LiveEnvironmentService()
    {
        var credential = new DefaultAzureCredential();
        _logsClient = new LogsQueryClient(credential);
        _armClient = new ArmClient(credential);
        _workspaceId = Environment.GetEnvironmentVariable("WorkspaceId")
                       ?? Environment.GetEnvironmentVariable("LOG_ANALYTICS_WORKSPACE_ID")
                       ?? string.Empty;
    }

    /// <summary>
    /// Gets the configured Log Analytics workspace customer ID.
    /// </summary>
    public string WorkspaceId => _workspaceId;

    /// <summary>
    /// Queries AKS audit telemetry for recent Kubernetes API activity.
    /// </summary>
    public async Task<IReadOnlyList<Dictionary<string, object?>>> GetLiveKubernetesEventsAsync(CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(_workspaceId))
        {
            throw new InvalidOperationException("WorkspaceId or LOG_ANALYTICS_WORKSPACE_ID is not configured.");
        }

        const string kql = @"
            AKSAuditAdmin
            | where TimeGenerated > ago(24h)
            | extend log_json = parse_json(Log)
            | project TimeGenerated,
                      Category,
                      Verb = tostring(log_json.verb),
                      Resource = tostring(log_json.objectRef.resource),
                      User = tostring(log_json.user.username),
                      SourceIP = tostring(log_json.sourceIPs[0])
            | take 50";

        var response = await _logsClient.QueryWorkspaceAsync(
            _workspaceId,
            kql,
            new QueryTimeRange(TimeSpan.FromHours(24)),
            cancellationToken: cancellationToken);

        var rows = new List<Dictionary<string, object?>>();
        foreach (var row in response.Value.Table.Rows)
        {
            rows.Add(new Dictionary<string, object?>(StringComparer.OrdinalIgnoreCase)
            {
                ["TimeGenerated"] = row["TimeGenerated"]?.ToString(),
                ["Category"] = row["Category"]?.ToString(),
                ["Verb"] = row["Verb"]?.ToString(),
                ["Resource"] = row["Resource"]?.ToString(),
                ["User"] = row["User"]?.ToString(),
                ["SourceIP"] = row["SourceIP"]?.ToString()
            });
        }

        return rows;
    }

    /// <summary>
    /// Queries Azure Resource Graph for Terraform-managed infrastructure resources.
    /// </summary>
    public async Task<JsonElement> GetInfrastructurePostureAsync(CancellationToken cancellationToken)
    {
        var tenant = _armClient.GetTenants().First();
        const string query = @"
            Resources
            | where tags.ManagedBy =~ 'Terraform' or tags.managedBy =~ 'Terraform'
            | project name, type, location, tags, resourceGroup
            | order by type asc";

        var queryContent = new ResourceQueryContent(query);
        var response = await tenant.GetResourcesAsync(queryContent, cancellationToken);

        using var document = JsonDocument.Parse(response.Value.Data.ToString());
        return document.RootElement.Clone();
    }
}
