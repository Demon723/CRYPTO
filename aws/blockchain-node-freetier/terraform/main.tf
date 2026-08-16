terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket         = "lxon-freetier-terraform-state"
    key            = "prod/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "lxon-freetier-terraform-locks"
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "LXON-FreeNode"
      Environment = var.environment
      ManagedBy   = "Terraform"
      CostOptimized = "true"
    }
  }
}

# VPC (Free Tier)
module "vpc" {
  source = "./modules/vpc"

  project_name       = var.project_name
  environment        = var.environment
  vpc_cidr           = var.vpc_cidr
  availability_zone  = var.availability_zone
  public_subnet_cidr = var.public_subnet_cidr
}

# ECR Repository (Free Tier - 500MB/month free)
module "ecr" {
  source = "./modules/ecr"

  project_name = var.project_name
  environment  = var.environment
  repository   = "lxon-node"
}

# Security Groups
module "security_groups" {
  source = "./modules/security_groups"

  project_name     = var.project_name
  environment      = var.environment
  vpc_id           = module.vpc.vpc_id
  rpc_ingress_cidr = var.rpc_ingress_cidr
}

# EC2 Instance (instead of ECS - Free Tier eligible)
module "ec2_instance" {
  source = "./modules/ec2"

  project_name        = var.project_name
  environment         = var.environment
  vpc_id              = module.vpc.vpc_id
  subnet_id           = module.vpc.public_subnet_id
  security_group_id   = module.security_groups.instance_sg_id
  instance_type       = var.instance_type
  root_volume_size    = var.root_volume_size
  data_volume_size    = var.data_volume_size
  key_pair_name       = var.key_pair_name
  validator_address   = var.validator_address
  validator_key       = var.validator_key
  chain_id            = var.chain_id
  genesis_time        = var.genesis_time
}

# CloudWatch Monitoring (Free Tier - 10 alarms/month free)
module "monitoring" {
  source = "./modules/monitoring"

  project_name         = var.project_name
  environment          = var.environment
  instance_id          = module.ec2_instance.instance_id
  sns_topic_arn        = aws_sns_topic.alerts.arn
  enable_detailed_monitoring = false  # Free tier uses basic monitoring
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

# Elastic IP (Free Tier - 1 free if associated with running instance)
resource "aws_eip" "node" {
  domain    = "vpc"
  instance  = module.ec2_instance.instance_id
  tags = {
    Name = "${var.project_name}-eip"
  }
  depends_on = [module.vpc.internet_gateway_id]
}

# Outputs
output "node_public_ip" {
  description = "Public IP of blockchain node"
  value       = aws_eip.node.public_ip
}

output "node_rpc_endpoint" {
  description = "RPC endpoint"
  value       = "http://${aws_eip.node.public_ip}:8545"
}

output "node_ws_endpoint" {
  description = "WebSocket endpoint"
  value       = "ws://${aws_eip.node.public_ip}:8546"
}

output "ecr_repository_url" {
  description = "ECR repository URL"
  value       = module.ecr.repository_url
}

output "instance_id" {
  description = "EC2 instance ID"
  value       = module.ec2_instance.instance_id
}

output "free_tier_usage" {
  description = "Free Tier components"
  value = {
    vpc_and_subnets = "Free"
    elastic_ip      = "Free (1/account if associated)"
    instance_type   = "${var.instance_type} - Check Free Tier eligibility"
    ebs_storage     = "${var.root_volume_size}GB root + ${var.data_volume_size}GB data (30GB/month free)"
    ecr_storage     = "500MB/month free"
    cloudwatch      = "10 alarms free/month, basic monitoring"
    sns             = "1000 email notifications free/month"
  }
}
