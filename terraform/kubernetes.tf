resource "helm_release" "argocd" {
  depends_on = [
    azurerm_kubernetes_cluster.aks
  ]
  
  name = "argocd"

  repository       = "https://argoproj.github.io/argo-helm"
  chart            = "argo-cd"
  namespace        = "argocd"
  create_namespace = true
  replace          = true

  values = [file("values/argocd.yaml")]
}
resource "kubernetes_secret" "argocd_image_updater_acr" {
  metadata {
    name      = "argocd-image-updater"
    namespace = "argocd"
  }

  data = {
    ".dockerconfigjson" = jsonencode({
      auths = {
        "${data.azurerm_container_registry.acr.login_server}" = {
          auth = base64encode("${data.azurerm_container_registry.acr.admin_username}:${data.azurerm_container_registry.acr.admin_password}")
        }
      }
    })
  }
}

resource "kubernetes_secret" "default_acr" {
  metadata {
    name      = "acr-secret"
    namespace = "default"
  }

  data = {
    ".dockerconfigjson" = jsonencode({
      auths = {
        "${data.azurerm_container_registry.acr.login_server}" = {
          auth = base64encode("${data.azurerm_container_registry.acr.admin_username}:${data.azurerm_container_registry.acr.admin_password}")
        }
      }
    })
  }
}

resource "helm_release" "updater" {
  depends_on = [
    azurerm_kubernetes_cluster.aks,
  ]

  name = "updater"

  repository       = "https://argoproj.github.io/argo-helm"
  chart            = "argocd-image-updater"
  namespace        = "argocd"
  create_namespace = true
  replace          = true

  values = [file("values/image-updater.yaml")]
}