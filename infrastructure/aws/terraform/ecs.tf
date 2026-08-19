resource "aws_ecs_cluster" "lxon_cluster" {
  name = "lxon-cluster-${var.environment}"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

resource "aws_cloudwatch_log_group" "ecs_logs" {
  name              = "/ecs/lxon-blockchain-node"
  retention_in_days = 30
}

resource "aws_iam_role" "ecs_execution_role" {
  name = "lxon-ecs-execution-role-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_execution_policy" {
  role       = aws_iam_role.ecs_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_ecs_task_definition" "lxon_node_task" {
  family                   = "lxon-node-task"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = tostring(var.container_cpu)
  memory                   = tostring(var.container_memory)
  execution_role_arn       = aws_iam_role.ecs_execution_role.arn

  container_definitions = jsonencode([
    {
      name      = "lxon-blockchain-node"
      image     = "${aws_ecr_repository.lxon_node.repository_url}:latest"
      essential = true
      portMappings = [
        {
          containerPort = 8545
          hostPort      = 8545
          protocol      = "tcp"
        }
      ]
      environment = [
        { name = "NODE_ENV", value = "production" },
        { name = "PORT", value = "8545" },
        { name = "CHAIN_ID", value = tostring(var.chain_id) },
        { name = "NODE_ID", value = "lxon-node-aws-1" },
        { name = "DATA_DIR", value = "/data" }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.ecs_logs.name
          awslogs-region        = var.aws_region
          awslogs-stream-prefix = "ecs"
        }
      }
    }
  ])
}

resource "aws_ecs_service" "lxon_service" {
  name            = "lxon-node-service"
  cluster         = aws_ecs_cluster.lxon_cluster.id
  task_definition = aws_ecs_task_definition.lxon_node_task.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = [aws_subnet.public_a.id, aws_subnet.public_b.id]
    security_groups  = [aws_security_group.node_sg.id]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.lxon_tg.arn
    container_name   = "lxon-blockchain-node"
    container_port   = 8545
  }

  depends_on = [aws_lb_listener.lxon_http]
}
