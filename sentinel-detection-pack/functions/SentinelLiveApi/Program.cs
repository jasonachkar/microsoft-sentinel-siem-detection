using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using SentinelLiveApi.Services;

// Entry point for the .NET 8 isolated worker.
// Registers required services and starts the Azure Functions host.
var host = new HostBuilder()
    .ConfigureFunctionsWorkerDefaults()
    .ConfigureServices(services =>
    {
        // Singleton query service reuses the LogsQueryClient and workspace config.
        services.AddSingleton<LogAnalyticsQueryService>();
    })
    .Build();

host.Run();
