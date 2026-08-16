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

variable "lxon_node_image" {
  type = string
}

variable "lxon_backend_image" {
  type = string
}

variable "lxon_explorer_image" {
  type = string
}

variable "task_execution_role_arn" {
  type = string
}

variable "task_role_arn" {
  type = string
}

variable "backend_target_group_arn" {
  type = string
}

variable "explorer_target_group_arn" {
  type = string
}

variable "security_group_ids" {
  type = list(string)
}

variable "db_endpoint" {
  type = string
}

variable "db_name" {
  type = string
}

variable "db_username" {
  type = string
}

variable "db_password" {
  type      = string
  sensitive = true
}

variable "redis_endpoint" {
  type = string
}

variable "chain_id" {
  type = number
}

variable "genesis_time" {
  type = number
}

variable "validator_address" {
  type      = string
  sensitive = true
}

variable "validator_key" {
  type      = string
  sensitive = true
}
