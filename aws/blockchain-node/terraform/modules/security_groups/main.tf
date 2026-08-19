# ECS Security Group
resource "aws_security_group" "ecs" {
  name        = "${var.project_name}-ecs-sg"
  description = "Security group for LXON node ECS tasks"
  vpc_id      = var.vpc_id

  # RPC HTTP (8545)
  ingress {
    from_port   = 8545
    to_port     = 8545
    protocol    = "tcp"
    cidr_blocks = var.rpc_ingress_cidr
    description = "RPC HTTP"
  }

  # RPC WebSocket (8546)
  ingress {
    from_port   = 8546
    to_port     = 8546
    protocol    = "tcp"
    cidr_blocks = var.rpc_ingress_cidr
    description = "RPC WebSocket"
  }

  # P2P networking (30303)
  ingress {
    from_port   = 30303
    to_port     = 30303
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "P2P TCP"
  }

  ingress {
    from_port   = 30303
    to_port     = 30303
    protocol    = "udp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "P2P UDP"
  }

  # Allow all outbound
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-ecs-sg"
  }
}

output "ecs_sg_id" {
  value = aws_security_group.ecs.id
}
