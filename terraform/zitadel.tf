resource "helm_release" "zitadel" {
  depends_on = [
    azurerm_kubernetes_cluster.aks
  ]
  
  name = "zitadel"

  repository       = "https://charts.zitadel.com"
  chart            = "zitadel"
  namespace        = "default"
  create_namespace = true
  replace          = true

  values = [file("values/zitadel.yaml")]
}

resource "kubernetes_secret" "zitadel_config" {
  metadata {
    name = "zitadel-config"
    namespace = "default"
  }

  data = {
    "config.yaml" = file("values/zitadel-config.yaml")
  }
}
