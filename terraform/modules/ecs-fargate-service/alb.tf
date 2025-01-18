resource "aws_lb" "app" {
  name               = "${var.service_name}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = var.alb_subnet_ids
}

resource "aws_lb_target_group" "app" {
  name        = "${var.service_name}-tg"
  port        = var.container_port
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "ip"

  health_check {
    path                = var.health_check_path
    healthy_threshold   = 2
    unhealthy_threshold = 10
  }
}

resource "aws_lb_listener" "app" {
  load_balancer_arn = aws_lb.app.arn
  port              = "80"
  protocol          = "HTTP"

  dynamic "default_action" {
    for_each = var.domain_name != "" ? [1] : []
    content {
      type = "redirect"
      redirect {
        port        = "443"
        protocol    = "HTTPS"
        status_code = "HTTP_301"
      }
    }
  }

  dynamic "default_action" {
    for_each = var.domain_name == "" ? [1] : []
    content {
      type             = "forward"
      target_group_arn = aws_lb_target_group.app.arn
    }
  }
}

resource "aws_lb_listener" "app_https" {
  count             = var.domain_name != "" ? 1 : 0
  load_balancer_arn = aws_lb.app.arn
  port              = "443"
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-2016-08"
  certificate_arn   = aws_acm_certificate.cert[0].arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.app.arn
  }
}

resource "aws_security_group" "alb" {
  name        = "${var.service_name}-alb"
  description = "Allow inbound traffic for ALB"
  vpc_id      = var.vpc_id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
} 