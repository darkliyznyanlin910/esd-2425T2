variable "aws_region" {
  description = "AWS region"
  type        = string
}

variable "service_name" {
  description = "Name of the ECS service"
  type        = string
}

variable "container_name" {
  description = "Name of the container"
  type        = string
}

variable "container_image" {
  description = "Docker image to run"
  type        = string
}

variable "container_port" {
  description = "Port exposed by the container"
  type        = number
}

variable "cpu" {
  description = "CPU units for the task (1024 = 1 vCPU)"
  type        = number
  default     = 256
}

variable "memory" {
  description = "Memory for the task (in MiB)"
  type        = number
  default     = 512
}

variable "desired_count" {
  description = "Number of tasks to run"
  type        = number
  default     = 1
}

variable "vpc_id" {
  description = "VPC ID"
  type        = string
}

variable "subnet_ids" {
  description = "Subnet IDs for the ECS tasks"
  type        = list(string)
}

variable "cluster_id" {
  description = "ECS cluster ID"
  type        = string
}

variable "assign_public_ip" {
  description = "Assign public IP to the task"
  type        = bool
  default     = true
}

variable "health_check_path" {
  description = "Health check path for the ALB"
  type        = string
  default     = "/"
}

variable "environment" {
  description = "List of environment variables to inject into the container"
  type = list(object({
    name      = string
    value     = string
  }))
  default = []
}

variable "alb_subnet_ids" {
  type        = list(string)
  description = "Subnet IDs for ALB"
} 