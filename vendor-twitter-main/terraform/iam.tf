# role task execution role
data "aws_iam_policy_document" "assume_role_policy" {
    statement {
      actions = ["sts:AssumeRole"]

      principals {
        type = "Service"
        identifiers = ["ecs-tasks.amazonaws.com"]
      }
    }
}

resource "aws_iam_role" "ecsTaskExecutionRole" {
    name = "${var.app_name}-ecs-task-execution-role"
    assume_role_policy = data.aws_iam_policy_document.assume_role_policy.json
}

# policy 1 EC2 policy
resource "aws_iam_role_policy_attachment" "ec2_policy" {
    role = aws_iam_role.ecsTaskExecutionRole.name
    policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonEC2ContainerServiceforEC2Role"
}

# policy 2 dynamodb and sqs
data "aws_iam_policy_document" "twitter_service_access" {
    statement {
      effect = "Allow"
      actions = [
        "dynamodb:DescribeTable",
        "dynamodb:Scan",
        "dynamodb:UpdateItem",
        "sqs:*"
      ]
      resources = [
        "arn:aws:sqs:${var.aws_region}:${local.account_id}:${var.sqs_queue_name}",
        "arn:aws:dynamodb:${var.aws_region}:${local.account_id}:table/${var.dynamodb_vendor_table_name}"
      ]
    }
}

resource "aws_iam_policy" "twitter_service_access" {
    name = "${var.app_name}-twitter-service-access"
    policy = data.aws_iam_policy_document.twitter_service_access.json
    description = "Allows access for dynamodb & SQS for our Twitter service"
}

resource "aws_iam_role_policy_attachment" "attach_twitter_service_access_policy" {
    policy_arn = aws_iam_policy.twitter_service_access.arn
    role = aws_iam_role.ecsTaskExecutionRole.name
}