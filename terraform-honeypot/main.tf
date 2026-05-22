# This Terraform module provisions a temporary Windows Honeypot for attack simulation
terraform {
  required_providers {
    azurerm = { source = "hashicorp/azurerm", version = "~> 3.0" }
  }
}

provider "azurerm" {
  features {}
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
  admin_password        = "REDACTED_ROTATED_CREDENTIAL" # Temporary, destroyed after test
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
