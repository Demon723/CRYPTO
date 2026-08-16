aws_region     = "us-east-1"
project_name   = "lxon"
environment    = "prod"

# VPC
vpc_cidr               = "10.0.0.0/16"
availability_zones     = ["us-east-1a", "us-east-1b"]
public_subnet_cidrs    = ["10.0.1.0/24", "10.0.2.0/24"]
private_subnet_cidrs   = ["10.0.10.0/24", "10.0.11.0/24"]
alb_ingress_cidr       = ["0.0.0.0/0"]

# RDS (PostgreSQL)
db_instance_class  = "db.t3.small"
db_engine          = "postgres"
db_name            = "lxon"
db_username        = "lxon"
allocated_storage  = 50
backup_retention   = 7

# ElastiCache (Redis)
cache_node_type    = "cache.t3.micro"
num_cache_nodes    = 1

# Blockchain Configuration
chain_id           = 1
genesis_time       = 1704067200

# Note: Set these via environment variables or terraform.tfvars.local
# validator_address = "..."
# validator_key     = "..."
# db_password       = "..."
