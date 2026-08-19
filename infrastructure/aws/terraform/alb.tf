resource "aws_lb" "lxon_alb" {
  name               = "lxon-alb-${var.environment}"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.node_sg.id]
  subnets            = [aws_subnet.public_a.id, aws_subnet.public_b.id]

  tags = {
    Name = "lxon-alb"
  }
}

resource "aws_lb_target_group" "lxon_tg" {
  name        = "lxon-tg-${var.environment}"
  port        = 8545
  protocol    = "HTTP"
  vpc_id      = aws_vpc.lxon_vpc.id
  target_type = "ip"

  health_check {
    enabled             = true
    path                = "/health"
    port                = "8545"
    protocol            = "HTTP"
    matcher             = "200"
    interval            = 15
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 3
  }
}

resource "aws_lb_listener" "lxon_http" {
  load_balancer_arn = aws_lb.lxon_alb.arn
  port              = 8545
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.lxon_tg.arn
  }
}
