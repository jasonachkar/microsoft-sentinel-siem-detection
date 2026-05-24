package main

import (
	"context"
	"fmt"
	"os"
	"regexp"
	"sort"
	"strings"
	"time"

	"github.com/Azure/azure-sdk-for-go/sdk/azidentity"
	"github.com/Azure/azure-sdk-for-go/sdk/resourcemanager/securityinsights/armsecurityinsights"
	"gopkg.in/yaml.v3"
)

const (
	defaultQueryFrequency      = "PT5M"
	defaultQueryPeriod         = "PT1H"
	defaultSuppressionDuration = "PT1H"
)

// Deployer handles validation and optional ARM API interactions with Microsoft Sentinel.
type Deployer struct {
	client        *armsecurityinsights.AlertRulesClient
	resourceGroup string
	workspaceName string
	apply         bool
	explain       bool
}

// SentinelRule mirrors the YAML detection schema in sentinel-detection-pack/rules-yaml.
type SentinelRule struct {
	ID                     string                  `yaml:"id" json:"id"`
	DisplayName            string                  `yaml:"name" json:"name"`
	Description            string                  `yaml:"description" json:"description"`
	Severity               string                  `yaml:"severity" json:"severity"`
	Status                 string                  `yaml:"status" json:"status"`
	Enabled                *bool                   `yaml:"enabled" json:"enabled,omitempty"`
	RequiredDataConnectors []RequiredDataConnector `yaml:"requiredDataConnectors" json:"requiredDataConnectors,omitempty"`
	Query                  string                  `yaml:"query" json:"query"`
	QueryFrequency         string                  `yaml:"queryFrequency" json:"queryFrequency"`
	QueryPeriod            string                  `yaml:"queryPeriod" json:"queryPeriod"`
	TriggerOperator        string                  `yaml:"triggerOperator" json:"triggerOperator"`
	TriggerThreshold       int32                   `yaml:"triggerThreshold" json:"triggerThreshold"`
	Tactics                []string                `yaml:"tactics" json:"tactics"`
	Techniques             []string                `yaml:"techniques" json:"techniques"`
	EntityMappings         []RuleEntityMapping     `yaml:"entityMappings" json:"entityMappings,omitempty"`
	CustomDetails          map[string]string       `yaml:"customDetails" json:"customDetails,omitempty"`
	AlertDetailsOverride   *AlertDetailsOverride   `yaml:"alertDetailsOverride" json:"alertDetailsOverride,omitempty"`
	IncidentConfiguration  *IncidentConfiguration  `yaml:"incidentConfiguration" json:"incidentConfiguration,omitempty"`
	EventGroupingSettings  *EventGroupingSettings  `yaml:"eventGroupingSettings" json:"eventGroupingSettings,omitempty"`
	SuppressionDuration    string                  `yaml:"suppressionDuration" json:"suppressionDuration,omitempty"`
	SuppressionEnabled     *bool                   `yaml:"suppressionEnabled" json:"suppressionEnabled,omitempty"`
	Kind                   string                  `yaml:"kind" json:"kind"`
	Version                string                  `yaml:"version" json:"version"`
}

type RequiredDataConnector struct {
	ConnectorID string   `yaml:"connectorId" json:"connectorId"`
	DataTypes   []string `yaml:"dataTypes" json:"dataTypes"`
}

type RuleEntityMapping struct {
	EntityType    string         `yaml:"entityType" json:"entityType"`
	FieldMappings []FieldMapping `yaml:"fieldMappings" json:"fieldMappings"`
}

type FieldMapping struct {
	Identifier string `yaml:"identifier" json:"identifier"`
	ColumnName string `yaml:"columnName" json:"columnName"`
}

