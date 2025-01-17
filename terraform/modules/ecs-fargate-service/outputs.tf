output "alb_dns_name" {
  description = "DNS name of the ALB"
  value       = aws_lb.app.dns_name
}

output "service_name" {
  description = "Name of the ECS service"
  value       = aws_ecs_service.app.name
}

output "task_definition_arn" {
  description = "ARN of the task definition"
  value       = aws_ecs_task_definition.app.arn
} 