resource "aws_ecs_cluster" "main" {
  name = "${var.project_name}-cluster"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  tags = {
    Name        = "${var.project_name}-cluster"
    Environment = var.environment
  }
}

# ECS Task Definition for LXON Node
resource "aws_ecs_task_definition" "lixon_node" {
  family                   = "${var.project_name}-node"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.container_cpu
  memory                   = var.container_memory
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn
  task_role_arn            = aws_iam_role.ecs_task.arn

  container_definitions = jsonencode([
    {
      name  = "lixon-node"
      image = "${var.project_name}-node:latest"
      portMappings = [
        {
          containerPort = var.container_port
          protocol      = "tcp"
        }
      ]
      environment = [
        {
          name  = "NODE_ENV"
          value = "production"
        },
        {
          name  = "CHAIN_ID"
          value = "1"
        }
      ]
      secrets = [
        {
          name      = "VALIDATOR_KEY"
          valueFrom = aws_secretsmanager_secret.validator_key.arn
        }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.lxon.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "ecs"
        }
      }
      healthCheck = {
        command     = ["CMD-SHELL", "curl -f http://localhost:${var.container_port}${var.health_check_path} || exit 1"]
        interval    = 30
        timeout     = 5
        retries     = 3
        startPeriod = 60
      }
    }
  ])

  tags = {
    Name        = "${var.project_name}-node-task"
    Environment = var.environment
  }
}

# ECS Service for LXON Node
resource "aws_ecs_service" "lixon_node" {
  name            = "${var.project_name}-node-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.lixon_node.arn
  desired_count   = var.task_count
  launch_type     = "FARGATE"
  platform_version = "LATEST"

  network_configuration {
    subnets          = [for subnet in aws_subnet.private : subnet.id]
    security_groups  = [aws_security_group.ecs_tasks.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.lixon_node.arn
    container_name   = "lixon-node"
    container_port   = var.container_port
  }

  depends_on = [aws_lb_listener.http]

  tags = {
    Name        = "${var.project_name}-node-service"
    Environment = var.environment
  }
}

# Auto Scaling for ECS Service
resource "aws_appautoscaling_target" "ecs_node" {
  max_capacity       = 10
  min_capacity       = 1
  resource_id        = "service/${aws_ecs_cluster.main.name}/${aws_ecs_service.lixon_node.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

resource "aws_appautoscaling_policy" "ecs_node_cpu" {
  name               = "${var.project_name}-node-cpu-autoscaling"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.ecs_node.resource_id
  scalable_dimension = aws_appautoscaling_target.ecs_node.scalable_dimension
  service_namespace  = aws_appautoscaling_target.ecs_node.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
    target_value       = 80.0
    scale_in_cooldown  = 300
    scale_out_cooldown = 60
  }
}

resource "aws_appautoscaling_policy" "ecs_node_memory" {
  name               = "${var.project_name}-node-memory-autoscaling"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.ecs_node.resource_id
  scalable_dimension = aws_appautoscaling_target.ecs_node.scalable_dimension
  service_namespace  = aws_appautoscaling_target.ecs_node.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageMemoryUtilization"
    }
    target_value       = 80.0
    scale_in_cooldown  = 300
    scale_out_cooldown = 60
  }
}

# Secrets Manager for Validator Key
resource "aws_secretsmanager_secret" "validator_key" {
  name = "${var.project_name}/validator-key"

  tags = {
    Environment = var.environment
  }
}