type AlertDetailsOverride struct {
	AlertDisplayNameFormat  string `yaml:"alertDisplayNameFormat" json:"alertDisplayNameFormat,omitempty"`
	AlertDescriptionFormat  string `yaml:"alertDescriptionFormat" json:"alertDescriptionFormat,omitempty"`
	AlertTacticsColumnName  string `yaml:"alertTacticsColumnName" json:"alertTacticsColumnName,omitempty"`
	AlertSeverityColumnName string `yaml:"alertSeverityColumnName" json:"alertSeverityColumnName,omitempty"`
}

type IncidentConfiguration struct {
	CreateIncident        *bool                  `yaml:"createIncident" json:"createIncident,omitempty"`
	GroupingConfiguration *GroupingConfiguration `yaml:"groupingConfiguration" json:"groupingConfiguration,omitempty"`
}

type GroupingConfiguration struct {
	Enabled              *bool    `yaml:"enabled" json:"enabled,omitempty"`
	ReopenClosedIncident *bool    `yaml:"reopenClosedIncident" json:"reopenClosedIncident,omitempty"`
	LookbackDuration     string   `yaml:"lookbackDuration" json:"lookbackDuration,omitempty"`
	MatchingMethod       string   `yaml:"matchingMethod" json:"matchingMethod,omitempty"`
	GroupByEntities      []string `yaml:"groupByEntities" json:"groupByEntities,omitempty"`
	GroupByAlertDetails  []string `yaml:"groupByAlertDetails" json:"groupByAlertDetails,omitempty"`
	GroupByCustomDetails []string `yaml:"groupByCustomDetails" json:"groupByCustomDetails,omitempty"`
}

type EventGroupingSettings struct {
	AggregationKind string `yaml:"aggregationKind" json:"aggregationKind,omitempty"`
}

type RuleValidation struct {
	File                  string   `json:"file"`
	ID                    string   `json:"id"`
	Name                  string   `json:"name"`
	Severity              string   `json:"severity"`
	Status                string   `json:"status"`
	Enabled               bool     `json:"enabled"`
	DataSources           []string `json:"dataSources"`
	EntityMappings        []string `json:"entityMappings"`
	CustomDetails         []string `json:"customDetails"`
	AlertDetailsOverride  bool     `json:"alertDetailsOverride"`
	IncidentConfiguration bool     `json:"incidentConfiguration"`
	EventGrouping         bool     `json:"eventGrouping"`
	QueryFrequency        string   `json:"queryFrequency"`
	QueryPeriod           string   `json:"queryPeriod"`
	TriggerOperator       string   `json:"triggerOperator"`
	TriggerThreshold      int32    `json:"triggerThreshold"`
	Tactics               []string `json:"tactics"`
	Techniques            []string `json:"techniques"`
	Kind                  string   `json:"kind"`
	Version               string   `json:"version"`
	Errors                []string `json:"errors"`
	Warnings              []string `json:"warnings"`
}

type ValidationReport struct {
	GeneratedAt string            `json:"generatedAt"`
	Summary     ValidationSummary `json:"summary"`
	Rules       []RuleValidation  `json:"rules"`
}

type ValidationSummary struct {
	Total    int `json:"total"`
	Passed   int `json:"passed"`
	Failed   int `json:"failed"`
	Warnings int `json:"warnings"`
}

// NewDeployer authenticates only for apply mode. Dry-run and validation modes do not need Azure credentials.
func NewDeployer(subscriptionID, resourceGroup, workspaceName string, apply bool, explain bool) (*Deployer, error) {
	deployer := &Deployer{
		resourceGroup: resourceGroup,
		workspaceName: workspaceName,
		apply:         apply,
		explain:       explain,
	}

	if !apply {
		return deployer, nil
	}

	cred, err := azidentity.NewDefaultAzureCredential(nil)
	if err != nil {
		return nil, fmt.Errorf("authentication failed: %v", err)
	}

	clientFactory, err := armsecurityinsights.NewClientFactory(subscriptionID, cred, nil)
	if err != nil {
		return nil, err
	}
	deployer.client = clientFactory.NewAlertRulesClient()

	return deployer, nil
}

