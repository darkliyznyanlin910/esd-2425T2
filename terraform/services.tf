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
  environment_variables = [
    {
      name  = "POSTGRES_URL"
      value = local.environment_variables["POSTGRES_URL"]
    },
    {
      name  = "DEPLOYMENT_ENVIRONMENT"
      value = local.environment_variables["DEPLOYMENT_ENVIRONMENT"]
    }
  ]
  domain_name = format("web.esd-itsa.%s.johnnyknl.com", terraform.workspace)
  zone_id = data.aws_route53_zone.main.zone_id
}

output "web_app_url" {
  value = module.web_app.domain_name
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
  environment_variables = [
    {
      name  = "POSTGRES_URL"
      value = local.environment_variables["POSTGRES_URL"]
    },
    {
      name  = "DEPLOYMENT_ENVIRONMENT"
      value = local.environment_variables["DEPLOYMENT_ENVIRONMENT"]
    }
  ]
  domain_name = format("api.esd-itsa.%s.johnnyknl.com", terraform.workspace)
  zone_id = data.aws_route53_zone.main.zone_id
}

output "api_app_url" {
  value = module.api_app.domain_name
}
