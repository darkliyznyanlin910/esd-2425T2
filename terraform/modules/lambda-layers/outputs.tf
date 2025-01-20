output "arn" {
  description = "ARN of the Lambda layer version"
  value       = aws_lambda_layer_version.layer.arn
}

output "layer_name" {
  description = "Name of the Lambda layer"
  value       = aws_lambda_layer_version.layer.layer_name
}

output "version" {
  description = "Version of the Lambda layer"
  value       = aws_lambda_layer_version.layer.version
}