// DeployRule parses, validates, maps, and optionally deploys a YAML detection rule.
func (d *Deployer) DeployRule(filePath string) (RuleValidation, error) {
	rule, err := LoadRule(filePath)
	if err != nil {
		return RuleValidation{File: filePath, Errors: []string{err.Error()}}, err
	}

	validation := ValidateRule(rule, filePath)
	if len(validation.Errors) > 0 {
		return validation, fmt.Errorf("validation failed for %s: %s", filePath, strings.Join(validation.Errors, "; "))
	}

	scheduled := buildScheduledRule(rule)
	if !d.apply {
		if d.explain {
			fmt.Print(ExplainRule(rule, validation))
		} else {
			fmt.Printf("   -> [dry-run] mapped %q (severity=%s, freq=%s, lookback=%s, entities=%d)\n",
				rule.DisplayName,
				rule.Severity,
				orDefault(rule.QueryFrequency, defaultQueryFrequency),
				orDefault(rule.QueryPeriod, defaultQueryPeriod),
				len(rule.EntityMappings))
		}
		return validation, nil
	}

	ctx := context.Background()
	if _, err := d.client.CreateOrUpdate(ctx, d.resourceGroup, d.workspaceName, rule.ID, scheduled, nil); err != nil {
		return validation, fmt.Errorf("CreateOrUpdate failed: %w", err)
	}

	fmt.Printf("   -> deployed %q to %s\n", rule.DisplayName, d.workspaceName)
	return validation, nil
}

func LoadRule(filePath string) (SentinelRule, error) {
	data, err := os.ReadFile(filePath)
	if err != nil {
		return SentinelRule{}, fmt.Errorf("could not read file: %v", err)
	}

	var rule SentinelRule
	if err := yaml.Unmarshal(data, &rule); err != nil {
		return SentinelRule{}, fmt.Errorf("could not parse YAML: %v", err)
	}
	return rule, nil
}

