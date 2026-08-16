variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "cluster_arn" {
  type = string
}

variable "cluster_name" {
  type = string
}

variable "vpc_id" {
  type = string
}

variable "subnet_ids" {
  type = list(string)
}

variable "security_group_ids" {
  type = list(string)
}

variable "node_image" {
  type = string
}

variable "task_execution_role_arn" {
  type = string
}

variable "task_role_arn" {
  type = string
}

variable "chain_id" {
  type = number
}

variable "genesis_time" {
  type = number
  sensitive = true
}

variable "validator_address" {
  type = string
  sensitive = true
}

variable "validator_key" {
  type = string
  sensitive = true
}

variable "network_id" {
  type = number
}

variable "task_cpu" {
  type = number
}

variable "task_memory" {
  type = number
}

variable "rpc_port" {
  type = number
}

variable "rpc_ws_port" {
  type = number
}

variable "max_peers" {
  type = number
}
