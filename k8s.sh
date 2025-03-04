#!/bin/bash

# Default cluster name
CLUSTER_NAME=${2:-esd-test}
ACTION=$1

# Function to build and load images
build_and_load() {
  echo "Using Kind cluster: $CLUSTER_NAME"

  # Check if cluster exists
  if ! kind get clusters | grep -q "^$CLUSTER_NAME$"; then
    echo "Cluster $CLUSTER_NAME does not exist. Creating..."
    kind create cluster --name $CLUSTER_NAME
    echo "Cluster created successfully"
  else
    echo "Cluster $CLUSTER_NAME already exists"
  fi

  # Build images
  echo "Building Docker images..."
  # docker build -t esd-web:latest -f apps/web/Dockerfile .
  docker build -t esd-api:latest -f apps/api/Dockerfile .
  # docker build -t esd-auth:latest -f apps/auth/Dockerfile .

  # Load images to cluster
  echo "Loading images to cluster..."
  # kind load docker-image esd-auth:latest --name $CLUSTER_NAME
  # kind load docker-image esd-web:latest --name $CLUSTER_NAME
  kind load docker-image esd-api:latest --name $CLUSTER_NAME

  echo "Images loaded successfully"
}

# Function to install with Helm
install_helm() {
  echo "Installing to cluster: $CLUSTER_NAME"
  
  # Update dependencies
  echo "Updating Helm dependencies..."
  helm dependency update ./kubernetes/

  # Install with Helm
  echo "Installing with Helm..."
  helm install esd-app ./kubernetes/ -f ./kubernetes/values.yaml -f ./kubernetes/temporal-values.yaml

  echo "Waiting for services to start..."
  sleep 10

  echo "Services available at:"
  kubectl get svc
}

# Function to clear the cluster
clear_cluster() {
  echo "Clearing installation from cluster: $CLUSTER_NAME"
  
  # Uninstall Helm release
  helm uninstall esd-app
  
  if [ "$2" == "--all" ]; then
    echo "Deleting cluster: $CLUSTER_NAME"
    kind delete cluster --name $CLUSTER_NAME
  fi
  
  echo "Cleanup completed"
}

# Main logic based on command
case "$ACTION" in
  build)
    build_and_load
    ;;
  install)
    install_helm
    ;;
  all)
    build_and_load
    install_helm
    ;;
  clear)
    clear_cluster $3
    ;;
  *)
    echo "Usage: $0 {build|install|all|clear} [cluster-name] [options]"
    echo ""
    echo "Commands:"
    echo "  build               Build and load images to kind cluster"
    echo "  install             Install application with Helm"
    echo "  all                 Build, load, and install"
    echo "  clear [--all]       Clear Helm installation (with --all, delete the cluster too)"
    echo ""
    echo "Arguments:"
    echo "  cluster-name        Kind cluster name (default: esd-test)"
    exit 1
    ;;
esac 