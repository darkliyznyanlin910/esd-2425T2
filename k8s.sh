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

stop_forward() {
  PID_DIR="/tmp/esd-port-forward"
  if [ -d "$PID_DIR" ]; then
    echo "Stopping all port forwarding processes..."
    for PID_FILE in "$PID_DIR"/*.pid; do
      if [ -f "$PID_FILE" ]; then
        SERVICE=$(basename "$PID_FILE" .pid)
        PID=$(cat "$PID_FILE")
        echo "Stopping $SERVICE (PID: $PID)..."
        kill $PID 2>/dev/null || true
        rm "$PID_FILE"
      fi
    done
    echo "All port forwarding stopped"
  else
    echo "No port forwarding found"
  fi
}

port_forward() {
  PID_DIR="/tmp/esd-port-forward"
  mkdir -p "$PID_DIR"
  
  # Default services to forward if none specified
  SERVICES="nginx:8000:80,api:3000:80"
  
  IFS=',' read -ra SERVICE_ARRAY <<< "$SERVICES"
  
  for SERVICE_DEF in "${SERVICE_ARRAY[@]}"; do
    IFS=':' read -ra PARTS <<< "$SERVICE_DEF"
    SERVICE=${PARTS[0]}
    LOCAL_PORT=${PARTS[1]}
    REMOTE_PORT=${PARTS[2]:-80}
    
    echo "Starting port forwarding for $SERVICE (localhost:$LOCAL_PORT -> port $REMOTE_PORT)..."
    kubectl port-forward "svc/esd-app-$SERVICE" "$LOCAL_PORT:$REMOTE_PORT" &
    PID=$!
    echo $PID > "$PID_DIR/$SERVICE.pid"
    echo "Port forwarding for $SERVICE started with PID: $PID"
    echo "Access at: http://localhost:$LOCAL_PORT"
  done
  
  echo "To stop all port forwarding, run: $0 $1 stop"
}

port_status() {
  PID_DIR="/tmp/esd-port-forward"
  
  if [ ! -d "$PID_DIR" ]; then
    echo "No port forwarding directory found at $PID_DIR"
    return
  fi
  
  echo "Current port forwarding status:"
  echo "------------------------------"
  
  # Check if any pid files exist
  if [ -z "$(ls -A $PID_DIR 2>/dev/null)" ]; then
    echo "No active port forwarding found"
    return
  fi
  
  printf "%-15s %-10s %-20s %-20s\n" "SERVICE" "STATUS" "PID" "URL"
  
  for PID_FILE in "$PID_DIR"/*.pid; do
    if [ -f "$PID_FILE" ]; then
      SERVICE=$(basename "$PID_FILE" .pid)
      PID=$(cat "$PID_FILE")
      
      # Check if process is running
      if ps -p $PID > /dev/null; then
        STATUS="RUNNING"
        
        # Extract port from process command
        PORT=$(ps -p $PID -o command= | grep -oP 'localhost:\K[0-9]+' || echo "unknown")
        URL="http://localhost:$PORT"
      else
        STATUS="STOPPED"
        URL="N/A"
      fi
      
      printf "%-15s %-10s %-20s %-20s\n" "$SERVICE" "$STATUS" "$PID" "$URL"
    fi
  done
  
  echo "------------------------------"
  echo "To start port forwarding: $0 port forward"
  echo "To stop port forwarding: $0 port stop"
}

# Function to clear the cluster
clear_cluster() {
  echo "Clearing installation from cluster: $CLUSTER_NAME"
  
  # Uninstall Helm release
  helm uninstall esd-app
  
  # Remove loaded Docker images from the cluster
  echo "Removing Docker images from cluster..."
  docker exec "$CLUSTER_NAME-control-plane" crictl rmi esd-api:latest 2>/dev/null || true
  
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
  up)
    build_and_load
    install_helm
    ;;
  down)
    clear_cluster $3
    stop_forward
    ;;
  port)
    case "$2" in
      forward)
        port_forward
        ;;
      stop)
        stop_forward
        ;;
      status)
        port_status
        ;;
      *)
        echo "Usage: $0 port {forward|stop|status} [services]"
        exit 1
        ;;
    esac
    ;;
  *)
    echo "Usage: $0 {build|install|up|down|port} [cluster-name] [options]"
    echo ""
    echo "Commands:"
    echo "  build               Build and load images to kind cluster"
    echo "  install             Install application with Helm"
    echo "  up                  Build, load, and install"
    echo "  down [--all]        Clear Helm installation (with --all, delete the cluster too)"
    echo "  port                Port forward services"
    echo ""
    echo "Arguments:"
    echo "  cluster-name        Kind cluster name (default: esd-test)"
    exit 1
    ;;
esac 