# Azure Policy enforcement layer — turns "detect" controls into "prevent".
# Deploys custom deny/audit policy definitions plus the built-in Microsoft Cloud
# Security Benchmark initiative, assigned at subscription scope. This is the
# preventative complement to the Sentinel detections: misconfigurations are
# blocked at deployment time, not just alerted on after the fact.
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

variable "subscription_id" {
  type        = string
  description = "Target subscription ID (GUID) for policy assignment."
  default     = "00000000-0000-0000-0000-000000000000"
}

variable "location" {
  type        = string
  description = "Region for policy assignment managed identities."
  default     = "eastus"
}

locals {
  subscription_scope = "/subscriptions/${var.subscription_id}"
}

# 1. Deny storage accounts that do not enforce HTTPS-only (secure transfer).
resource "azurerm_policy_definition" "require_https_storage" {
  name         = "deny-storage-without-secure-transfer"
  policy_type  = "Custom"
  mode         = "Indexed"
  display_name = "Deny storage accounts without secure transfer (HTTPS)"
  description  = "Blocks creation of storage accounts that allow unencrypted HTTP traffic."

  policy_rule = jsonencode({
    if = {
      allOf = [
        { field = "type", equals = "Microsoft.Storage/storageAccounts" },
        { field = "Microsoft.Storage/storageAccounts/supportsHttpsTrafficOnly", notEquals = "true" }
      ]
    }
    then = { effect = "deny" }
  })
}

# 2. Deny public network access on storage accounts.
resource "azurerm_policy_definition" "deny_public_storage" {
  name         = "deny-storage-public-network-access"
  policy_type  = "Custom"
  mode         = "Indexed"
  display_name = "Deny storage accounts with public network access enabled"
  description  = "Blocks storage accounts that are reachable from the public internet."

  policy_rule = jsonencode({
    if = {
      allOf = [
        { field = "type", equals = "Microsoft.Storage/storageAccounts" },
        { field = "Microsoft.Storage/storageAccounts/publicNetworkAccess", notEquals = "Disabled" }
      ]
    }
    then = { effect = "deny" }
  })
}

# 3. Audit virtual machines that are missing managed-disk encryption settings.
resource "azurerm_policy_definition" "audit_unencrypted_vm" {
  name         = "audit-vm-without-encryption-at-host"
  policy_type  = "Custom"
  mode         = "Indexed"
  display_name = "Audit VMs without encryption at host"
  description  = "Flags virtual machines that do not have encryption at host enabled."

  policy_rule = jsonencode({
    if = {
      allOf = [
        { field = "type", equals = "Microsoft.Compute/virtualMachines" },
        { field = "Microsoft.Compute/virtualMachines/securityProfile.encryptionAtHost", notEquals = "true" }
      ]
    }
    then = { effect = "audit" }
  })
}

# Assign the custom deny policies at subscription scope.
resource "azurerm_subscription_policy_assignment" "require_https_storage" {
  name                 = "require-https-storage"
  display_name         = "Deny storage without HTTPS"
  subscription_id      = local.subscription_scope
  policy_definition_id = azurerm_policy_definition.require_https_storage.id
}

resource "azurerm_subscription_policy_assignment" "deny_public_storage" {
  name                 = "deny-public-storage"
  display_name         = "Deny public storage network access"
  subscription_id      = local.subscription_scope
  policy_definition_id = azurerm_policy_definition.deny_public_storage.id
}

resource "azurerm_subscription_policy_assignment" "audit_unencrypted_vm" {
  name                 = "audit-vm-encryption"
  display_name         = "Audit VMs without encryption at host"
  subscription_id      = local.subscription_scope
  policy_definition_id = azurerm_policy_definition.audit_unencrypted_vm.id
}

# 4. Assign the built-in Microsoft Cloud Security Benchmark initiative for
#    continuous, audit-wide compliance baselining.
data "azurerm_policy_set_definition" "mcsb" {
  display_name = "Microsoft cloud security benchmark"
}

resource "azurerm_subscription_policy_assignment" "mcsb" {
  name                 = "mcsb-baseline"
  display_name         = "Microsoft Cloud Security Benchmark"
  subscription_id      = local.subscription_scope
  policy_definition_id = data.azurerm_policy_set_definition.mcsb.id
  location             = var.location

  identity {
    type = "SystemAssigned"
  }
}
