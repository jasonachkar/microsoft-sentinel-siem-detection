variable "resource_group_name" {
  type        = string
  description = "The name of the resource group for Sentinel infrastructure."
  default     = "rg-sentinel-secops-prod"
}

variable "location" {
  type        = string
  description = "The Azure region to deploy resources."
  default     = "eastus"
}

variable "workspace_name" {
  type        = string
  description = "The name of the Log Analytics workspace."
  default     = "law-sentinel-secops-prod"
}

variable "retention_in_days" {
  type        = number
  description = "The workspace data retention in days (Minimum 30 for Sentinel, 90 recommended for prod)."
  default     = 90
}