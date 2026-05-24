package main

import (
	"strings"
	"testing"

	"github.com/Azure/azure-sdk-for-go/sdk/resourcemanager/securityinsights/armsecurityinsights"
)

func TestValidRuleMapsSupportedMetadata(t *testing.T) {
	rule := validTestRule()

	validation := ValidateRule(rule, "test.yaml")
	if len(validation.Errors) > 0 {
		t.Fatalf("expected no validation errors, got %v", validation.Errors)
	}

	scheduled := buildScheduledRule(rule)
	props := scheduled.Properties
	if props == nil {
		t.Fatal("expected scheduled rule properties")
	}
	if got := *props.DisplayName; got != rule.DisplayName {
		t.Fatalf("display name mismatch: got %q", got)
	}
	if got := *props.QueryFrequency; got != "PT5M" {
		t.Fatalf("query frequency mismatch: got %q", got)
	}
	if got := *props.QueryPeriod; got != "PT1H" {
		t.Fatalf("query period mismatch: got %q", got)
	}
	if got := len(props.EntityMappings); got != 2 {
		t.Fatalf("expected 2 entity mappings, got %d", got)
	}
	if props.CustomDetails == nil || *props.CustomDetails["FailureCount"] != "FailedCount" {
		t.Fatalf("custom details were not mapped: %#v", props.CustomDetails)
	}
	if props.AlertDetailsOverride == nil || *props.AlertDetailsOverride.AlertDisplayNameFormat != "Password spray from {{IPAddress}}" {
		t.Fatalf("alert details override was not mapped")
	}
	if props.IncidentConfiguration == nil || props.IncidentConfiguration.GroupingConfiguration == nil {
		t.Fatalf("incident configuration was not mapped")
	}
	if props.EventGroupingSettings == nil || *props.EventGroupingSettings.AggregationKind != armsecurityinsights.EventGroupingAggregationKindAlertPerResult {
		t.Fatalf("event grouping was not mapped")
	}
	if props.TemplateVersion == nil || *props.TemplateVersion != "1.2.3" {
		t.Fatalf("template version was not mapped")
	}
}

func TestInvalidGUIDRejected(t *testing.T) {
	rule := validTestRule()
	rule.ID = "not-a-guid"

	validation := ValidateRule(rule, "test.yaml")
	requireErrorContains(t, validation.Errors, "id must be a GUID")
}

func TestMissingQueryRejected(t *testing.T) {
	rule := validTestRule()
	rule.Query = ""

	validation := ValidateRule(rule, "test.yaml")
	requireErrorContains(t, validation.Errors, "query is required")
}

func TestInvalidSeverityRejected(t *testing.T) {
	rule := validTestRule()
	rule.Severity = "Critical"

	validation := ValidateRule(rule, "test.yaml")
	requireErrorContains(t, validation.Errors, "severity must be one of")
}

func TestFrequencyGreaterThanPeriodRejected(t *testing.T) {
	rule := validTestRule()
	rule.QueryFrequency = "PT2H"
	rule.QueryPeriod = "PT1H"

	validation := ValidateRule(rule, "test.yaml")
	requireErrorContains(t, validation.Errors, "queryFrequency must be less than or equal to queryPeriod")
}

func TestEntityMappingMissingProjectionWarns(t *testing.T) {
	rule := validTestRule()
	rule.EntityMappings[0].FieldMappings[0].ColumnName = "MissingColumn"

	validation := ValidateRule(rule, "test.yaml")
	if len(validation.Errors) > 0 {
		t.Fatalf("expected warning, not validation error: %v", validation.Errors)
	}
	requireWarningContains(t, validation.Warnings, "MissingColumn")
}

func TestRequiredConnectorsParsed(t *testing.T) {
	rule := validTestRule()

	validation := ValidateRule(rule, "test.yaml")
	if len(validation.DataSources) != 1 || validation.DataSources[0] != "AzureActiveDirectory/SigninLogs" {
		t.Fatalf("unexpected data source summary: %#v", validation.DataSources)
	}
}