func ValidateRule(rule SentinelRule, filePath string) RuleValidation {
	validation := RuleValidation{
		File:                  filePath,
		ID:                    rule.ID,
		Name:                  rule.DisplayName,
		Severity:              rule.Severity,
		Status:                rule.Status,
		Enabled:               ruleEnabled(rule),
		DataSources:           connectorSummary(rule.RequiredDataConnectors),
		EntityMappings:        entityMappingSummary(rule.EntityMappings),
		CustomDetails:         sortedMapKeys(rule.CustomDetails),
		AlertDetailsOverride:  rule.AlertDetailsOverride != nil,
		IncidentConfiguration: rule.IncidentConfiguration != nil,
		EventGrouping:         rule.EventGroupingSettings != nil,
		QueryFrequency:        rule.QueryFrequency,
		QueryPeriod:           rule.QueryPeriod,
		TriggerOperator:       rule.TriggerOperator,
		TriggerThreshold:      rule.TriggerThreshold,
		Tactics:               append([]string{}, rule.Tactics...),
		Techniques:            append([]string{}, rule.Techniques...),
		Kind:                  orDefault(rule.Kind, "Scheduled"),
		Version:               rule.Version,
	}

	addErr := func(format string, args ...any) {
		validation.Errors = append(validation.Errors, fmt.Sprintf(format, args...))
	}
	addWarn := func(format string, args ...any) {
		validation.Warnings = append(validation.Warnings, fmt.Sprintf(format, args...))
	}

	if !regexp.MustCompile(`(?i)^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$`).MatchString(strings.TrimSpace(rule.ID)) {
		addErr("id must be a GUID")
	}
	if strings.TrimSpace(rule.DisplayName) == "" {
		addErr("name is required")
	}
	if strings.TrimSpace(rule.Query) == "" {
		addErr("query is required")
	}
	if !containsString(validSeverities(), rule.Severity) {
		addErr("severity must be one of Informational, Low, Medium, High")
	}
	if strings.TrimSpace(rule.Kind) != "" && !strings.EqualFold(rule.Kind, "Scheduled") {
		addErr("kind must be Scheduled for this deployer")
	}
	if strings.TrimSpace(rule.Version) == "" || !regexp.MustCompile(`^\d+\.\d+\.\d+$`).MatchString(strings.TrimSpace(rule.Version)) {
		addErr("version must be semver, for example 1.0.0")
	}
	if len(rule.RequiredDataConnectors) == 0 {
		addErr("requiredDataConnectors must include at least one connector")
	}
	for i, connector := range rule.RequiredDataConnectors {
		if strings.TrimSpace(connector.ConnectorID) == "" {
			addErr("requiredDataConnectors[%d].connectorId is required", i)
		}
		if len(connector.DataTypes) == 0 {
			addErr("requiredDataConnectors[%d].dataTypes must include at least one table", i)
		}
	}

	frequency, freqErr := parseISODuration(rule.QueryFrequency)
	if freqErr != nil {
		addErr("queryFrequency must be an ISO8601 duration: %v", freqErr)
	}
	period, periodErr := parseISODuration(rule.QueryPeriod)
	if periodErr != nil {
		addErr("queryPeriod must be an ISO8601 duration: %v", periodErr)
	}
	if freqErr == nil && periodErr == nil && frequency > period {
		addErr("queryFrequency must be less than or equal to queryPeriod")
	}
	if !containsString(possibleTriggerOperators(), orDefault(rule.TriggerOperator, "GreaterThan")) {
		addErr("triggerOperator is not supported: %s", rule.TriggerOperator)
	}

	validTactics := possibleAttackTactics()
	if len(rule.Tactics) == 0 {
		addWarn("tactics is empty; MITRE mapping will be weak")
	}
	for _, tactic := range rule.Tactics {
		if !containsString(validTactics, tactic) {
			addErr("invalid Sentinel ATT&CK tactic: %s", tactic)
		}
	}
	if len(rule.Techniques) == 0 {
		addWarn("techniques is empty; MITRE mapping will be weak")
	}
	techniquePattern := regexp.MustCompile(`^T\d{4}(\.\d{3})?$`)
	for _, technique := range rule.Techniques {
		if !techniquePattern.MatchString(strings.TrimSpace(technique)) {
			addErr("technique must start with T and use MITRE format, got %s", technique)
		}
	}

	if len(rule.EntityMappings) == 0 {
		addWarn("entityMappings is empty; investigations will have weaker entity context")
	}
	for i, mapping := range rule.EntityMappings {
		if !containsString(possibleEntityMappingTypes(), mapping.EntityType) {
			addErr("entityMappings[%d].entityType is not supported: %s", i, mapping.EntityType)
		}
		if len(mapping.FieldMappings) == 0 {
			addErr("entityMappings[%d].fieldMappings must include at least one mapping", i)
		}
		for j, field := range mapping.FieldMappings {
			if strings.TrimSpace(field.Identifier) == "" || strings.TrimSpace(field.ColumnName) == "" {
				addErr("entityMappings[%d].fieldMappings[%d] requires identifier and columnName", i, j)
				continue
			}
			if !queryReferencesColumn(rule.Query, field.ColumnName) {
				addWarn("entity mapping column %q is not obviously projected or extended in the query", field.ColumnName)
			}
		}
	}

	for key, columnName := range rule.CustomDetails {
		if strings.TrimSpace(key) == "" || strings.TrimSpace(columnName) == "" {
			addErr("customDetails entries require non-empty key and column name")
			continue
		}
		if !queryReferencesColumn(rule.Query, columnName) {
			addWarn("custom detail column %q is not obviously projected or extended in the query", columnName)
		}
	}
	if rule.AlertDetailsOverride != nil {
		for label, column := range map[string]string{
			"alertTacticsColumnName":  rule.AlertDetailsOverride.AlertTacticsColumnName,
			"alertSeverityColumnName": rule.AlertDetailsOverride.AlertSeverityColumnName,
		} {
			if strings.TrimSpace(column) != "" && !queryReferencesColumn(rule.Query, column) {
				addWarn("%s column %q is not obviously projected or extended in the query", label, column)
			}
		}
	}

	if rule.EventGroupingSettings != nil && strings.TrimSpace(rule.EventGroupingSettings.AggregationKind) != "" {
		if !containsString(possibleEventGroupingKinds(), rule.EventGroupingSettings.AggregationKind) {
			addErr("eventGroupingSettings.aggregationKind is not supported: %s", rule.EventGroupingSettings.AggregationKind)
		}
	}
	if rule.IncidentConfiguration != nil && rule.IncidentConfiguration.GroupingConfiguration != nil {
		grouping := rule.IncidentConfiguration.GroupingConfiguration
		if strings.TrimSpace(grouping.LookbackDuration) != "" {
			if _, err := parseISODuration(grouping.LookbackDuration); err != nil {
				addErr("incidentConfiguration.groupingConfiguration.lookbackDuration must be ISO8601: %v", err)
			}
		}
		if strings.TrimSpace(grouping.MatchingMethod) != "" && !containsString(possibleMatchingMethods(), grouping.MatchingMethod) {
			addErr("incidentConfiguration.groupingConfiguration.matchingMethod is not supported: %s", grouping.MatchingMethod)
		}
		for _, entityType := range grouping.GroupByEntities {
			if !containsString(possibleEntityMappingTypes(), entityType) {
				addErr("incidentConfiguration.groupingConfiguration.groupByEntities contains unsupported entity type: %s", entityType)
			}
		}
		for _, alertDetail := range grouping.GroupByAlertDetails {
			if !containsString(possibleAlertDetails(), alertDetail) {
				addErr("incidentConfiguration.groupingConfiguration.groupByAlertDetails contains unsupported alert detail: %s", alertDetail)
			}
		}
	}
	if strings.TrimSpace(rule.SuppressionDuration) != "" {
		if _, err := parseISODuration(rule.SuppressionDuration); err != nil {
			addErr("suppressionDuration must be ISO8601: %v", err)
		}
	}

	return validation
}

