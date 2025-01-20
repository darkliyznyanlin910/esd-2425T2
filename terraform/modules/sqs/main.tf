resource "aws_sqs_queue" "queue" {
  name                       = var.queue_name
  visibility_timeout_seconds = var.visibility_timeout_seconds
  message_retention_seconds  = var.message_retention_seconds
  delay_seconds             = var.delay_seconds
  max_message_size          = var.max_message_size
}

resource "aws_sqs_queue_policy" "queue_policy" {
  queue_url = aws_sqs_queue.queue.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
        Action = [
          "sqs:ReceiveMessage",
          "sqs:DeleteMessage",
          "sqs:GetQueueAttributes"
        ]
        Resource = aws_sqs_queue.queue.arn
      }
    ]
  })
}

resource "aws_lambda_event_source_mapping" "event_source_mapping" {
  count             = var.lambda_function_arn != null ? 1 : 0
  event_source_arn  = aws_sqs_queue.queue.arn
  function_name     = var.lambda_function_arn
  batch_size        = 1
  enabled           = true
}
