using System.Text.Json;
using Azure.Core;
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
    private readonly string _subscriptionId;

    /// <summary>
    /// Initializes Azure SDK clients using DefaultAzureCredential.
    /// </summary>
    public LiveEnvironmentService()
    {
        var credential = CreateCredential();
        _logsClient = new LogsQueryClient(credential);
        _armClient = new ArmClient(credential);
        _workspaceId = Environment.GetEnvironmentVariable("WorkspaceId")
                       ?? Environment.GetEnvironmentVariable("LOG_ANALYTICS_WORKSPACE_ID")
                       ?? string.Empty;
        _subscriptionId = Environment.GetEnvironmentVariable("AZURE_SUBSCRIPTION_ID") ?? string.Empty;
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
    /// Queries Azure Resource Graph for live infrastructure resources.
    /// </summary>
    public async Task<JsonElement> GetInfrastructurePostureAsync(CancellationToken cancellationToken)
    {
        var tenant = _armClient.GetTenants().First();
        const string query = @"
            Resources
            | extend TerraformManaged = iff(tostring(tags.ManagedBy) =~ 'Terraform' or tostring(tags.managedBy) =~ 'Terraform', true, false)
            | extend EnvironmentTag = tostring(tags.Environment)
            | project name, type, location, tags, resourceGroup, TerraformManaged, EnvironmentTag
            | order by type asc";

        var queryContent = CreateResourceQueryContent(query);
        var response = await tenant.GetResourcesAsync(queryContent, cancellationToken);

        using var document = JsonDocument.Parse(response.Value.Data.ToString());
        return document.RootElement.Clone();
    }

    /// <summary>
    /// Queries Azure Resource Graph for real security and governance findings.
    /// </summary>
    public async Task<JsonElement> GetInfrastructureFindingsAsync(CancellationToken cancellationToken)
    {
        var tenant = _armClient.GetTenants().First();
        const string query = @"
            Resources
            | extend issue = case(
                type =~ 'microsoft.web/sites' and tobool(properties.httpsOnly) != true, 'App Service does not enforce HTTPS-only traffic',
                type =~ 'microsoft.keyvault/vaults' and tostring(properties.publicNetworkAccess) =~ 'Enabled', 'Key Vault public network access is enabled',
                type =~ 'microsoft.keyvault/vaults' and tobool(properties.enablePurgeProtection) != true, 'Key Vault purge protection is not enabled',
                isempty(tostring(tags.ManagedBy)) and isempty(tostring(tags.managedBy)), 'Resource is not tagged as Terraform-managed',
                isempty(tostring(tags.Environment)), 'Resource is missing an Environment tag',
                ''
            )
            | where issue != ''
            | extend severity = case(issue startswith 'App Service' or issue startswith 'Key Vault', 'High', issue contains 'Terraform', 'Medium', 'Low')
            | extend recommendation = case(
                issue startswith 'App Service', 'Set httpsOnly=true on the App Service to block plaintext HTTP.',
                issue contains 'public network', 'Disable public network access or restrict access with private endpoints and firewall rules.',
                issue contains 'purge protection', 'Enable purge protection to prevent permanent secret deletion after compromise.',
                issue contains 'Terraform', 'Bring the resource under IaC management or tag it with ManagedBy=Terraform.',
                'Apply an Environment tag so production, dev, and test assets can be governed separately.'
            )
            | project name, type, resourceGroup, location, issue, severity, recommendation
            | order by case(severity == 'High', 0, severity == 'Medium', 1, 2), resourceGroup asc, name asc
            | take 100";

        var queryContent = CreateResourceQueryContent(query);
        var response = await tenant.GetResourcesAsync(queryContent, cancellationToken);

        using var document = JsonDocument.Parse(response.Value.Data.ToString());
        return document.RootElement.Clone();
    }

    private ResourceQueryContent CreateResourceQueryContent(string query)
    {
        var queryContent = new ResourceQueryContent(query);
        if (!string.IsNullOrWhiteSpace(_subscriptionId))
        {
            queryContent.Subscriptions.Add(_subscriptionId);
        }

        return queryContent;
    }

    private static TokenCredential CreateCredential()
    {
        return new ChainedTokenCredential(
            new AzureCliCredential(),
            new ManagedIdentityCredential(new ManagedIdentityCredentialOptions()),
            new EnvironmentCredential());
    }
}
