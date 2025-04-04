# ESD

### Prerequisites

1. node
2. pnpm
3. turbo
4. Docker and Docker Compose
5. Kubernetes (optional, for K8s deployment)

## Project Structure

- **apps/** - Microservice applications

  - admin-frontend - Admin dashboard UI
  - auth - Authentication service
  - chatbot-backend - Chatbot service
  - customer-frontend - Customer UI
  - driver - Driver service
  - driver-frontend - Driver UI
  - invoice - Invoice management service
  - notification - Notification service
  - order - Order management service
  - temporal - Temporal workflow service
  - web - Web service

- **custom-dns/** - DNS configuration for local development

  - Scripts to add entries for admin.esd.local, customer.esd.local, driver.esd.local, etc.

- **kubernetes/** - Kubernetes deployment configuration

  - backend - Configurations for backend services
  - frontend - Configurations for frontend applications
  - database - Database configurations
  - temporal - Temporal service configurations

- **temporal/** - Temporal workflow definitions
  - activities - Workflow activities
  - workflows - Workflow definitions
  - common - Shared utilities

## Installation

```bash
pnpm install
```

## Usage

### Running the application

1. Running the development server (with module hot reloading)

```bash
pnpm run dev
```

2. Running with docker

```bash
docker compose up -d
```

### Setting up local DNS

For local development with domain names, use the scripts in the `custom-dns` directory:

#### Unix Systems (Linux/macOS)

```bash
cd custom-dns
chmod +x add_dns_unix.sh
sudo ./add_dns_unix.sh
```

#### Windows Systems (PowerShell)

Run as Administrator:

```powershell
cd custom-dns
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
.\add_dns_windows.ps1
```

### Kubernetes Deployment

The project includes a helper script `k8s.sh` for managing Kubernetes deployments:

1. Create a `.env.k8s` file based on `.env.k8s.example` in the kubernetes directory

2. Building images:

```bash
./k8s.sh build
```

3. Install required Kubernetes components:

```bash
./k8s.sh install
```

4. Deploy components:

```bash
# Deploy databases
./k8s.sh up db

# Deploy Temporal
./k8s.sh up temporal

# Deploy application services
./k8s.sh up app

# Deploy ingress configuration
./k8s.sh up ingress

# Deploy nginx
./k8s.sh up nginx
```

5. Tear down components:

```bash
./k8s.sh down app
./k8s.sh down db
./k8s.sh down ingress
./k8s.sh down nginx
./k8s.sh down temporal
```

6. Uninstall Kubernetes components:

```bash
./k8s.sh uninstall
```

### Initializing new app / packages

```bash
turbo gen
```

### Initializing Localstack

1. Install LocalStack https://www.localstack.cloud/
2. Modify AWS Config and AWS Credentials

- Add LocalStack credentials to `~/.aws/credentials`

```bash
[localstack]
aws_access_key_id=anything
aws_secret_access_key=anything
```

- Add LocalStack config to `~/.aws/config`

```bash
[profile localstack]
output = json
endpoint_url = http://localhost:4566
region = ap-south-1
```

3. Run docker command

```bash
./docker-compose.sh up
```

## Contributing

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
