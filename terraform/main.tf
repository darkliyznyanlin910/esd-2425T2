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

resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support = true
}

# Create public subnets for ALB
resource "aws_subnet" "main_1" {
  vpc_id     = aws_vpc.main.id
  cidr_block = "10.0.1.0/24"
  availability_zone = "${var.aws_region}a"
  # Keep this true since ALB needs to be in public subnet
  map_public_ip_on_launch = true
}

resource "aws_subnet" "main_2" {
  vpc_id     = aws_vpc.main.id
  cidr_block = "10.0.2.0/24"
  availability_zone = "${var.aws_region}b"
  map_public_ip_on_launch = true
}

# Create private subnets for ECS tasks
resource "aws_subnet" "private_1" {
  vpc_id     = aws_vpc.main.id
  cidr_block = "10.0.3.0/24"
  availability_zone = "${var.aws_region}a"
}

resource "aws_subnet" "private_2" {
  vpc_id     = aws_vpc.main.id
  cidr_block = "10.0.4.0/24"
  availability_zone = "${var.aws_region}b"
}

# NAT Gateway for private subnets
resource "aws_eip" "nat" {
  domain = "vpc"
}

resource "aws_nat_gateway" "main" {
  allocation_id = aws_eip.nat.id
  subnet_id     = aws_subnet.main_1.id
}

# Internet Gateway (needed for ALB)
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id
}

# Public Route Table
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }
}

# Private Route Table
resource "aws_route_table" "private" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.main.id
  }
}

# Route Table Associations
resource "aws_route_table_association" "public_1" {
  subnet_id      = aws_subnet.main_1.id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "public_2" {
  subnet_id      = aws_subnet.main_2.id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "private_1" {
  subnet_id      = aws_subnet.private_1.id
  route_table_id = aws_route_table.private.id
}

resource "aws_route_table_association" "private_2" {
  subnet_id      = aws_subnet.private_2.id
  route_table_id = aws_route_table.private.id
}

data "aws_ecr_image" "web-repo" {
  repository_name = "esd-itsa-web"
  image_tag = terraform.workspace

}

data "aws_ecr_image" "api-repo" {
  repository_name = "esd-itsa-api"
  image_tag = terraform.workspace
}

module "web_app" {
  source = "./modules/ecs-fargate-service"
  aws_region      = var.aws_region
  cluster_id      = aws_ecs_cluster.main.id
  service_name    = "web-app"
  container_name  = "web"
  container_image = data.aws_ecr_image.web-repo.image_uri
  container_port  = 3000
  vpc_id         = aws_vpc.main.id
  subnet_ids     = [aws_subnet.private_1.id, aws_subnet.private_2.id]
  alb_subnet_ids = [aws_subnet.main_1.id, aws_subnet.main_2.id]
  assign_public_ip = false
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
  container_image = data.aws_ecr_image.api-repo.image_uri
  container_port  = 3001
  vpc_id         = aws_vpc.main.id
  subnet_ids     = [aws_subnet.private_1.id, aws_subnet.private_2.id]
  alb_subnet_ids = [aws_subnet.main_1.id, aws_subnet.main_2.id]
  assign_public_ip = false
  environment = [
    {
      name  = "DB_HOST"
      value = local.environment_variables["DB_HOST"]
    }
  ]
}

output "api_app_url" {
  value = module.api_app.alb_dns_name
}