#!/bin/bash

if [ $# -ne 1 ]; then
    echo "Usage: $0 <environment>"
    echo "environment: development or production"
    exit 1
fi

ENVIRONMENT=$1

if [ "$ENVIRONMENT" != "development" ] && [ "$ENVIRONMENT" != "production" ]; then
    echo "Error: environment must be either 'development' or 'production'"
    exit 1
fi

# Initialize Terraform
terraform init

# Apply with variables
terraform apply \
    -var="environment=${ENVIRONMENT}" \
    -var-file="terraform.tfvars" \
    -auto-approve
