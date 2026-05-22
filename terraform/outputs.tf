output "resource_group_name" {
  description = "The name of the created Resource Group."
  value       = azurerm_resource_group.secops.name
}

output "log_analytics_workspace_id" {
  description = "The Workspace ID (Used for agent connections and API calls)."
  value       = azurerm_log_analytics_workspace.sentinel.workspace_id
}

output "log_analytics_workspace_name" {
  description = "The actual Azure resource name of the workspace."
  value       = azurerm_log_analytics_workspace.sentinel.name
}