func BuildValidationReport(validations []RuleValidation) ValidationReport {
	report := ValidationReport{
		GeneratedAt: time.Now().UTC().Format(time.RFC3339),
		Rules:       validations,
	}
	report.Summary.Total = len(validations)
	for _, validation := range validations {
		if len(validation.Errors) == 0 {
			report.Summary.Passed++
		} else {
			report.Summary.Failed++
		}
		report.Summary.Warnings += len(validation.Warnings)
	}
	return report
}

func ExplainRule(rule SentinelRule, validation RuleValidation) string {
	var builder strings.Builder
	fmt.Fprintf(&builder, "\nRule: %s\n", rule.DisplayName)
	fmt.Fprintf(&builder, "  ID: %s\n", rule.ID)
	fmt.Fprintf(&builder, "  Status: %s (enabled=%t)\n", orDefault(rule.Status, "Enabled"), validation.Enabled)
	fmt.Fprintf(&builder, "  Severity: %s\n", rule.Severity)
	fmt.Fprintf(&builder, "  Data sources: %s\n", strings.Join(validation.DataSources, ", "))
	fmt.Fprintf(&builder, "  Frequency/lookback: %s / %s\n", orDefault(rule.QueryFrequency, defaultQueryFrequency), orDefault(rule.QueryPeriod, defaultQueryPeriod))
	fmt.Fprintf(&builder, "  Trigger: %s %d\n", orDefault(rule.TriggerOperator, "GreaterThan"), rule.TriggerThreshold)
	fmt.Fprintf(&builder, "  Entities mapped: %s\n", strings.Join(validation.EntityMappings, ", "))
	if len(validation.CustomDetails) > 0 {
		fmt.Fprintf(&builder, "  Custom details: %s\n", strings.Join(validation.CustomDetails, ", "))
	}
	if rule.AlertDetailsOverride != nil {
		fmt.Fprintf(&builder, "  Alert details override: enabled\n")
	}
	if rule.IncidentConfiguration != nil {
		fmt.Fprintf(&builder, "  Incident configuration: enabled\n")
	}
	if rule.EventGroupingSettings != nil {
		fmt.Fprintf(&builder, "  Event grouping: %s\n", rule.EventGroupingSettings.AggregationKind)
	}
	fmt.Fprintf(&builder, "  MITRE tactics: %s\n", strings.Join(rule.Tactics, ", "))
	fmt.Fprintf(&builder, "  MITRE techniques: %s\n", strings.Join(rule.Techniques, ", "))
	fmt.Fprintf(&builder, "  ARM deployment: scheduled analytics rule would be created or updated in Sentinel when -apply is used.\n")
	for _, warning := range validation.Warnings {
		fmt.Fprintf(&builder, "  Warning: %s\n", warning)
	}
	return builder.String()
}

