terraform {
  required_providers {
    aws = {
      source = "hashicorp/aws"
      version = "~> 5.8"
    }
  }
  backend "s3" {
    bucket = "terraform-state-esd-itsa"
    key    = "terraform.tfstate"
    region = "ap-southeast-1"
  }
}

provider "aws" {
  region = var.aws_region
  profile = var.aws_profile == "esd-itsa" ? var.aws_profile : null
}

resource "aws_ecs_cluster" "main" {
  name = var.cluster_name
}

data "aws_ecr_image" "web-repo" {
  repository_name = "esd-itsa-web"
  image_tag = terraform.workspace

}

data "aws_ecr_image" "api-repo" {
  repository_name = "esd-itsa-api"
  image_tag = terraform.workspace
}

data "aws_route53_zone" "main" {
  name = "johnnyknl.com"
}

