terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }
  required_version = ">= 1.0.0"

  # Remote state in Azure Storage so the nightly drift-detection workflow can run
  # `terraform plan` against the real, shared state. Configured at init time via
  # `-backend-config` (see .github/workflows/drift-detection.yaml). For local-only
  # experimentation, run `terraform init -backend=false`.
  backend "azurerm" {}
}

provider "azurerm" {
  features {}
}