resource "aws_security_group" "lb_sg" {
  vpc_id = var.aws_vpc_id
  name = "${var.app_name}-lb-sg"

  ingress {
    from_port = 80
    to_port = 80
    protocol = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  egress {
    from_port = 0
    to_port = 0
    protocol = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }
}

resource "aws_alb" "alb" {
  name = "${var.app_name}-alb"
  internal = false
  load_balancer_type = "application"
  subnets = var.aws_public_subnet_ids
  security_groups = [aws_security_group.lb_sg.id]
}

resource "aws_lb_target_group" "target_group" {
  name = "${var.app_name}-tg"
  port = 80
  protocol = "HTTP"
  target_type = "ip"
  vpc_id = var.aws_vpc_id

  health_check {
    healthy_threshold = "2"
    interval = "200"
    protocol = "HTTP"
    matcher = "200"
    timeout = "3"
    path = "/"
    unhealthy_threshold = "2"
    port = "80"
  }
}

resource "aws_lb_listener" "listener" {
    load_balancer_arn = aws_alb.alb.id
    port = "80"
    protocol = "HTTP"

    default_action {
      type = "forward"
      target_group_arn = aws_lb_target_group.target_group.id
    }
}