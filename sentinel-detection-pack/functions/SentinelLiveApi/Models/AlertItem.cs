namespace SentinelLiveApi.Models;

/// <summary>
/// Represents a summarized security alert entry from Log Analytics.
/// </summary>
/// <param name="TimeGenerated">The time bucket for the alert aggregation.</param>
/// <param name="AlertSeverity">The severity level of the alert.</param>
/// <param name="AlertName">The alert name as emitted by the source.</param>
/// <param name="ProductName">The source product that generated the alert.</param>
/// <param name="AlertCount">Number of alerts in the bucket.</param>
public record AlertItem(
    DateTimeOffset TimeGenerated,
    string AlertSeverity,
    string AlertName,
    string ProductName,
    long AlertCount
);
