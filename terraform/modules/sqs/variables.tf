variable "queue_name" {
  type = string
}

variable "lambda_function_arn" {
  type    = string
  default = null
}

variable "visibility_timeout_seconds" {
  type    = number
  default = 30
}

variable "message_retention_seconds" {
  type    = number
  default = 345600 # 4 days
}

variable "delay_seconds" {
  type    = number
  default = 0
}

variable "max_message_size" {
  type    = number
  default = 262144 # 256 KB
}