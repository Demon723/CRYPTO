variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "container_insights" {
  type = bool
  default = true
}
