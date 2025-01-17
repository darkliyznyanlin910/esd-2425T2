#!/bin/bash

if [ $# -lt 1 ] || [ $# -gt 2 ]; then
    echo "Usage: $0 <environment> [aws_profile]"
    echo "environment: development or production"
    echo "aws_profile: optional, only needed for local development"
    exit 1
fi

ENVIRONMENT=$1
WORKSPACE="local"

# If running in GitHub Actions, use 'github' workspace
if [ -n "$GITHUB_ACTIONS" ]; then
    WORKSPACE="github"
fi

# Initialize Terraform and select workspace
terraform init
terraform workspace select $WORKSPACE || terraform workspace new $WORKSPACE

# Apply with variables
if [ -n "$2" ]; then
    terraform apply \
        -var="environment=${ENVIRONMENT}" \
        -var="aws_profile=${2}" \
        -var-file="terraform.tfvars" \
        -auto-approve
else
    terraform apply \
        -var="environment=${ENVIRONMENT}" \
        -var-file="terraform.tfvars" \
        -auto-approve
fi
