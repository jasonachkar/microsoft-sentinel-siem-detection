# This Terraform module provisions a temporary Windows honeypot for attack simulation.
# SECURITY: the admin credential is generated at apply time with random_password and is
# never committed to source control. For a production deployment, persist it to Azure
# Key Vault and reference it through a data source rather than emitting it as an output.
terraform {
  required_providers {
    azurerm = { source = "hashicorp/azurerm", version = "~> 3.0" }
    random  = { source = "hashicorp/random", version = "~> 3.6" }
  }
}

provider "azurerm" {
  features {}
}

# Generated at apply time - replaces the previously hard-coded plaintext password.
resource "random_password" "honeypot_admin" {
  length           = 24
  special          = true
  override_special = "!@#%*()-_=+"
  min_lower        = 2
  min_upper        = 2
  min_numeric      = 2
  min_special      = 2
}

resource "azurerm_resource_group" "honeypot" {
  name     = "rg-sentinel-honeypot-temp"
  location = "eastus"
}

resource "azurerm_virtual_network" "vnet" {
  name                = "vnet-honeypot"
  address_space       = ["10.0.0.0/16"]
  location            = azurerm_resource_group.honeypot.location
  resource_group_name = azurerm_resource_group.honeypot.name
}

resource "azurerm_subnet" "subnet" {
  name                 = "internal"
  resource_group_name  = azurerm_resource_group.honeypot.name
  virtual_network_name = azurerm_virtual_network.vnet.name
  address_prefixes     = ["10.0.2.0/24"]
}

resource "azurerm_network_interface" "nic" {
  name                = "nic-honeypot"
  location            = azurerm_resource_group.honeypot.location
  resource_group_name = azurerm_resource_group.honeypot.name

  ip_configuration {
    name                          = "internal"
    subnet_id                     = azurerm_subnet.subnet.id
    private_ip_address_allocation = "Dynamic"
  }
}

resource "azurerm_windows_virtual_machine" "honeypot_vm" {
  name                  = "vm-honeypot-01"
  resource_group_name   = azurerm_resource_group.honeypot.name
  location              = azurerm_resource_group.honeypot.location
  size                  = "Standard_B2s"
  admin_username        = "socadmin"
  admin_password        = random_password.honeypot_admin.result # generated, never committed
  network_interface_ids = [azurerm_network_interface.nic.id]

  os_disk {
    caching              = "ReadWrite"
    storage_account_type = "Standard_LRS"
  }

  source_image_reference {
    publisher = "MicrosoftWindowsServer"
    offer     = "WindowsServer"
    sku       = "2022-Datacenter"
    version   = "latest"
  }
}

output "honeypot_admin_password" {
  description = "Generated honeypot admin password. Retrieve with: terraform output -raw honeypot_admin_password"
  value       = random_password.honeypot_admin.result
  sensitive   = true
}
