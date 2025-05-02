resource "helm_release" "zitadel" {
  depends_on = [
    azurerm_kubernetes_cluster.aks
  ]
  
  name = "zitadel"

  repository       = "https://zitadel.github.io/zitadel"
  chart            = "zitadel"
  namespace        = "default"
  create_namespace = true
  replace          = true

  values = [file("values/zitadel.yaml")]
}