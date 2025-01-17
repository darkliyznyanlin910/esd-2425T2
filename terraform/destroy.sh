#!/bin/bash

if [ $# -lt 1 ] || [ $# -gt 2 ]; then
    echo "Usage: $0 <environment> [aws_profile]"
    echo "environment: development or production"
    echo "aws_profile: optional, only needed for local development"
    exit 1
fi

ENVIRONMENT=$1

# Initialize Terraform and select workspace based on environment
terraform init
terraform workspace select $ENVIRONMENT || terraform workspace new $ENVIRONMENT

# Apply with variables
if [ -n "$2" ]; then
    terraform destroy \
        -var="environment=${ENVIRONMENT}" \
        -var="aws_profile=${2}" \
        -var-file="terraform.tfvars" \
        -auto-approve
else
    terraform destroy \
        -var="environment=${ENVIRONMENT}" \
        -var-file="terraform.tfvars" \
        -auto-approve
fi
