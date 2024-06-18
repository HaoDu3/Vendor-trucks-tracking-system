terraform {
  required_providers {
    aws = {
        source = "hashicorp/aws"
        version = "~> 4.0"
    }
  }

  backend "s3" {}
}

provider "aws" {
    region = "${var.AWS_REGION}"
}

data "aws_caller_identity" "current" {}

locals {
    account_id = data.aws_caller_identity.current.account_id
}