resource "azurerm_resource_group" "secops" {
  name     = var.resource_group_name
  location = var.location

  tags = {
    Environment = "Production"
    Workload    = "SecurityOperations"
    ManagedBy   = "Terraform"
  }
}

resource "azurerm_log_analytics_workspace" "sentinel" {
  name                = var.workspace_name
  location            = azurerm_resource_group.secops.location
  resource_group_name = azurerm_resource_group.secops.name
  sku                 = "PerGB2018"
  retention_in_days   = var.retention_in_days

  tags = {
    Environment = "Production"
    Workload    = "SecurityOperations"
    ManagedBy   = "Terraform"
  }
}

resource "azurerm_log_analytics_solution" "sentinel" {
  solution_name         = "SecurityInsights"
  location              = azurerm_resource_group.secops.location
  resource_group_name   = azurerm_resource_group.secops.name
  workspace_resource_id = azurerm_log_analytics_workspace.sentinel.id
  workspace_name        = azurerm_log_analytics_workspace.sentinel.name

  plan {
    publisher = "Microsoft"
    product   = "OMSGallery/SecurityInsights"
  }
}