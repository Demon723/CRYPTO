variable "aws_region" {
  description = "AWS region for LXON node deployment"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Deployment environment (mainnet, testnet, devnet)"
  type        = string
  default     = "mainnet"
}

variable "chain_id" {
  description = "LXON Blockchain Chain ID"
  type        = number
  default     = 723
}

variable "node_count" {
  description = "Number of validator/full nodes to deploy"
  type        = number
  default     = 3
}

variable "container_cpu" {
  description = "CPU units for LXON node task (1024 = 1 vCPU)"
  type        = number
  default     = 2048
}

variable "container_memory" {
  description = "Memory (in MB) for LXON node task"
  type        = number
  default     = 4096
}

variable "storage_gb" {
  description = "Persistent EBS storage volume size in GB for MonadDB state engine"
  type        = number
  default     = 100
}
