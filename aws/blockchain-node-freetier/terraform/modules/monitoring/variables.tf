variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "instance_id" {
  type = string
}

variable "sns_topic_arn" {
  type = string
}

variable "enable_detailed_monitoring" {
  type    = bool
  default = false
}
