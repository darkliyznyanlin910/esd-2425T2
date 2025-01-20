resource "aws_lambda_layer_version" "layer" {
  filename            = var.source_path
  layer_name         = var.layer_name
  description        = var.description
  compatible_runtimes = var.compatible_runtimes

  # Force recreation when content changes
  source_code_hash = data.archive_file.layer.output_base64sha256
}
