namespace SentinelLiveApi.Models;

/// <summary>
/// Represents the most recent ingestion timestamp for a Log Analytics table.
/// </summary>
/// <param name="TableName">Log Analytics data type/table.</param>
/// <param name="LastSeen">Most recent ingestion time.</param>
/// <param name="AgeMinutes">Age in minutes since last ingestion.</param>
public record TableFreshnessItem(
    string TableName,
    DateTimeOffset LastSeen,
    double AgeMinutes
);
