variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "vpc_id" {
  type = string
}

variable "subnet_id" {
  type = string
}

variable "security_group_id" {
  type = string
}

variable "instance_type" {
  type = string
}

variable "root_volume_size" {
  type = number
}

variable "data_volume_size" {
  type = number
}

variable "key_pair_name" {
  type      = string
  sensitive = true
}

variable "validator_address" {
  type      = string
  sensitive = true
}

variable "validator_key" {
  type      = string
  sensitive = true
}

variable "chain_id" {
  type = number
}

variable "genesis_time" {
  type      = number
  sensitive = true
}
