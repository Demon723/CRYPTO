variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "lxon-node"
}

variable "environment" {
  description = "Environment"
  type        = string
  default     = "prod"
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Must be dev, staging, or prod"
  }
}

# VPC
variable "vpc_cidr" {
  description = "VPC CIDR"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "Availability zones"
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b"]
}

variable "public_subnet_cidrs" {
  description = "Public subnet CIDRs"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "private_subnet_cidrs" {
  description = "Private subnet CIDRs"
  type        = list(string)
  default     = ["10.0.10.0/24", "10.0.11.0/24"]
}

# Security
variable "rpc_ingress_cidr" {
  description = "CIDR blocks allowed for RPC access"
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

variable "alert_email" {
  description = "Email for CloudWatch alerts"
  type        = string
  sensitive   = true
}

# Blockchain Configuration
variable "chain_id" {
  description = "Blockchain chain ID"
  type        = number
  default     = 1
}

variable "genesis_time" {
  description = "Genesis block timestamp"
  type        = number
  sensitive   = true
}

variable "validator_address" {
  description = "Validator address"
  type        = string
  sensitive   = true
}

variable "validator_key" {
  description = "Validator private key"
  type        = string
  sensitive   = true
}

variable "network_id" {
  description = "Network ID (same as chain_id typically)"
  type        = number
  default     = 1
}

variable "max_peers" {
  description = "Maximum number of peers"
  type        = number
  default     = 50
}

# ECS Configuration
variable "task_cpu" {
  description = "ECS task CPU units (256=0.25vCPU, 1024=1vCPU, 2048=2vCPU, etc)"
  type        = number
  default     = 4096
}

variable "task_memory" {
  description = "ECS task memory in MB"
  type        = number
  default     = 8192
}

variable "rpc_port" {
  description = "RPC port"
  type        = number
  default     = 8545
}

variable "rpc_ws_port" {
  description = "RPC WebSocket port"
  type        = number
  default     = 8546
}

# Storage
variable "blockchain_data_volume_size" {
  description = "EBS volume size for blockchain data (GB)"
  type        = number
  default     = 500
}

variable "blockchain_data_volume_type" {
  description = "EBS volume type (gp3, io1, io2)"
  type        = string
  default     = "gp3"
}

variable "blockchain_data_iops" {
  description = "EBS IOPS (for io1/io2/gp3)"
  type        = number
  default     = 3000
}

variable "blockchain_data_throughput" {
  description = "EBS throughput MB/s (gp3 only)"
  type        = number
  default     = 125
}
