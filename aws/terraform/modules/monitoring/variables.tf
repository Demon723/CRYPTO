variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "cluster_name" {
  type = string
}

variable "sns_topic_arn" {
  type = string
}

variable "services" {
  type = list(string)
}