// buildScheduledRule maps the YAML schema onto the ARM ScheduledAlertRule payload.
func buildScheduledRule(rule SentinelRule) *armsecurityinsights.ScheduledAlertRule {
	kind := armsecurityinsights.AlertRuleKindScheduled
	severity := mapSeverity(rule.Severity)
	triggerOp := armsecurityinsights.TriggerOperator(orDefault(rule.TriggerOperator, "GreaterThan"))

	return &armsecurityinsights.ScheduledAlertRule{
		Kind: &kind,
		Properties: &armsecurityinsights.ScheduledAlertRuleProperties{
			DisplayName:           ptr(rule.DisplayName),
			Description:           ptr(rule.Description),
			Severity:              &severity,
			Enabled:               ptr(ruleEnabled(rule)),
			Query:                 ptr(rule.Query),
			QueryFrequency:        ptr(orDefault(rule.QueryFrequency, defaultQueryFrequency)),
			QueryPeriod:           ptr(orDefault(rule.QueryPeriod, defaultQueryPeriod)),
			TriggerOperator:       &triggerOp,
			TriggerThreshold:      ptr(rule.TriggerThreshold),
			SuppressionDuration:   ptr(orDefault(rule.SuppressionDuration, defaultSuppressionDuration)),
			SuppressionEnabled:    ptr(boolValue(rule.SuppressionEnabled, false)),
			Tactics:               buildTactics(rule.Tactics),
			EntityMappings:        buildEntityMappings(rule.EntityMappings),
			CustomDetails:         buildCustomDetails(rule.CustomDetails),
			AlertDetailsOverride:  buildAlertDetailsOverride(rule.AlertDetailsOverride),
			IncidentConfiguration: buildIncidentConfiguration(rule.IncidentConfiguration),
			EventGroupingSettings: buildEventGroupingSettings(rule.EventGroupingSettings),
			TemplateVersion:       ptrOrNil(rule.Version),
		},
	}
}

func buildTactics(tactics []string) []*armsecurityinsights.AttackTactic {
	out := make([]*armsecurityinsights.AttackTactic, 0, len(tactics))
	for _, tactic := range tactics {
		t := armsecurityinsights.AttackTactic(tactic)
		out = append(out, &t)
	}
	return out
}

func buildEntityMappings(mappings []RuleEntityMapping) []*armsecurityinsights.EntityMapping {
	out := make([]*armsecurityinsights.EntityMapping, 0, len(mappings))
	for _, mapping := range mappings {
		entityType := armsecurityinsights.EntityMappingType(mapping.EntityType)
		fields := make([]*armsecurityinsights.FieldMapping, 0, len(mapping.FieldMappings))
		for _, field := range mapping.FieldMappings {
			fields = append(fields, &armsecurityinsights.FieldMapping{
				Identifier: ptr(field.Identifier),
				ColumnName: ptr(field.ColumnName),
			})
		}
		out = append(out, &armsecurityinsights.EntityMapping{
			EntityType:    &entityType,
			FieldMappings: fields,
		})
	}
	return out
}

