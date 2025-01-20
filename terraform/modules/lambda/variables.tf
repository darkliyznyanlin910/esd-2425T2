variable "function_name" {
  type = string
}

variable "zip_path" {
  type = string
  description = "Path to the zip file containing Lambda code"
}

variable "handler" {
  type    = string
  description = "The handler for the Lambda function"
}

variable "runtime" {
  type    = string
  default = "nodejs20.x"
}

variable "timeout" {
  type    = number
  default = 30
}

variable "memory_size" {
  type    = number
  default = 128
}

variable "environment_variables" {
  type    = map(string)
  default = {}
  description = "Environment variables for the Lambda function"
} 

variable "layers" {
  type    = list(string)
  default = []
  description = "List of Lambda layer ARNs to attach to the function"
}