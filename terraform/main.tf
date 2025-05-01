terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 1.0"
    }
  }
  
  # This backend configuration should be uncommented after the storage account and container are created
  backend "azurerm" {
    resource_group_name  = "terraform-backend-rg"
    storage_account_name = "tfstate20250430"
    container_name       = "tfstate"
    key                  = "terraform.tfstate"
  }
}

provider "azurerm" {
  features {}
}

provider "helm" {
  kubernetes {
    config_path = "~/.kube/config"
    config_context = "aks-cluster"
  }
}

provider "kubernetes" {
  config_path = "~/.kube/config"
  config_context = "aks-cluster"
}

# Resource Group
resource "azurerm_resource_group" "aks" {
  name     = "esd-aks-rg"
  location = "southeastasia"
}

# AKS Cluster
resource "azurerm_kubernetes_cluster" "aks" {
  name                = "aks-cluster"
  location            = azurerm_resource_group.aks.location
  resource_group_name = azurerm_resource_group.aks.name
  dns_prefix         = "aks-cluster"

  default_node_pool {
    name       = "default"
    node_count = 1
    vm_size    = "standard_a2_v2"

    upgrade_settings {
      drain_timeout_in_minutes      = 0 
      max_surge                     = "10%" 
      node_soak_duration_in_minutes = 0 
    }
  }

  identity {
    type = "SystemAssigned"
  }

  network_profile {
    network_plugin = "azure"
    network_policy = "azure"
  }
}

data "azurerm_resource_group" "acr_rg" {
  name = "esd-cr-rg"
}

data "azurerm_container_registry" "acr" {
  name                = "esdproject"
  resource_group_name = data.azurerm_resource_group.acr_rg.name
}

# Attach ACR to AKS by granting AcrPull role
resource "azurerm_role_assignment" "aks_acr" {
  principal_id                     = azurerm_kubernetes_cluster.aks.identity[0].principal_id
  role_definition_name             = "AcrPull"
  scope                            = data.azurerm_container_registry.acr.id
  skip_service_principal_aad_check = true
}

# Outputs
output "kube_config" {
  value     = azurerm_kubernetes_cluster.aks.kube_config_raw
  sensitive = true
}

output "cluster_name" {
  value = azurerm_kubernetes_cluster.aks.name
}
