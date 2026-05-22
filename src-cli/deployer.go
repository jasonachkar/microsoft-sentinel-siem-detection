package main

import (
	"context"
	"fmt"
	"os"
	"strings"

	"github.com/Azure/azure-sdk-for-go/sdk/azidentity"
	"github.com/Azure/azure-sdk-for-go/sdk/resourcemanager/securityinsights/armsecurityinsights"
	"gopkg.in/yaml.v3"
)

// Deployer handles authentication and API interactions with Azure Sentinel.
type Deployer struct {
	client        *armsecurityinsights.AlertRulesClient
	resourceGroup string
	workspaceName string
	apply         bool // when false, validate + map only (dry-run); when true, push to Azure
}

// SentinelRule mirrors the YAML detection schema in sentinel-detection-pack/rules-yaml.
type SentinelRule struct {
	ID               string   `yaml:"id"`
	DisplayName      string   `yaml:"name"`
	Description      string   `yaml:"description"`
	Severity         string   `yaml:"severity"`
	Status           string   `yaml:"status"`
	Query            string   `yaml:"query"`
	QueryFrequency   string   `yaml:"queryFrequency"`
	QueryPeriod      string   `yaml:"queryPeriod"`
	TriggerOperator  string   `yaml:"triggerOperator"`
	TriggerThreshold int32    `yaml:"triggerThreshold"`
	Tactics          []string `yaml:"tactics"`
	Techniques       []string `yaml:"techniques"`
}

// NewDeployer authenticates using DefaultAzureCredential (supports OIDC, Managed Identity, CLI).
func NewDeployer(subscriptionID, resourceGroup, workspaceName string, apply bool) (*Deployer, error) {
	cred, err := azidentity.NewDefaultAzureCredential(nil)
	if err != nil {
		return nil, fmt.Errorf("authentication failed: %v", err)
	}

	clientFactory, err := armsecurityinsights.NewClientFactory(subscriptionID, cred, nil)
	if err != nil {
		return nil, err
	}

	return &Deployer{
		client:        clientFactory.NewAlertRulesClient(),
		resourceGroup: resourceGroup,
		workspaceName: workspaceName,
		apply:         apply,
	}, nil
}

// DeployRule parses a YAML detection file, maps it to a Sentinel Scheduled Alert Rule,
// and (when --apply is set) creates or updates it in the workspace via the ARM API.
func (d *Deployer) DeployRule(filePath string) error {
	data, err := os.ReadFile(filePath)
	if err != nil {
		return fmt.Errorf("could not read file: %v", err)
	}

	var rule SentinelRule
	if err := yaml.Unmarshal(data, &rule); err != nil {
		return fmt.Errorf("could not parse YAML: %v", err)
	}
	if rule.ID == "" || rule.Query == "" {
		return fmt.Errorf("rule missing required id/query fields")
	}

	scheduled := buildScheduledRule(rule)

	if !d.apply {
		fmt.Printf("   -> [dry-run] mapped %q (severity=%s, freq=%s, tactics=%s)\n",
			rule.DisplayName, rule.Severity, orDefault(rule.QueryFrequency, "PT5M"), strings.Join(rule.Tactics, ","))
		return nil
	}

	ctx := context.Background()
	if _, err := d.client.CreateOrUpdate(ctx, d.resourceGroup, d.workspaceName, rule.ID, scheduled, nil); err != nil {
		return fmt.Errorf("CreateOrUpdate failed: %w", err)
	}

	fmt.Printf("   -> deployed %q to %s\n", rule.DisplayName, d.workspaceName)
	return nil
}

// buildScheduledRule maps the YAML schema onto the ARM ScheduledAlertRule payload.
func buildScheduledRule(rule SentinelRule) *armsecurityinsights.ScheduledAlertRule {
	kind := armsecurityinsights.AlertRuleKindScheduled
	severity := mapSeverity(rule.Severity)
	triggerOp := armsecurityinsights.TriggerOperator(orDefault(rule.TriggerOperator, "GreaterThan"))

	tactics := make([]*armsecurityinsights.AttackTactic, 0, len(rule.Tactics))
	for _, t := range rule.Tactics {
		tactic := armsecurityinsights.AttackTactic(t)
		tactics = append(tactics, &tactic)
	}

	return &armsecurityinsights.ScheduledAlertRule{
		Kind: &kind,
		Properties: &armsecurityinsights.ScheduledAlertRuleProperties{
			DisplayName:         ptr(rule.DisplayName),
			Description:         ptr(rule.Description),
			Severity:            &severity,
			Enabled:             ptr(true),
			Query:               ptr(rule.Query),
			QueryFrequency:      ptr(orDefault(rule.QueryFrequency, "PT5M")),
			QueryPeriod:         ptr(orDefault(rule.QueryPeriod, "PT1H")),
			TriggerOperator:     &triggerOp,
			TriggerThreshold:    ptr(rule.TriggerThreshold),
			SuppressionDuration: ptr("PT1H"),
			SuppressionEnabled:  ptr(false),
			Tactics:             tactics,
		},
	}
}

func mapSeverity(s string) armsecurityinsights.AlertSeverity {
	switch strings.ToLower(strings.TrimSpace(s)) {
	case "high":
		return armsecurityinsights.AlertSeverityHigh
	case "medium":
		return armsecurityinsights.AlertSeverityMedium
	case "low":
		return armsecurityinsights.AlertSeverityLow
	default:
		return armsecurityinsights.AlertSeverityInformational
	}
}

// ptr returns a pointer to any value (the ARM models use pointer fields throughout).
func ptr[T any](v T) *T { return &v }

func orDefault(v, fallback string) string {
	if strings.TrimSpace(v) == "" {
		return fallback
	}
	return v
}
