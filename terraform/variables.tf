variable "location" {
  default = "belgiumcentral"   # o "belgium" si chilecentral no está disponible
}

variable "resource_group_name" { default = "restauranty-latino-rg" }
variable "aks_name"            { default = "restauranty-latino-aks" }

resource "azurerm_resource_group" "rg" {
  name     = var.resource_group_name
  location = var.location
}