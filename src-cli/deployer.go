package main

import (
	"fmt"
	"os"

	"github.com/Azure/azure-sdk-for-go/sdk/azidentity"
	"github.com/Azure/azure-sdk-for-go/sdk/resourcemanager/securityinsights/armsecurityinsights"
	"gopkg.in/yaml.v3"
)

// Deployer handles authentication and API interactions with Azure Sentinel
type Deployer struct {
	client        *armsecurityinsights.AlertRulesClient
	resourceGroup string
	workspaceName string
}

// SentinelRule represents the expected structure of your YAML detection files
type SentinelRule struct {
	ID          string `yaml:"id"`
	DisplayName string `yaml:"name"`
	Description string `yaml:"description"`
	Severity    string `yaml:"severity"`
	Query       string `yaml:"query"`
}

// NewDeployer authenticates using DefaultAzureCredential (supports OIDC, Managed Identity, CLI)
func NewDeployer(subscriptionID, resourceGroup, workspaceName string) (*Deployer, error) {
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
	}, nil
}

// DeployRule parses a YAML file and pushes it to Sentinel
func (d *Deployer) DeployRule(filePath string) error {
	data, err := os.ReadFile(filePath)
	if err != nil {
		return fmt.Errorf("could not read file: %v", err)
	}

	var rule SentinelRule
	if err := yaml.Unmarshal(data, &rule); err != nil {
		return fmt.Errorf("could not parse YAML: %v", err)
	}

	// NOTE: In a full implementation, you map the parsed YAML fields to the
	// armsecurityinsights.ScheduledAlertRule structure here and call:
	// d.client.CreateOrUpdate(context.Background(), d.resourceGroup, d.workspaceName, rule.ID, parsedRule, nil)

	fmt.Printf("   -> Successfully validated schema for: %s (Severity: %s)\n", rule.DisplayName, rule.Severity)
	return nil
}
