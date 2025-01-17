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
  profile = "esd-itsa"
}

resource "aws_ecs_cluster" "main" {
  name = var.cluster_name
}

resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"  
}

resource "aws_subnet" "main" {
  vpc_id     = aws_vpc.main.id
  cidr_block = "10.0.1.0/24"
}

data "aws_ecr_repository" "web-repo" {
  name = "esd-itsa-web"
}

data "aws_ecr_repository" "api-repo" {
  name = "esd-itsa-api"
}

module "web_app" {
  source = "./modules/ecs-fargate-service"
  aws_region      = var.aws_region
  cluster_id      = aws_ecs_cluster.main.id
  service_name    = "web-app"
  container_name  = "web"
  container_image = data.aws_ecr_repository.web-repo.repository_url
  container_port  = 3000
  vpc_id         = aws_vpc.main.id
  subnet_ids     = [aws_subnet.main.id]
}

output "web_app_url" {
  value = module.web_app.alb_dns_name
}

module "api_app" {
  source = "./modules/ecs-fargate-service"
  aws_region      = var.aws_region
  cluster_id      = aws_ecs_cluster.main.id
  service_name    = "api-app"
  container_name  = "api"
  container_image = data.aws_ecr_repository.api-repo.repository_url
  container_port  = 3001
  vpc_id         = aws_vpc.main.id
  subnet_ids     = [aws_subnet.main.id]
  environment = [
    {
      name      = "DB_HOST"
      value     = local.environment_variables["DB_HOST"]
    }
  ]
}

output "api_app_url" {
  value = module.api_app.alb_dns_name
}