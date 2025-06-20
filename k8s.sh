CLUSTER_NAME="esd"

case $1 in
    "build")
        # Backend
        docker build -t esd-auth:latest -f apps/auth/Dockerfile .
        docker build -t esd-chatbot-backend:latest -f apps/chatbot-backend/Dockerfile .
        docker build -t esd-notification:latest -f apps/notification/Dockerfile .
        docker build -t esd-order:latest -f apps/order/Dockerfile .
        docker build -t esd-driver:latest -f apps/driver/Dockerfile .
        docker build -t esd-invoice:latest -f apps/invoice/Dockerfile .

        # Frontend
        docker build -t esd-driver-frontend:latest -f apps/driver-frontend/Dockerfile .
        docker build -t esd-customer-frontend:latest -f apps/customer-frontend/Dockerfile .
        docker build -t esd-admin-frontend:latest -f apps/admin-frontend/Dockerfile .

        # DB Seeder
        docker build -t esd-db-seeder:latest -f dbSeeder.Dockerfile .

        # Temporal
        docker build -t esd-temporal:latest -f apps/temporal/Dockerfile .
        ;;
    "install")
        kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.2/deploy/static/provider/cloud/deploy.yaml
        kubectl apply -f https://raw.githubusercontent.com/cloudnative-pg/cloudnative-pg/release-1.21/releases/cnpg-1.21.3.yaml
        kubectl apply -f https://raw.githubusercontent.com/kubernetes-csi/external-snapshotter/v6.1.0/client/config/crd/snapshot.storage.k8s.io_volumesnapshotclasses.yaml
        kubectl apply -f https://raw.githubusercontent.com/kubernetes-csi/external-snapshotter/v6.1.0/client/config/crd/snapshot.storage.k8s.io_volumesnapshotcontents.yaml
        kubectl apply -f https://raw.githubusercontent.com/kubernetes-csi/external-snapshotter/v6.1.0/client/config/crd/snapshot.storage.k8s.io_volumesnapshots.yaml
        kubectl apply -f https://raw.githubusercontent.com/kubernetes-csi/external-snapshotter/v6.1.0/deploy/kubernetes/snapshot-controller/rbac-snapshot-controller.yaml
        kubectl apply -f https://raw.githubusercontent.com/kubernetes-csi/external-snapshotter/v6.1.0/deploy/kubernetes/snapshot-controller/setup-snapshot-controller.yaml
        ;;
    "uninstall")
        kubectl delete -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.2/deploy/static/provider/cloud/deploy.yaml
        kubectl delete -f https://raw.githubusercontent.com/cloudnative-pg/cloudnative-pg/release-1.21/releases/cnpg-1.21.3.yaml
        kubectl delete -f https://raw.githubusercontent.com/kubernetes-csi/external-snapshotter/v6.1.0/deploy/kubernetes/snapshot-controller/setup-snapshot-controller.yaml
        kubectl delete -f https://raw.githubusercontent.com/kubernetes-csi/external-snapshotter/v6.1.0/deploy/kubernetes/snapshot-controller/rbac-snapshot-controller.yaml
        kubectl delete -f https://raw.githubusercontent.com/kubernetes-csi/external-snapshotter/v6.1.0/client/config/crd/snapshot.storage.k8s.io_volumesnapshots.yaml
        kubectl delete -f https://raw.githubusercontent.com/kubernetes-csi/external-snapshotter/v6.1.0/client/config/crd/snapshot.storage.k8s.io_volumesnapshotcontents.yaml
        kubectl delete -f https://raw.githubusercontent.com/kubernetes-csi/external-snapshotter/v6.1.0/client/config/crd/snapshot.storage.k8s.io_volumesnapshotclasses.yaml
        ;;
    "up")
        case $2 in
            "app")
                kubectl create secret generic app-environment --from-env-file=kubernetes/.env.k8s
                kubectl apply -k kubernetes/backend
                kubectl apply -k kubernetes/frontend
                kubectl apply -k kubernetes/nginx
                ;;
            "db")
                export WORKSPACE_DIR=$(pwd)
                kubectl kustomize kubernetes/database | envsubst | kubectl apply -f -
                ;;
            "ingress")
                kubectl apply -f kubernetes/ingress.yaml
                ;;
            "nginx")
                kubectl apply -k kubernetes/nginx
                ;;
            "temporal")
                kubectl apply -k kubernetes/temporal
                kubectl apply -k kubernetes/backend/temporal-runner
                ;;
            *)
                echo "Usage: $0 up {app|db|ingress|all}"
                exit 1
                ;;
        esac
        ;;
    "down")
        case $2 in
            "app")
                kubectl delete secret app-environment
                kubectl delete -k kubernetes/backend
                kubectl delete -k kubernetes/frontend
                kubectl delete -k kubernetes/nginx
                ;;
            "db")
                kubectl delete pv postgres-pv
                kubectl delete -k kubernetes/database
                ;;
            "ingress")
                kubectl delete -f kubernetes/ingress.yaml
                ;;
            "nginx")
                kubectl delete -k kubernetes/nginx
                ;;
            "temporal")
                kubectl delete -k kubernetes/temporal
                kubectl delete -k kubernetes/backend/temporal-runner
                ;;
            *)
                echo "Usage: $0 down {app|db|ingress|nginx|all}"
                exit 1
                ;;
        esac
        ;;
    *)
        echo "Usage: $0 {build|install|uninstall|up|down|port-forward}"
        exit 1
esac