resource "aws_sqs_queue" "sqs_queue" {
    name = var.sqs_queue_name
    visibility_timeout_seconds = 60
    max_message_size = 2048
    message_retention_seconds = 86400
    receive_wait_time_seconds = 3
}