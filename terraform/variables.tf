variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "ap-southeast-1"
}

variable "cluster_name" {
  description = "Name of the ECS cluster"
  type        = string
  default     = "esd-itsa-cluster"
}