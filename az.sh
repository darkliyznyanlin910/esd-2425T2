export REGION="southeastasia"
export RESOURCE_GROUP_NAME="esd-aks-rg"
export AKS_CLUSTER_NAME="aks-cluster"
export ACR_NAME="esdproject"

ACTION=$1
case "$ACTION" in
  creds)
    az acr login --name $ACR_NAME
    az aks get-credentials --resource-group $RESOURCE_GROUP_NAME --name $AKS_CLUSTER_NAME
    kubectl create secret docker-registry acr-secret \
      --docker-server=$ACR_NAME.azurecr.io \
      --docker-username=$(az acr credential show --name $ACR_NAME --query username -o tsv) \
      --docker-password=$(az acr credential show --name $ACR_NAME --query "passwords[0].value" -o tsv) \
      --namespace=default \
      --dry-run=client -o yaml | kubectl apply -f -
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
    az acr login --name $ACR_NAME
    docker build --platform linux/amd64 -t esdproject.azurecr.io/esd-temporal:latest -f apps/temporal/Dockerfile . --push
    docker build --platform linux/amd64 -t esdproject.azurecr.io/esd-db-seeder:latest -f dbSeeder.Dockerfile . --push
    ;;
  db)
    case "$2" in
      backup)
        kubectl apply -f kubernetes/database/manual-backup.yaml
        ;;
      *)
        echo "Invalid action: $2"
        exit 1
        ;;
    esac
    ;;
  *)
    echo "Invalid action: $ACTION"
    exit 1
    ;;
esac
