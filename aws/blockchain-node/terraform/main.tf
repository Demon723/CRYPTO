terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket         = "lxon-blockchain-terraform-state"
    key            = "prod/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "lxon-blockchain-terraform-locks"
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "LXON-Blockchain"
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}

# VPC
module "vpc" {
  source = "./modules/vpc"

  project_name           = var.project_name
  environment            = var.environment
  vpc_cidr               = var.vpc_cidr
  availability_zones     = var.availability_zones
  public_subnet_cidrs    = var.public_subnet_cidrs
  private_subnet_cidrs   = var.private_subnet_cidrs
}

# ECR Repository
module "ecr" {
  source = "./modules/ecr"

  project_name = var.project_name
  environment  = var.environment
  repository   = "lxon-node"
}

# Security Groups
module "security_groups" {
  source = "./modules/security_groups"

  project_name    = var.project_name
  environment     = var.environment
  vpc_id          = module.vpc.vpc_id
  rpc_ingress_cidr = var.rpc_ingress_cidr
}

# EBS Volumes for persistent blockchain data
module "ebs" {
  source = "./modules/ebs"

  project_name       = var.project_name
  environment        = var.environment
  availability_zones = var.availability_zones
  volume_size        = var.blockchain_data_volume_size
}

# ECS Cluster
module "ecs_cluster" {
  source = "./modules/ecs_cluster"

  project_name       = var.project_name
  environment        = var.environment
  container_insights = true
}

# IAM Roles
module "iam_roles" {
  source = "./modules/iam_roles"

  project_name = var.project_name
  environment  = var.environment
}

# ECS Service
module "ecs_service" {
  source = "./modules/ecs_service"

  project_name    = var.project_name
  environment     = var.environment
  cluster_arn     = module.ecs_cluster.cluster_arn
  cluster_name    = module.ecs_cluster.cluster_name
  vpc_id          = module.vpc.vpc_id
  subnet_ids      = module.vpc.private_subnet_ids

  # ECR Image
  node_image = "${module.ecr.repository_url}:latest"

  # IAM Roles
  task_execution_role_arn = module.iam_roles.ecs_task_execution_role_arn
  task_role_arn           = module.iam_roles.ecs_task_role_arn

  # Security
  security_group_ids = [module.security_groups.ecs_sg_id]

  # Blockchain Configuration
  chain_id          = var.chain_id
  genesis_time      = var.genesis_time
  validator_address = var.validator_address
  validator_key     = var.validator_key
  network_id        = var.network_id

  # Resource allocation
  task_cpu    = var.task_cpu
  task_memory = var.task_memory

  # RPC Configuration
  rpc_port     = var.rpc_port
  rpc_ws_port  = var.rpc_ws_port
  max_peers    = var.max_peers
}

# CloudWatch Monitoring
module "monitoring" {
  source = "./modules/monitoring"

  project_name = var.project_name
  environment  = var.environment
  cluster_name = module.ecs_cluster.cluster_name
  sns_topic_arn = aws_sns_topic.alerts.arn
}

# SNS Topic for Alerts
resource "aws_sns_topic" "alerts" {
  name = "${var.project_name}-${var.environment}-alerts"
}

resource "aws_sns_topic_subscription" "alerts_email" {
  topic_arn = aws_sns_topic.alerts.arn
  protocol  = "email"
  endpoint  = var.alert_email
}

# Outputs
output "node_rpc_endpoint" {
  description = "Blockchain node RPC endpoint"
  value       = "http://${module.ecs_service.node_public_ip}:${var.rpc_port}"
}

output "node_ws_endpoint" {
  description = "Blockchain node WebSocket endpoint"
  value       = "ws://${module.ecs_service.node_public_ip}:${var.rpc_ws_port}"
}

output "ecr_repository_url" {
  description = "ECR repository URL"
  value       = module.ecr.repository_url
}

output "ecs_cluster_name" {
  description = "ECS cluster name"
  value       = module.ecs_cluster.cluster_name
}

output "ecs_service_name" {
  description = "ECS service name"
  value       = module.ecs_service.service_name
}

output "blockchain_data_volume_ids" {
  description = "EBS volume IDs for blockchain data"
  value       = module.ebs.volume_ids
}
