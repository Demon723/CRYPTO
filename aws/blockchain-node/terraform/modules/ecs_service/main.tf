resource "aws_cloudwatch_log_group" "ecs" {
  name              = "/ecs/${var.project_name}-${var.environment}"
  retention_in_days = 30

  tags = {
    Name = "${var.project_name}-ecs-logs"
  }
}

resource "aws_ecs_task_definition" "lxon_node" {
  family                   = "${var.project_name}-node"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.task_cpu
  memory                   = var.task_memory
  execution_role_arn       = var.task_execution_role_arn
  task_role_arn            = var.task_role_arn

  container_definitions = jsonencode([
    {
      name      = "lxon-node"
      image     = var.node_image
      essential = true

      portMappings = [
        {
          containerPort = var.rpc_port
          hostPort      = var.rpc_port
          protocol      = "tcp"
        },
        {
          containerPort = var.rpc_ws_port
          hostPort      = var.rpc_ws_port
          protocol      = "tcp"
        },
        {
          containerPort = 30303
          hostPort      = 30303
          protocol      = "tcp"
        },
        {
          containerPort = 30303
          hostPort      = 30303
          protocol      = "udp"
        }
      ]

      environment = [
        {
          name  = "NODE_ENV"
          value = "production"
        },
        {
          name  = "CHAIN_ID"
          value = tostring(var.chain_id)
        },
        {
          name  = "NETWORK_ID"
          value = tostring(var.network_id)
        },
        {
          name  = "GENESIS_TIME"
          value = tostring(var.genesis_time)
        },
        {
          name  = "VALIDATOR_ADDRESS"
          value = var.validator_address
        },
        {
          name  = "MAX_PEERS"
          value = tostring(var.max_peers)
        },
        {
          name  = "RPC_PORT"
          value = tostring(var.rpc_port)
        },
        {
          name  = "RPC_WS_PORT"
          value = tostring(var.rpc_ws_port)
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.ecs.name
          "awslogs-region"        = data.aws_region.current.name
          "awslogs-stream-prefix" = "lxon-node"
        }
      }

      healthCheck = {
        command     = ["CMD-SHELL", "wget -q -O- http://localhost:${var.rpc_port}/health || exit 1"]
        interval    = 60
        timeout     = 10
        retries     = 3
        startPeriod = 120
      }

      mountPoints = [
        {
          sourceVolume  = "blockchain-data"
          containerPath = "/app/data"
          readOnly      = false
        }
      ]
    }
  ])

  volume {
    name = "blockchain-data"
    efs_volume_configuration {
      file_system_id = aws_efs_file_system.blockchain_data.id
      transit_encryption = "ENABLED"
    }
  }

  tags = {
    Name = "${var.project_name}-node-task"
  }
}

# EFS for persistent blockchain data
resource "aws_efs_file_system" "blockchain_data" {
  creation_token = "${var.project_name}-blockchain-data"
  encrypted      = true
  performance_mode = "generalPurpose"
  throughput_mode = "bursting"

  tags = {
    Name = "${var.project_name}-blockchain-data"
  }
}

resource "aws_efs_mount_target" "blockchain_data" {
  count           = length(var.subnet_ids)
  file_system_id  = aws_efs_file_system.blockchain_data.id
  subnet_id       = var.subnet_ids[count.index]
  security_groups = var.security_group_ids
}

# ECS Service
resource "aws_ecs_service" "lxon_node" {
  name            = "${var.project_name}-node"
  cluster         = var.cluster_name
  task_definition = aws_ecs_task_definition.lxon_node.arn
  desired_count   = 1
  launch_type     = "FARGATE"
  platform_version = "LATEST"

  network_configuration {
    subnets          = var.subnet_ids
    security_groups  = var.security_group_ids
    assign_public_ip = true
  }

  deployment_configuration {
    maximum_percent         = 100
    minimum_healthy_percent = 0
    deployment_circuit_breaker {
      enable   = true
      rollback = true
    }
  }

  force_new_deployment = true

  tags = {
    Name = "${var.project_name}-node-service"
  }
}

# Get public IP of the task
data "aws_network_interface" "node_eni" {
  depends_on = [aws_ecs_service.lxon_node]

  filter {
    name   = "tag:aws:ecs:service-name"
    values = [aws_ecs_service.lxon_node.name]
  }
}

data "aws_region" "current" {}

output "service_name" {
  value = aws_ecs_service.lxon_node.name
}

output "node_public_ip" {
  value = try(aws_network_interface.node_eni.association[0].public_ip, "")
  depends_on = [aws_ecs_service.lxon_node]
}

output "efs_file_system_id" {
  value = aws_efs_file_system.blockchain_data.id
}
