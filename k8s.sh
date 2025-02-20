#!/bin/bash

function image_exists() {
    docker image inspect $1 >/dev/null 2>&1
    return $?
}

function build_images() {
    echo "Building Docker images..."
    eval $(minikube docker-env)
    docker build -t web:latest -f apps/web/Dockerfile .
    docker build -t api:latest -f apps/api/Dockerfile .
    docker build -t auth:latest -f apps/auth/Dockerfile .
}

function up() {
    # Check if rebuild flag is present or if images don't exist
    if [[ "$1" == "--rebuild" ]] || ! image_exists "web:latest" || ! image_exists "api:latest" || ! image_exists "auth:latest" ]; then
        build_images
    fi

    # Start minikube if not running
    if ! minikube status | grep -q "Running"; then
        minikube start
    fi

    # Enable ingress addon for Kong
    minikube addons enable ingress

    # Create namespace
    kubectl create namespace esd

    # Create ConfigMap for Kong config
    kubectl create configmap kong-config --from-file=kong.yml -n esd

    # Create secrets for env files
    kubectl create secret generic service-env --from-file=service-env/.env -n esd
    kubectl create secret generic temporal-env --from-file=.env.temporal -n esd

    # Apply Kubernetes manifests
    cat <<EOF | kubectl apply -f -
---
apiVersion: v1
kind: Service
metadata:
  name: web
  namespace: esd
spec:
  ports:
    - port: 3000
      targetPort: 3000
  selector:
    app: web
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web
  namespace: esd
spec:
  replicas: 1
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
        - name: web
          image: web:latest
          imagePullPolicy: Never
          env:
            - name: NODE_ENV
              value: production
            - name: DEPLOYMENT_ENVIRONMENT
              value: kubernetes
          envFrom:
            - secretRef:
                name: service-env
---
apiVersion: v1
kind: Service
metadata:
  name: api
  namespace: esd
spec:
  ports:
    - port: 3000
      targetPort: 3000
  selector:
    app: api
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
  namespace: esd
spec:
  replicas: 1
  selector:
    matchLabels:
      app: api
  template:
    metadata:
      labels:
        app: api
    spec:
      containers:
        - name: api
          image: api:latest
          imagePullPolicy: Never
          env:
            - name: NODE_ENV
              value: production
            - name: DEPLOYMENT_ENVIRONMENT
              value: kubernetes
          envFrom:
            - secretRef:
                name: service-env
---
apiVersion: v1
kind: Service
metadata:
  name: auth
  namespace: esd
spec:
  ports:
    - port: 3000
      targetPort: 3000
  selector:
    app: auth
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: auth
  namespace: esd
spec:
  replicas: 1
  selector:
    matchLabels:
      app: auth
  template:
    metadata:
      labels:
        app: auth
    spec:
      containers:
        - name: auth
          image: auth:latest
          imagePullPolicy: Never
          env:
            - name: NODE_ENV
              value: production
            - name: DEPLOYMENT_ENVIRONMENT
              value: kubernetes
          envFrom:
            - secretRef:
                name: service-env
---
apiVersion: v1
kind: Service
metadata:
  name: kong
  namespace: esd
spec:
  type: LoadBalancer
  ports:
    - port: 8000
      targetPort: 8000
  selector:
    app: kong
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: kong
  namespace: esd
spec:
  replicas: 1
  selector:
    matchLabels:
      app: kong
  template:
    metadata:
      labels:
        app: kong
    spec:
      containers:
        - name: kong
          image: kong:3.5
          env:
            - name: KONG_DATABASE
              value: "off"
            - name: KONG_DECLARATIVE_CONFIG
              value: /usr/local/kong/declarative/kong.yml
          volumeMounts:
            - name: kong-config
              mountPath: /usr/local/kong/declarative
      volumes:
        - name: kong-config
          configMap:
            name: kong-config
---
apiVersion: v1
kind: Service
metadata:
  name: temporal
  namespace: esd
