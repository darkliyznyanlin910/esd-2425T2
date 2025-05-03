export REGION="southeastasia"
export RESOURCE_GROUP_NAME="esd-aks-rg"
export AKS_CLUSTER_NAME="aks-cluster"
export ACR_NAME="esdproject"

ACTION=$1
case "$ACTION" in
  creds)
    az acr login --name $ACR_NAME
    az aks get-credentials --resource-group $RESOURCE_GROUP_NAME --name $AKS_CLUSTER_NAME
    source .env.azure
    kubectl create secret generic azure-creds \
      --from-literal=AZURE_STORAGE_ACCOUNT=$AZURE_STORAGE_ACCOUNT \
      --from-literal=AZURE_STORAGE_KEY=$AZURE_STORAGE_KEY \
      --from-literal=AZURE_STORAGE_SAS_TOKEN=$AZURE_STORAGE_SAS_TOKEN \
      --from-literal=AZURE_STORAGE_CONNECTION_STRING=$AZURE_STORAGE_CONNECTION_STRING
    ;;
  login)
    az acr login --name $ACR_NAME
    az aks get-credentials --resource-group $RESOURCE_GROUP_NAME --name $AKS_CLUSTER_NAME
    ;;
  push)
    # Temporal
    docker build -t esdproject.azurecr.io/esd-temporal:latest -f apps/temporal/Dockerfile . --push

    # DB Seeder
    docker build -t esdproject.azurecr.io/esd-db-seeder:latest -f dbSeeder.Dockerfile . --push

    # Backend
    docker build -t esdproject.azurecr.io/esd-auth:latest -f apps/auth/Dockerfile . --push
    docker build -t esdproject.azurecr.io/esd-chatbot-backend:latest -f apps/chatbot-backend/Dockerfile . --push
    docker build -t esdproject.azurecr.io/esd-driver:latest -f apps/driver/Dockerfile . --push
    docker build -t esdproject.azurecr.io/esd-invoice:latest -f apps/invoice/Dockerfile . --push
    docker build -t esdproject.azurecr.io/esd-notification:latest -f apps/notification/Dockerfile . --push
    docker build -t esdproject.azurecr.io/esd-order:latest -f apps/order/Dockerfile . --push

    # Frontend
    docker build -t esdproject.azurecr.io/esd-admin-frontend:latest -f apps/admin-frontend/Dockerfile . --push
    docker build -t esdproject.azurecr.io/esd-customer-frontend:latest -f apps/customer-frontend/Dockerfile . --push
    docker build -t esdproject.azurecr.io/esd-driver-frontend:latest -f apps/driver-frontend/Dockerfile . --push
    ;;
  db)
    case "$2" in
      init)
        kubectl apply -k kubernetes/database
        ;;
      backup)
        kubectl apply -f kubernetes/database/manual-backup.yaml
        ;;
      seed)
        kubectl apply -f kubernetes/database/seed.yaml
        ;;
      delete)
        kubectl delete -k kubernetes/database
        ;;
      *)
        echo "Invalid action: $2"
        exit 1
        ;;
    esac
    ;;
  up)
    case "$2" in
      "secret")
        kubectl create secret generic app-environment --from-env-file=kubernetes/.env.k8s
        ;;
      "app")
        kubectl apply -k kubernetes/backend
        kubectl apply -k kubernetes/frontend
        kubectl apply -k kubernetes/nginx
        ;;
    esac
    ;;
  down)
    case "$2" in
      "app")
        kubectl delete -k kubernetes/nginx
        kubectl delete -k kubernetes/frontend
        kubectl delete -k kubernetes/backend
        ;;
    esac
    ;;
  *)
    echo "Invalid action: $ACTION"
    exit 1
    ;;
esac
