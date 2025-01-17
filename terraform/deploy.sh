#!/bin/bash

if [ $# -lt 1 ] || [ $# -gt 2 ]; then
    echo "Usage: $0 <environment> [aws_profile]"
    echo "environment: development or production"
    echo "aws_profile: optional, defaults to 'esd-itsa'"
    exit 1
fi

ENVIRONMENT=$1
AWS_PROFILE=${2:-"esd-itsa"}

if [ "$ENVIRONMENT" != "development" ] && [ "$ENVIRONMENT" != "production" ]; then
    echo "Error: environment must be either 'development' or 'production'"
    exit 1
fi

# Initialize Terraform
terraform init

# Apply with variables
terraform apply \
    -var="environment=${ENVIRONMENT}" \
    -var="aws_profile=${AWS_PROFILE}" \
    -var-file="terraform.tfvars" \
    -auto-approve