spec:
  ports:
    - port: 7233
      targetPort: 7233
  selector:
    app: temporal
---
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: opensearch
  namespace: esd
spec:
  serviceName: opensearch
  replicas: 1
  selector:
    matchLabels:
      app: opensearch
  template:
    metadata:
      labels:
        app: opensearch
    spec:
      containers:
        - name: opensearch
          image: opensearchproject/opensearch:\${OPENSEARCH_VERSION}
          env:
            - name: discovery.type
              value: single-node
            - name: OPENSEARCH_JAVA_OPTS
              value: "-Xms256m -Xmx256m"
            - name: plugins.security.disabled
              value: "true"
          volumeMounts:
            - name: opensearch-data
              mountPath: /usr/share/opensearch/data
  volumeClaimTemplates:
    - metadata:
        name: opensearch-data
      spec:
        accessModes: [ "ReadWriteOnce" ]
        resources:
          requests:
            storage: 1Gi
---
apiVersion: v1
kind: Service
metadata:
  name: opensearch
  namespace: esd
spec:
  ports:
    - port: 9200
      targetPort: 9200
  selector:
    app: opensearch
---
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgresql
  namespace: esd
spec:
  serviceName: postgresql
  replicas: 1
  selector:
    matchLabels:
      app: postgresql
  template:
    metadata:
      labels:
        app: postgresql
    spec:
      containers:
        - name: postgresql
          image: postgres:\${POSTGRESQL_VERSION}
          env:
            - name: POSTGRES_USER
              valueFrom:
                secretKeyRef:
                  name: temporal-env
                  key: POSTGRES_USER
            - name: POSTGRES_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: temporal-env
                  key: POSTGRES_PWD
          volumeMounts:
            - name: postgresql-data
              mountPath: /var/lib/postgresql/data
  volumeClaimTemplates:
    - metadata:
        name: postgresql-data
      spec:
        accessModes: [ "ReadWriteOnce" ]
        resources:
          requests:
            storage: 1Gi
---
apiVersion: v1
kind: Service
metadata:
  name: postgresql
  namespace: esd
spec:
  ports:
    - port: 5432
      targetPort: 5432
  selector:
    app: postgresql
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: temporal
  namespace: esd
spec:
  replicas: 1
  selector:
    matchLabels:
      app: temporal
  template:
    metadata:
      labels:
        app: temporal
    spec:
      containers:
        - name: temporal
          image: temporalio/auto-setup:\${TEMPORAL_VERSION}
          envFrom:
            - secretRef:
                name: temporal-env
          volumeMounts:
            - name: temporal-config
              mountPath: /etc/temporal/config/dynamicconfig
      volumes:
        - name: temporal-config
          configMap:
            name: temporal-config
---
apiVersion: v1
kind: Service
metadata:
  name: temporal-ui
  namespace: esd
spec:
  type: LoadBalancer
  ports:
    - port: 8080
      targetPort: 8080
  selector:
    app: temporal-ui
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: temporal-ui
  namespace: esd
spec:
  replicas: 1
  selector:
    matchLabels:
      app: temporal-ui
  template:
    metadata:
      labels:
        app: temporal-ui
    spec:
      containers:
        - name: temporal-ui
          image: temporalio/ui:\${TEMPORAL_UI_VERSION}
          env:
            - name: TEMPORAL_ADDRESS
              value: temporal:7233
            - name: TEMPORAL_CORS_ORIGINS
              value: http://localhost:3000
EOF

    # Get Minikube IP
    echo "Minikube IP: $(minikube ip)"
    echo "Access Kong gateway at: $(minikube ip):8000"
    echo "Access Temporal UI at: $(minikube ip):8080"
}

function down() {
    # Delete namespace (this will delete all resources in it)
    kubectl delete namespace esd
    
    # Stop minikube
    minikube stop
}

case "$1" in
    up)
        up "$2"
        ;;
    down)
        down
        ;;
    *)
        echo "Usage: $0 {up|down} [--rebuild]"
        exit 1
        ;;
esac
