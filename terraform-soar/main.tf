# This module deploys a SOAR auto-remediation playbook via Azure Logic Apps.
terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }
}

provider "azurerm" {
  features {}
}

variable "location" {
  type        = string
  description = "Azure region for the SOAR resource group."
  default     = "eastus"
}

resource "azurerm_resource_group" "soar" {
  name     = "rg-sentinel-soar-prod"
  location = var.location
}

# The Logic App Workflow (the SOAR playbook).
resource "azurerm_logic_app_workflow" "isolate_host" {
  name                = "playbook-isolate-compromised-host"
  location            = azurerm_resource_group.soar.location
  resource_group_name = azurerm_resource_group.soar.name

  identity {
    type = "SystemAssigned"
  }
}

# Least privilege: Network Contributor scoped to the SOAR resource group ONLY, not the
# whole subscription. The playbook isolates a compromised host by modifying the NSGs
# delegated into this resource group, so it never needs subscription-wide write access.
resource "azurerm_role_assignment" "soar_network_contributor" {
  scope                = azurerm_resource_group.soar.id
  role_definition_name = "Network Contributor"
  principal_id         = azurerm_logic_app_workflow.isolate_host.identity[0].principal_id
}

# NOTE: Revoking Entra ID sessions is a Microsoft Graph (directory) permission, not an
# Azure RBAC role. In production, grant this managed identity the Graph app role
# (e.g. User.RevokeSessions.All) via the azuread provider. It is intentionally NOT a
# subscription-scoped "User Administrator" assignment, which would be wildly over-privileged.
