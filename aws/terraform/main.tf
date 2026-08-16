terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket         = "lxon-terraform-state"
    key            = "prod/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "lxon-terraform-locks"
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "LXON"
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}

# VPC and Networking
module "vpc" {
  source = "./modules/vpc"

  project_name    = var.project_name
  environment     = var.environment
  vpc_cidr        = var.vpc_cidr
  availability_zones = var.availability_zones

  public_subnet_cidrs  = var.public_subnet_cidrs
  private_subnet_cidrs = var.private_subnet_cidrs
}

# ECR Repositories
module "ecr" {
  source = "./modules/ecr"

  project_name = var.project_name
  environment  = var.environment

  repositories = [
    "lxon-node",
    "lxon-backend",
    "lxon-explorer"
  ]
}

# Security Groups
module "security_groups" {
  source = "./modules/security_groups"

  project_name = var.project_name
  environment  = var.environment
  vpc_id       = module.vpc.vpc_id

  alb_ingress_cidr = var.alb_ingress_cidr
}

# Application Load Balancer
module "alb" {
  source = "./modules/alb"

  project_name    = var.project_name
  environment     = var.environment
  vpc_id          = module.vpc.vpc_id
  subnet_ids      = module.vpc.public_subnet_ids
  security_group  = module.security_groups.alb_sg_id
}

# RDS Database
module "rds" {
  source = "./modules/rds"

  project_name       = var.project_name
  environment        = var.environment
  vpc_id             = module.vpc.vpc_id
  db_subnet_ids      = module.vpc.private_subnet_ids
  security_group_ids = [module.security_groups.rds_sg_id]

  db_instance_class   = var.db_instance_class
  db_engine           = var.db_engine
  db_name             = var.db_name
  db_username         = var.db_username
  db_password         = var.db_password
  allocated_storage   = var.allocated_storage
  backup_retention    = var.backup_retention
}

# ElastiCache for Redis
module "elasticache" {
  source = "./modules/elasticache"

  project_name           = var.project_name
  environment            = var.environment
  vpc_id                 = module.vpc.vpc_id
  subnet_ids             = module.vpc.private_subnet_ids
  security_group_ids     = [module.security_groups.redis_sg_id]

  cache_node_type        = var.cache_node_type
  num_cache_nodes        = var.num_cache_nodes
}

# ECS Cluster
module "ecs_cluster" {
  source = "./modules/ecs_cluster"

  project_name = var.project_name
  environment  = var.environment

  container_insights = true
}

# IAM Roles for ECS Tasks
module "iam_roles" {
  source = "./modules/iam_roles"

  project_name = var.project_name
  environment  = var.environment
}

# ECS Services
module "ecs_services" {
  source = "./modules/ecs_services"

  project_name    = var.project_name
  environment     = var.environment
  cluster_arn     = module.ecs_cluster.cluster_arn
  cluster_name    = module.ecs_cluster.cluster_name
  vpc_id          = module.vpc.vpc_id
  subnet_ids      = module.vpc.private_subnet_ids

  # ECR Images
  lxon_node_image       = "${module.ecr.ecr_repositories["lxon-node"].repository_url}:latest"
  lxon_backend_image    = "${module.ecr.ecr_repositories["lxon-backend"].repository_url}:latest"
  lxon_explorer_image   = "${module.ecr.ecr_repositories["lxon-explorer"].repository_url}:latest"

  # Task execution role
  task_execution_role_arn = module.iam_roles.ecs_task_execution_role_arn
  task_role_arn          = module.iam_roles.ecs_task_role_arn

  # ALB Target Group Arns
  backend_target_group_arn = module.alb.backend_target_group_arn
  explorer_target_group_arn = module.alb.explorer_target_group_arn

  # Security Groups
  security_group_ids = [module.security_groups.ecs_sg_id]

  # Database
  db_endpoint   = module.rds.endpoint
  db_name       = var.db_name
  db_username   = var.db_username
  db_password   = var.db_password

  # Redis
  redis_endpoint = module.elasticache.endpoint

  # Blockchain Node Environment
  chain_id             = var.chain_id
  genesis_time         = var.genesis_time
  validator_address    = var.validator_address
  validator_key        = var.validator_key
}

# CloudWatch Alarms
module "monitoring" {
  source = "./modules/monitoring"

  project_name  = var.project_name
  environment   = var.environment
  cluster_name  = module.ecs_cluster.cluster_name
  sns_topic_arn = aws_sns_topic.alerts.arn

  # Services to monitor
  services = [
    "lxon-node",
    "lxon-backend",
    "lxon-explorer"
  ]
}

# SNS Topic for Alerts
resource "aws_sns_topic" "alerts" {
  name = "${var.project_name}-${var.environment}-alerts"
}

# Outputs
output "alb_dns_name" {
  description = "DNS name of the load balancer"
  value       = module.alb.alb_dns_name
}

output "ecr_repositories" {
  description = "ECR Repository URLs"
  value = {
    lxon_node     = module.ecr.ecr_repositories["lxon-node"].repository_url
    lxon_backend  = module.ecr.ecr_repositories["lxon-backend"].repository_url
    lxon_explorer = module.ecr.ecr_repositories["lxon-explorer"].repository_url
  }
}

output "rds_endpoint" {
  description = "RDS Database endpoint"
  value       = module.rds.endpoint
}

output "redis_endpoint" {
  description = "ElastiCache Redis endpoint"
  value       = module.elasticache.endpoint
}

output "ecs_cluster_name" {
  description = "ECS Cluster name"
  value       = module.ecs_cluster.cluster_name
}
