# Application Load Balancer
resource "aws_lb" "main" {
  name               = "${var.project_name}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = [for subnet in aws_subnet.public : subnet.id]

  enable_deletion_protection = var.environment == "production" ? true : false
  enable_http2               = true
  enable_cross_zone_load_balancing = true

  tags = {
    Name        = "${var.project_name}-alb"
    Environment = var.environment
  }
}

# HTTP Listener (redirect to HTTPS)
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.main.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type = "redirect"

    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }
}

# HTTPS Listener
resource "aws_lb_listener" "https" {
  count          = var.environment == "production" ? 1 : 0
  load_balancer_arn = aws_lb.main.arn
  port          = "443"
  protocol      = "HTTPS"
  ssl_policy    = "ELBSecurityPolicy-2016-08"
  certificate_arn = var.environment == "production" ? aws_acm_certificate.main[0].arn : null

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.lixon_node.arn
  }
}

# ACM Certificate (for production)
resource "aws_acm_certificate" "main" {
  count             = var.environment == "production" ? 1 : 0
  domain_name       = "${var.project_name}.com"
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }

  tags = {
    Name        = "${var.project_name}-cert"
    Environment = var.environment
  }
}

# Target Group for LXON Node
resource "aws_lb_target_group" "lixon_node" {
  name     = "${var.project_name}-node-tg"
  port     = var.container_port
  protocol = "HTTP"
  vpc_id   = aws_vpc.main.id
  target_type = "ip"

  health_check {
    enabled             = true
    healthy_threshold   = 2
    unhealthy_threshold = 3
    timeout             = 5
    interval            = 30
    matcher             = "200-299"
    path                = var.health_check_path
  }

  tags = {
    Name        = "${var.project_name}-node-tg"
    Environment = var.environment
  }
}