func buildCustomDetails(details map[string]string) map[string]*string {
	if len(details) == 0 {
		return nil
	}
	out := make(map[string]*string, len(details))
	for key, value := range details {
		v := value
		out[key] = &v
	}
	return out
}

func buildAlertDetailsOverride(override *AlertDetailsOverride) *armsecurityinsights.AlertDetailsOverride {
	if override == nil {
		return nil
	}
	return &armsecurityinsights.AlertDetailsOverride{
		AlertDisplayNameFormat:  ptrOrNil(override.AlertDisplayNameFormat),
		AlertDescriptionFormat:  ptrOrNil(override.AlertDescriptionFormat),
		AlertTacticsColumnName:  ptrOrNil(override.AlertTacticsColumnName),
		AlertSeverityColumnName: ptrOrNil(override.AlertSeverityColumnName),
	}
}

func buildIncidentConfiguration(config *IncidentConfiguration) *armsecurityinsights.IncidentConfiguration {
	if config == nil {
		return nil
	}
	return &armsecurityinsights.IncidentConfiguration{
		CreateIncident:        ptr(boolValue(config.CreateIncident, true)),
		GroupingConfiguration: buildGroupingConfiguration(config.GroupingConfiguration),
	}
}

func buildGroupingConfiguration(config *GroupingConfiguration) *armsecurityinsights.GroupingConfiguration {
	if config == nil {
		return nil
	}
	matchingMethod := armsecurityinsights.MatchingMethod(orDefault(config.MatchingMethod, string(armsecurityinsights.MatchingMethodAllEntities)))
	out := &armsecurityinsights.GroupingConfiguration{
		Enabled:              ptr(boolValue(config.Enabled, false)),
		LookbackDuration:     ptr(orDefault(config.LookbackDuration, defaultQueryPeriod)),
		MatchingMethod:       &matchingMethod,
		ReopenClosedIncident: ptr(boolValue(config.ReopenClosedIncident, false)),
		GroupByCustomDetails: ptrStringSlice(config.GroupByCustomDetails),
	}
	for _, entityType := range config.GroupByEntities {
		t := armsecurityinsights.EntityMappingType(entityType)
		out.GroupByEntities = append(out.GroupByEntities, &t)
	}
	for _, alertDetail := range config.GroupByAlertDetails {
		detail := armsecurityinsights.AlertDetail(alertDetail)
		out.GroupByAlertDetails = append(out.GroupByAlertDetails, &detail)
	}
	return out
}

func buildEventGroupingSettings(settings *EventGroupingSettings) *armsecurityinsights.EventGroupingSettings {
	if settings == nil || strings.TrimSpace(settings.AggregationKind) == "" {
		return nil
	}
	kind := armsecurityinsights.EventGroupingAggregationKind(settings.AggregationKind)
	return &armsecurityinsights.EventGroupingSettings{AggregationKind: &kind}
}

