namespace SentinelLiveApi.Models;

/// <summary>
/// Standard API response envelope for frontend consumption.
/// </summary>
/// <typeparam name="T">Payload item type.</typeparam>
/// <param name="Status">Response status such as ok, empty, or error.</param>
/// <param name="GeneratedAt">UTC time the response was produced.</param>
/// <param name="Items">Payload items.</param>
/// <param name="Warning">Optional warning to surface missing tables or partial data.</param>
public record ApiResponse<T>(
    string Status,
    DateTimeOffset GeneratedAt,
    IReadOnlyList<T> Items,
    string? Warning = null
);
