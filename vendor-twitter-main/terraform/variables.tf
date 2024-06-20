variable "aws_vpc_id" {
  type          = string
  description   = "AWS VPC ID deployed from network repo"
  default       = "vpc-07f00de02e8d24e90" # CHANGE TO YOUR OWN VPC ID
}

variable "aws_public_subnet_ids" {
  description = "public subnet ids"
  default     = ["subnet-0d5bc41ad5a00ddbc", "subnet-0e95ae59b84d540cd"] # CHANGE TO YOUR SUBNET IDS
}

variable "aws_private_subnet_ids" {
  description = "private subnet ids"
  default     = ["subnet-007cf08e5b4270707", "subnet-0707c6621af08c977"] # CHANGE TO YOUR SUBNET IDS
}

variable "aws_region" {}

variable "app_name" {
  type        = string
  description = "Application Name"
  default = "vendor-course"
}

variable "ecs_twitter_env_secrets_key" {
  description = "Secrets key file"
  default = "ecs_env_vars.json"
}

variable "ecs_twitter_env_secrets_folder" {
  description = "Secrets S3 folder"
  default = "vendor-twitter-secrets"
}

variable "dynamodb_vendor_table_name" {
  description = "Table name for dynamodb vendors"
  default = "vendors"
}

variable "sqs_queue_name" {
  description = "Name for SQS queue"
  default = "vendor-twitter-queue"
}

variable "image_tag" {}

