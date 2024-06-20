resource "aws_ecs_cluster" "cluster" {
    name = "${var.app_name}-ecs-cluster"
}

resource "aws_cloudwatch_log_group" "ecs_logs" {
  name = "${var.app_name}-ecs-logs"
}

resource "aws_security_group" "ecs_sg" {
  vpc_id = var.aws_vpc_id
  name = "${var.app_name}-ecs-sg"

  ingress {
    from_port = 0
    to_port = 0
    protocol = "-1"
    security_groups = [aws_security_group.lb_sg.id]
  }

  egress {
    from_port = 0
    to_port = 0
    protocol = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }
}

data "aws_s3_bucket_object" "secrets" {
    bucket = var.ecs_twitter_env_secrets_folder
    key = var.ecs_twitter_env_secrets_key
}

resource "aws_ecs_task_definition" "td" {
  family = "${var.app_name}-td"
  container_definitions = <<DEFINITION
  [
    {
      "name": "${var.app_name}-td",
      "image": "${local.account_id}.dkr.ecr.us-east-1.amazonaws.com/twitter:${var.image_tag}",
      "entryPoint": [],
      "environment": ${data.aws_s3_bucket_object.secrets.body},
      "essential": true,
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "${aws_cloudwatch_log_group.ecs_logs.id}",
          "awslogs-region": "${var.aws_region}",
          "awslogs-stream-prefix": "${var.app_name}"
        }
      },
      "portMappings": [
        {
          "containerPort": 80,
          "hostPort": 80
        }
      ],
      "cpu": 256,
      "memory": 1024,
      "networkMode": "awsvpc"
    }
  ]
  DEFINITION

  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  memory                   = "1024"
  cpu                      = "256"
  execution_role_arn       = aws_iam_role.ecsTaskExecutionRole.arn
  task_role_arn            = aws_iam_role.ecsTaskExecutionRole.arn
}

data "aws_ecs_task_definition" "td" {
    task_definition = aws_ecs_task_definition.td.family
}

resource "aws_ecs_service" "ecs" {
  name = "${var.app_name}-ecs-service"
  cluster = aws_ecs_cluster.cluster.id
  task_definition = data.aws_ecs_task_definition.td.family
  launch_type = "FARGATE"
  scheduling_strategy = "REPLICA"
  desired_count = 1
  force_new_deployment = true

  network_configuration {
    subnets = var.aws_private_subnet_ids
    assign_public_ip = false
    security_groups = [
        aws_security_group.ecs_sg.id,
        aws_security_group.lb_sg.id
    ]
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.target_group.arn
    container_name = "${var.app_name}-td"
    container_port = 80
  }

  depends_on = [
    aws_lb_listener.listener
  ]
}

resource "aws_appautoscaling_target" "autoscaling" {
  max_capacity = 1
  min_capacity = 1
  resource_id = "service/${aws_ecs_cluster.cluster.name}/${aws_ecs_service.ecs.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace = "ecs"
}