using Azure;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using SentinelLiveApi.Services;
using System.Net;

namespace SentinelLiveApi.Functions;

/// <summary>
/// HTTP-triggered functions exposing live Azure environment telemetry.
/// </summary>
public class LiveEnvironmentFunctions
{
    private readonly LiveEnvironmentService _envService;
    private readonly ILogger<LiveEnvironmentFunctions> _logger;

    /// <summary>
    /// Creates a new LiveEnvironmentFunctions instance.
    /// </summary>
    public LiveEnvironmentFunctions(LiveEnvironmentService envService, ILogger<LiveEnvironmentFunctions> logger)
    {
        _envService = envService;
        _logger = logger;
    }

    /// <summary>
    /// Returns live AKS audit telemetry from Log Analytics.
    /// </summary>
    [Function("GetLiveKubernetes")]
    public async Task<HttpResponseData> GetLiveKubernetes(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "live/kubernetes")] HttpRequestData req,
        CancellationToken cancellationToken)
    {
        _logger.LogInformation("Fetching live Kubernetes telemetry.");
        var response = req.CreateResponse(HttpStatusCode.OK);

        try
        {
            var data = await _envService.GetLiveKubernetesEventsAsync(cancellationToken);
            await response.WriteAsJsonAsync(data, cancellationToken: cancellationToken);
        }
        catch (RequestFailedException ex) when (LogAnalyticsQueryService.IsMissingTableError(ex))
        {
            _logger.LogWarning(ex, "AKSAuditAdmin table not available in workspace {WorkspaceId}", _envService.WorkspaceId);
            await response.WriteAsJsonAsync(Array.Empty<object>(), cancellationToken: cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to fetch live Kubernetes telemetry.");
            response.StatusCode = HttpStatusCode.ServiceUnavailable;
            await response.WriteAsJsonAsync(new { error = "Live Kubernetes telemetry is unavailable." }, cancellationToken: cancellationToken);
        }

        return response;
    }

    /// <summary>
    /// Returns Terraform-managed resource posture from Azure Resource Graph.
    /// </summary>
    [Function("GetLivePosture")]
    public async Task<HttpResponseData> GetLivePosture(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "live/posture")] HttpRequestData req,
        CancellationToken cancellationToken)
    {
        _logger.LogInformation("Fetching live IaC posture.");
        var response = req.CreateResponse(HttpStatusCode.OK);

        try
        {
            var data = await _envService.GetInfrastructurePostureAsync(cancellationToken);
            await response.WriteAsJsonAsync(data, cancellationToken: cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to fetch live infrastructure posture.");
            response.StatusCode = HttpStatusCode.ServiceUnavailable;
            await response.WriteAsJsonAsync(Array.Empty<object>(), cancellationToken: cancellationToken);
        }

        return response;
    }
}
