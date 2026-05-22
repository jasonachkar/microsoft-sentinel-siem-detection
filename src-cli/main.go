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
	rulesDir := flag.String("dir", "../sentinel-detection-pack/rules-yaml", "Directory containing YAML rules")
	apply := flag.Bool("apply", false, "Apply changes to Sentinel. Default is a safe dry-run (validate + map only).")
	flag.Parse()

	if *subscriptionID == "" || *resourceGroup == "" || *workspaceName == "" {
		log.Fatal("Error: -sub, -rg, and -workspace flags are required.")
	}

	mode := "DRY-RUN"
	if *apply {
		mode = "APPLY"
	}
	fmt.Printf("🚀 Initializing Sentinel Deployment Tool (Go-SecOps) [mode=%s]\n", mode)

	// Initialize Azure Deployer
	deployer, err := NewDeployer(*subscriptionID, *resourceGroup, *workspaceName, *apply)
	if err != nil {
		log.Fatalf("Failed to initialize Azure Deployer: %v", err)
	}

	// Traverse the directory and process YAML files
	var processed, failed int
	err = filepath.Walk(*rulesDir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		if !info.IsDir() && (strings.HasSuffix(info.Name(), ".yaml") || strings.HasSuffix(info.Name(), ".yml")) {
			fmt.Printf("📦 Processing Rule: %s\n", info.Name())
			if err := deployer.DeployRule(path); err != nil {
				log.Printf("⚠️ Failed to deploy %s: %v", info.Name(), err)
				failed++
			} else {
				processed++
			}
		}
		return nil
	})

	if err != nil {
		log.Fatalf("Error walking rules directory: %v", err)
	}

	fmt.Printf("✅ Deployment execution completed. (%d processed, %d failed)\n", processed, failed)
	if failed > 0 {
		os.Exit(1)
	}
}
