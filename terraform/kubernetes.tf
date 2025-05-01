resource "helm_release" "argocd" {
  depends_on = [
    azurerm_kubernetes_cluster.aks
  ]
  
  name = "argocd"

  repository       = "https://argoproj.github.io/argo-helm"
  chart            = "argo-cd"
  namespace        = "argocd"
  create_namespace = true

  values = [file("values/argocd.yaml")]
}

resource "helm_release" "updater" {
  depends_on = [
    azurerm_kubernetes_cluster.aks
  ]

  name = "updater"

  repository       = "https://argoproj.github.io/argo-helm"
  chart            = "argocd-image-updater"
  namespace        = "argocd"
  create_namespace = true

  values = [file("values/image-updater.yaml")]
}

# Role to grant access to secrets in default namespace
resource "kubernetes_role" "updater_secret_reader" {
  depends_on = [
    helm_release.updater
  ]

  metadata {
    name      = "updater-secret-reader"
    namespace = "default"
  }

  rule {
    api_groups = [""]
    resources  = ["secrets"]
    verbs      = ["get", "list", "watch"]
  }
}

# Role binding to attach the role to the updater's service account
resource "kubernetes_role_binding" "updater_secret_reader_binding" {
  depends_on = [
    kubernetes_role.updater_secret_reader,
    helm_release.updater
  ]

  metadata {
    name      = "updater-secret-reader-binding"
    namespace = "default"
  }

  role_ref {
    api_group = "rbac.authorization.k8s.io"
    kind      = "Role"
    name      = kubernetes_role.updater_secret_reader.metadata[0].name
  }

  subject {
    kind      = "ServiceAccount"
    name      = "updater-argocd-image-updater"
    namespace = "argocd"
  }
}