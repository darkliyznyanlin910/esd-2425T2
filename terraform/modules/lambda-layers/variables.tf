variable "layer_name" {
  description = "Name of the Lambda layer"
  type        = string
}

variable "source_path" {
  description = "Local path to the Lambda layer contents"
  type        = string
}

variable "compatible_runtimes" {
  description = "List of compatible Lambda runtimes"
  type        = list(string)
  default     = ["nodejs20.x"]
}

variable "description" {
  description = "Description of the Lambda layer"
  type        = string
  default     = ""
}
