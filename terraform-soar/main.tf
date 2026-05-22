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

resource "azurerm_resource_group" "soar" {
  name     = "rg-sentinel-soar-prod"
  location = "eastus"
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

# Assign least-privilege RBAC to the SOAR playbook so it can modify Network Security Groups.
resource "azurerm_role_assignment" "soar_network_contributor" {
  scope                = "/subscriptions/00000000-0000-0000-0000-000000000000"
  role_definition_name = "Network Contributor"
  principal_id         = azurerm_logic_app_workflow.isolate_host.identity[0].principal_id
}

# Assign role to revoke Entra ID sessions.
resource "azurerm_role_assignment" "soar_user_admin" {
  scope                = "/subscriptions/00000000-0000-0000-0000-000000000000"
  role_definition_name = "User Administrator"
  principal_id         = azurerm_logic_app_workflow.isolate_host.identity[0].principal_id
}
