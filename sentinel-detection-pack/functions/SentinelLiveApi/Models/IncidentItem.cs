namespace SentinelLiveApi.Models;

/// <summary>
/// Represents a summarized Sentinel incident row from Log Analytics.
/// </summary>
/// <param name="Title">Incident title or name.</param>
/// <param name="Severity">Incident severity.</param>
/// <param name="Status">Current incident status.</param>
/// <param name="Owner">Assigned owner or unassigned.</param>
/// <param name="LastSeen">Most recent time the incident was updated.</param>
public record IncidentItem(
    string Title,
    string Severity,
    string Status,
    string Owner,
    DateTimeOffset LastSeen
);
