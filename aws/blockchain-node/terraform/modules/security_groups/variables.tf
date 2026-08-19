variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "vpc_id" {
  type = string
}

variable "rpc_ingress_cidr" {
  type = list(string)
}