func TestCustomDetailsAndAlertOverrideMapped(t *testing.T) {
	rule := validTestRule()
	scheduled := buildScheduledRule(rule)

	if scheduled.Properties.CustomDetails == nil {
		t.Fatal("expected custom details")
	}
	if got := *scheduled.Properties.CustomDetails["FailureCount"]; got != "FailedCount" {
		t.Fatalf("custom detail mismatch: %q", got)
	}
	if scheduled.Properties.AlertDetailsOverride == nil {
		t.Fatal("expected alert details override")
	}
	if got := *scheduled.Properties.AlertDetailsOverride.AlertSeverityColumnName; got != "SeverityColumn" {
		t.Fatalf("alert severity override mismatch: %q", got)
	}
}

func TestDisabledRuleRemainsDisabled(t *testing.T) {
	rule := validTestRule()
	rule.Status = "Disabled"

	scheduled := buildScheduledRule(rule)
	if scheduled.Properties.Enabled == nil || *scheduled.Properties.Enabled {
		t.Fatalf("expected disabled scheduled rule, got %#v", scheduled.Properties.Enabled)
	}
}

func validTestRule() SentinelRule {
	return SentinelRule{
		ID:          "0710c724-a738-4b0f-af52-947ba4f01c0d",
		DisplayName: "Entra ID Password Spray",
		Description: "Detects password spraying across multiple accounts from a single source IP.",
		Severity:    "High",
		Status:      "Production",
		RequiredDataConnectors: []RequiredDataConnector{
			{ConnectorID: "AzureActiveDirectory", DataTypes: []string{"SigninLogs"}},
		},
		QueryFrequency:   "PT5M",
		QueryPeriod:      "PT1H",
		TriggerOperator:  "GreaterThan",
		TriggerThreshold: 0,
		Tactics:          []string{"CredentialAccess", "InitialAccess"},
		Techniques:       []string{"T1110.003"},
		Query: `
SigninLogs
| extend Account = tostring(UserPrincipalName)
| extend IPAddress = tostring(IPAddress)
| extend SeverityColumn = "High"
| extend TacticsColumn = "CredentialAccess"
| summarize FailedCount=count() by bin(TimeGenerated, 15m), Account, IPAddress, SeverityColumn, TacticsColumn
| project TimeGenerated, Account, IPAddress, SeverityColumn, TacticsColumn, FailedCount
`,
		EntityMappings: []RuleEntityMapping{
			{
				EntityType: "Account",
				FieldMappings: []FieldMapping{
					{Identifier: "Name", ColumnName: "Account"},
				},
			},
			{
				EntityType: "IP",
				FieldMappings: []FieldMapping{
					{Identifier: "Address", ColumnName: "IPAddress"},
				},
			},
		},
		CustomDetails: map[string]string{
			"FailureCount": "FailedCount",
		},
		AlertDetailsOverride: &AlertDetailsOverride{
			AlertDisplayNameFormat:  "Password spray from {{IPAddress}}",
			AlertDescriptionFormat:  "Distinct failure count: {{FailedCount}}",
			AlertTacticsColumnName:  "TacticsColumn",
			AlertSeverityColumnName: "SeverityColumn",
		},
		IncidentConfiguration: &IncidentConfiguration{
			CreateIncident: ptr(true),
			GroupingConfiguration: &GroupingConfiguration{
				Enabled:              ptr(true),
				LookbackDuration:     "PT1H",
				MatchingMethod:       "AllEntities",
				ReopenClosedIncident: ptr(false),
				GroupByEntities:      []string{"Account", "IP"},
			},
		},
		EventGroupingSettings: &EventGroupingSettings{
			AggregationKind: "AlertPerResult",
		},
		SuppressionDuration: "PT1H",
		SuppressionEnabled:  ptr(false),
		Kind:                "Scheduled",
		Version:             "1.2.3",
	}
}

func requireErrorContains(t *testing.T, errors []string, want string) {
	t.Helper()
	for _, err := range errors {
		if strings.Contains(err, want) {
			return
		}
	}
	t.Fatalf("expected error containing %q, got %v", want, errors)
}

func requireWarningContains(t *testing.T, warnings []string, want string) {
	t.Helper()
	for _, warning := range warnings {
		if strings.Contains(warning, want) {
			return
		}
	}
	t.Fatalf("expected warning containing %q, got %v", want, warnings)
}
