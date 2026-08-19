aws_region         = "us-east-1"
project_name       = "lxon-node"
environment        = "prod"

# VPC
vpc_cidr               = "10.0.0.0/16"
availability_zones     = ["us-east-1a", "us-east-1b"]
public_subnet_cidrs    = ["10.0.1.0/24", "10.0.2.0/24"]
private_subnet_cidrs   = ["10.0.10.0/24", "10.0.11.0/24"]

# Security
rpc_ingress_cidr       = ["0.0.0.0/0"]

# Blockchain
chain_id               = 1
network_id             = 1
max_peers              = 50

# Compute
task_cpu               = 4096      # 4 vCPU
task_memory            = 8192      # 8 GB RAM

# Ports
rpc_port               = 8545
rpc_ws_port            = 8546

# Storage
blockchain_data_volume_size = 500  # 500 GB
blockchain_data_volume_type = "gp3"
blockchain_data_iops        = 3000
blockchain_data_throughput  = 125

# Alerts
# Set via environment or terraform.tfvars.local:
# alert_email          = "ops@example.com"
# validator_address    = "0x..."
# validator_key        = "0x..."
# genesis_time         = 1704067200
