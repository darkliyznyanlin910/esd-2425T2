data "aws_iam_role" "lambda_role" {
  name = "lambda-role"
}

resource "aws_lambda_function" "function" {
  filename         = var.zip_path
  function_name    = var.function_name
  role            = data.aws_iam_role.lambda_role.arn
  handler         = var.handler
  runtime         = var.runtime
  timeout         = var.timeout
  memory_size     = var.memory_size

  environment {
    variables = var.environment_variables
  }

  layers = var.layers
}
