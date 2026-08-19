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
  default     = "freetier"
}

# VPC
variable "vpc_cidr" {
  description = "VPC CIDR"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zone" {
  description = "Single Availability Zone (Free Tier)"
  type        = string
  default     = "us-east-1a"
}

variable "public_subnet_cidr" {
  description = "Public subnet CIDR"
  type        = string
  default     = "10.0.1.0/24"
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

# EC2 Instance (Free Tier eligible)
variable "instance_type" {
  description = "EC2 instance type (t2.micro or t3.micro for Free Tier)"
  type        = string
  default     = "t2.micro"
  validation {
    condition     = contains(["t2.micro", "t3.micro"], var.instance_type)
    error_message = "Use t2.micro or t3.micro for Free Tier (750 hours/month free)"
  }
}

variable "root_volume_size" {
  description = "Root volume size in GB (Free Tier: 30GB/month included)"
  type        = number
  default     = 15
}

variable "data_volume_size" {
  description = "Data volume size for blockchain data (Free Tier: 30GB/month included)"
  type        = number
  default     = 15
}

variable "key_pair_name" {
  description = "EC2 key pair name for SSH access"
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
