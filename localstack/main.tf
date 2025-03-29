terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  access_key                  = "test"
  secret_key                  = "test"
  region                      = "ap-south-1"
  skip_credentials_validation = true
  skip_requesting_account_id  = true
  skip_metadata_api_check     = true
  s3_use_path_style           = true

  endpoints {
    s3 = "http://localhost:4566"
  }
}

resource "aws_s3_bucket" "my_bucket" {
  bucket = "invoice-bucket"

  tags = {
    Name        = "LocalStack S3 Bucket"
    Environment = "Local"
  }
}

output "s3_bucket_name" {
  value = aws_s3_bucket.my_bucket.bucket
}
