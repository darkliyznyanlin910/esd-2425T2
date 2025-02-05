#!/bin/bash

# Function to show usage
function show_usage() {
    echo "Usage: $0 [up|down]"
    exit 1
}

# Check if argument is provided
if [ $# -ne 1 ]; then
    show_usage
fi

# Set namespace
NAMESPACE="esd"

case "$1" in
    "up")
        echo "🚀 Starting Kubernetes deployment..."

        # Create namespace if it doesn't exist
        if ! kubectl get namespace $NAMESPACE >/dev/null 2>&1; then
            echo "📑 Creating namespace $NAMESPACE..."
            kubectl create namespace $NAMESPACE
        fi

        # Build Docker images
        echo "📦 Building Docker images..."
        docker build -t web:latest -f apps/web/Dockerfile . || { echo "❌ Failed to build web image"; exit 1; }
        docker build -t api:latest -f apps/api/Dockerfile . || { echo "❌ Failed to build api image"; exit 1; }
        docker build -t auth:latest -f apps/auth/Dockerfile . || { echo "❌ Failed to build auth image"; exit 1; }

        # Install/upgrade Helm chart
        echo "⚙️ Deploying services..."
        helm upgrade --install esd ./kubernetes \
            --namespace $NAMESPACE \
            --create-namespace \
            --atomic \
            --timeout 5m || { echo "❌ Helm deployment failed"; exit 1; }

        # Wait for pods to be ready
        echo "⏳ Waiting for pods to be ready..."
        kubectl wait --namespace $NAMESPACE --for=condition=ready pod --all --timeout=90s || { echo "❌ Pods failed to become ready"; exit 1; }

        echo "✅ Deployment complete!"
        echo "🔗 Services deployed in namespace $NAMESPACE:"
        kubectl get services -n $NAMESPACE

        # Set up port forwarding for web service
        echo "🔌 Setting up port forwarding for web service to localhost:5000..."
        kubectl port-forward -n $NAMESPACE svc/esd-web 5000:80 &
        echo "🌐 Web service available at http://localhost:5000"
        ;;

    "down")
        echo "🔄 Stopping Kubernetes deployment..."

        # Check if namespace exists before trying to clean up
        if kubectl get namespace $NAMESPACE >/dev/null 2>&1; then
            # Uninstall Helm release
            echo "🗑️ Removing Helm release..."
            helm uninstall esd -n $NAMESPACE || true

            # Delete namespace
            echo "🧹 Cleaning up namespace..."
            kubectl delete namespace $NAMESPACE

            echo "✅ Cleanup complete!"
        else
            echo "⚠️ Namespace $NAMESPACE does not exist. Nothing to clean up."
        fi
        ;;

    *)
        show_usage
        ;;
esac 