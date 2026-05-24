# This module deploys a lab SOAR playbook shell via Azure Logic Apps.
# Containment permissions are opt-in and should be scoped to an approved lab target.
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

variable "enable_network_containment_role" {
  type        = bool
  description = "Opt-in switch for granting Network Contributor to the playbook identity in a lab containment scope."
  default     = false
}

variable "containment_scope_resource_group_id" {
  type        = string
  description = "Optional resource group ID containing lab NSGs that the playbook is allowed to modify."
  default     = ""
}

resource "azurerm_resource_group" "soar" {
  name     = "rg-sentinel-soar-lab"
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

# Least privilege: Network Contributor is disabled by default and must be explicitly
# enabled for a lab resource group. Do not scope this to the whole subscription.
resource "azurerm_role_assignment" "soar_network_contributor" {
  count                = var.enable_network_containment_role ? 1 : 0
  scope                = var.containment_scope_resource_group_id != "" ? var.containment_scope_resource_group_id : azurerm_resource_group.soar.id
  role_definition_name = "Network Contributor"
  principal_id         = azurerm_logic_app_workflow.isolate_host.identity[0].principal_id
}

# NOTE: Revoking Entra ID sessions is a Microsoft Graph (directory) permission, not an
# Azure RBAC role. In production, grant this managed identity the Graph app role
# (e.g. User.RevokeSessions.All) via the azuread provider. It is intentionally NOT a
# subscription-scoped "User Administrator" assignment, which would be wildly over-privileged.
