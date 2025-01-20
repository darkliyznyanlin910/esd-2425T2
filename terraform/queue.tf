data "archive_file" "queue_processor" {
  type        = "zip"
  source_dir  = "../aws/lambda-function/dist"
  output_path = "../aws/lambda-function/dist.zip"
}

module "queue_processor" {
  source = "./modules/lambda"
  
  function_name = "queue_processor"
  zip_path     = data.archive_file.queue_processor.output_path
  handler      = "index.handler"
  
  environment_variables = {
    NODE_ENV = "production"
  }
}

module "message_queue" {
  source = "./modules/sqs"
  
  queue_name = "message-queue"
  lambda_function_arn = module.queue_processor.arn
}
