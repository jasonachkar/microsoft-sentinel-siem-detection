package main

import (
	"flag"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"strings"
)

func main() {
	// Define CLI Flags
	subscriptionID := flag.String("sub", "", "Azure Subscription ID")
	resourceGroup := flag.String("rg", "", "Azure Resource Group")
	workspaceName := flag.String("workspace", "", "Sentinel Workspace Name")
	rulesDir := flag.String("dir", "../rules-yaml", "Directory containing YAML rules")
	flag.Parse()

	if *subscriptionID == "" || *resourceGroup == "" || *workspaceName == "" {
		log.Fatal("Error: -sub, -rg, and -workspace flags are required.")
	}

	fmt.Println("🚀 Initializing Sentinel Deployment Tool (Go-SecOps)")

	// Initialize Azure Deployer
	deployer, err := NewDeployer(*subscriptionID, *resourceGroup, *workspaceName)
	if err != nil {
		log.Fatalf("Failed to initialize Azure Deployer: %v", err)
	}

	// Traverse the directory and process YAML files
	err = filepath.Walk(*rulesDir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		if !info.IsDir() && (strings.HasSuffix(info.Name(), ".yaml") || strings.HasSuffix(info.Name(), ".yml")) {
			fmt.Printf("📦 Processing Rule: %s\n", info.Name())
			if err := deployer.DeployRule(path); err != nil {
				log.Printf("⚠️ Failed to deploy %s: %v", info.Name(), err)
			}
		}
		return nil
	})

	if err != nil {
		log.Fatalf("Error walking rules directory: %v", err)
	}

	fmt.Println("✅ Deployment execution completed.")
}
