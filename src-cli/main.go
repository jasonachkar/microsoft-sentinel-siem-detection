package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"strings"
)

func main() {
	subscriptionID := flag.String("sub", "", "Azure Subscription ID")
	resourceGroup := flag.String("rg", "", "Azure Resource Group")
	workspaceName := flag.String("workspace", "", "Sentinel workspace name")
	rulesDir := flag.String("dir", "../sentinel-detection-pack/rules-yaml", "Directory containing YAML rules")
	apply := flag.Bool("apply", false, "Apply changes to Sentinel. Default is dry-run validation and mapping only.")
	dryRun := flag.Bool("dry-run", false, "Force dry-run mode even when other flags are present.")
	explain := flag.Bool("explain", false, "Print a reviewer-friendly explanation of each mapped rule during dry-run.")
	validateJSON := flag.Bool("validate-json", false, "Write validation report JSON to stdout unless -output is set.")
	output := flag.String("output", "", "Optional path for validation report JSON.")
	flag.Parse()

	effectiveApply := *apply && !*dryRun
	if effectiveApply && (*subscriptionID == "" || *resourceGroup == "" || *workspaceName == "") {
		log.Fatal("Error: -sub, -rg, and -workspace are required when -apply is used.")
	}

	mode := "DRY-RUN"
	if effectiveApply {
		mode = "APPLY"
	}
	fmt.Printf("Initializing Sentinel Detection-as-Code deployer [mode=%s]\n", mode)

	deployer, err := NewDeployer(*subscriptionID, *resourceGroup, *workspaceName, effectiveApply, *explain)
	if err != nil {
		log.Fatalf("Failed to initialize deployer: %v", err)
	}

	var validations []RuleValidation
	var processed, failed int
	err = filepath.Walk(*rulesDir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		if info == nil || info.IsDir() {
			return nil
		}
		if !strings.HasSuffix(info.Name(), ".yaml") && !strings.HasSuffix(info.Name(), ".yml") {
			return nil
		}

		fmt.Printf("Processing rule: %s\n", info.Name())
		validation, deployErr := deployer.DeployRule(path)
		validations = append(validations, validation)
		if deployErr != nil {
			log.Printf("Failed to process %s: %v", info.Name(), deployErr)
			failed++
			return nil
		}
		processed++
		return nil
	})
	if err != nil {
		log.Fatalf("Error walking rules directory: %v", err)
	}

	report := BuildValidationReport(validations)
	if *validateJSON || strings.TrimSpace(*output) != "" {
		if err := writeValidationReport(report, *output); err != nil {
			log.Fatalf("Failed to write validation report: %v", err)
		}
	}

	fmt.Printf("Detection-as-Code run completed. (%d processed, %d failed, %d warnings)\n", processed, failed, report.Summary.Warnings)
	if failed > 0 || report.Summary.Failed > 0 {
		os.Exit(1)
	}
}

func writeValidationReport(report ValidationReport, outputPath string) error {
	data, err := json.MarshalIndent(report, "", "  ")
	if err != nil {
		return err
	}
	if strings.TrimSpace(outputPath) == "" {
		fmt.Println(string(data))
		return nil
	}
	return os.WriteFile(outputPath, append(data, '\n'), 0o644)
}
