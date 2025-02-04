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

case "$1" in
    "up")
        echo "🚀 Starting Kubernetes deployment..."

        # Build Docker images
        echo "📦 Building Docker images..."
        docker build -t web:latest -f apps/web/Dockerfile .
        docker build -t api:latest -f apps/api/Dockerfile .

        # Install/upgrade Helm chart
        echo "⚙️ Deploying services..."
        helm upgrade --install esd ./kubernetes --create-namespace --namespace esd

        # Wait for pods to be ready
        echo "⏳ Waiting for pods to be ready..."
        kubectl wait --namespace esd --for=condition=ready pod --all --timeout=90s

        echo "✅ Deployment complete!"
        echo "🔗 Services deployed in namespace esd:"
        kubectl get services -n esd
        
        # Set up port forwarding for web service
        echo "🔌 Setting up port forwarding for web service to localhost:5000..."
        kubectl port-forward -n esd svc/esd-web 5000:80 &
        echo "🌐 Web service available at http://localhost:5000"
        ;;

    "down")
        echo "🔄 Stopping Kubernetes deployment..."

        # Uninstall Helm release
        echo "🗑️ Removing Helm release..."
        helm uninstall esd -n esd

        # Delete namespace
        echo "🧹 Cleaning up namespace..."
        kubectl delete namespace esd

        echo "✅ Cleanup complete!"
        ;;

    *)
        show_usage
        ;;
esac 