func ruleEnabled(rule SentinelRule) bool {
	status := strings.ToLower(strings.TrimSpace(rule.Status))
	if status == "disabled" || status == "off" || status == "inactive" {
		return false
	}
	return boolValue(rule.Enabled, true)
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

func parseISODuration(value string) (time.Duration, error) {
	trimmed := strings.TrimSpace(value)
	if trimmed == "" {
		return 0, fmt.Errorf("value is empty")
	}
	matches := regexp.MustCompile(`^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$`).FindStringSubmatch(trimmed)
	if matches == nil {
		return 0, fmt.Errorf("%q is not a supported ISO8601 duration", value)
	}
	if matches[1] == "" && matches[2] == "" && matches[3] == "" && matches[4] == "" {
		return 0, fmt.Errorf("%q does not include a duration component", value)
	}
	parts := []time.Duration{24 * time.Hour, time.Hour, time.Minute, time.Second}
	var duration time.Duration
	for i := 1; i < len(matches); i++ {
		if matches[i] == "" {
			continue
		}
		var number int
		if _, err := fmt.Sscanf(matches[i], "%d", &number); err != nil {
			return 0, err
		}
		duration += time.Duration(number) * parts[i-1]
	}
	return duration, nil
}

func queryReferencesColumn(query, column string) bool {
	column = strings.TrimSpace(column)
	if column == "" {
		return false
	}
	pattern := regexp.MustCompile(`(?i)(^|[^A-Za-z0-9_])` + regexp.QuoteMeta(column) + `([^A-Za-z0-9_]|$)`)
	return pattern.MatchString(query)
}

func connectorSummary(connectors []RequiredDataConnector) []string {
	var out []string
	for _, connector := range connectors {
		for _, dataType := range connector.DataTypes {
			out = append(out, fmt.Sprintf("%s/%s", connector.ConnectorID, dataType))
		}
	}
	sort.Strings(out)
	return out
}

func entityMappingSummary(mappings []RuleEntityMapping) []string {
	var out []string
	for _, mapping := range mappings {
		for _, field := range mapping.FieldMappings {
			out = append(out, fmt.Sprintf("%s.%s=%s", mapping.EntityType, field.Identifier, field.ColumnName))
		}
	}
	sort.Strings(out)
	return out
}

func sortedMapKeys(values map[string]string) []string {
	out := make([]string, 0, len(values))
	for key := range values {
		out = append(out, key)
	}
	sort.Strings(out)
	return out
}

func validSeverities() []string {
	return []string{"Informational", "Low", "Medium", "High"}
}

func possibleTriggerOperators() []string {
	values := armsecurityinsights.PossibleTriggerOperatorValues()
	out := make([]string, 0, len(values))
	for _, value := range values {
		out = append(out, string(value))
	}
	return out
}

func possibleAttackTactics() []string {
	values := armsecurityinsights.PossibleAttackTacticValues()
	out := make([]string, 0, len(values))
	for _, value := range values {
		out = append(out, string(value))
	}
	return out
}

func possibleEntityMappingTypes() []string {
	values := armsecurityinsights.PossibleEntityMappingTypeValues()
	out := make([]string, 0, len(values))
	for _, value := range values {
		out = append(out, string(value))
	}
	return out
}

func possibleEventGroupingKinds() []string {
	values := armsecurityinsights.PossibleEventGroupingAggregationKindValues()
	out := make([]string, 0, len(values))
	for _, value := range values {
		out = append(out, string(value))
	}
	return out
}

func possibleMatchingMethods() []string {
	values := armsecurityinsights.PossibleMatchingMethodValues()
	out := make([]string, 0, len(values))
	for _, value := range values {
		out = append(out, string(value))
	}
	return out
}

func possibleAlertDetails() []string {
	values := armsecurityinsights.PossibleAlertDetailValues()
	out := make([]string, 0, len(values))
	for _, value := range values {
		out = append(out, string(value))
	}
	return out
}

func containsString(values []string, want string) bool {
	for _, value := range values {
		if strings.EqualFold(value, strings.TrimSpace(want)) {
			return true
		}
	}
	return false
}

func ptr[T any](v T) *T { return &v }

func ptrOrNil(v string) *string {
	if strings.TrimSpace(v) == "" {
		return nil
	}
	return &v
}

func ptrStringSlice(values []string) []*string {
	if len(values) == 0 {
		return nil
	}
	out := make([]*string, 0, len(values))
	for _, value := range values {
		v := value
		out = append(out, &v)
	}
	return out
}

func boolValue(v *bool, fallback bool) bool {
	if v == nil {
		return fallback
	}
	return *v
}

func orDefault(v, fallback string) string {
	if strings.TrimSpace(v) == "" {
		return fallback
	}
	return v
}
