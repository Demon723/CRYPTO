variable "aws_region" {
  description = "AWS Region (e.g. us-east-1, us-west-2)"
  type        = string
  default     = "us-east-1"
}

variable "instance_type" {
  description = "EC2 Instance type (t3.micro or t2.micro are 100% AWS Free Tier eligible)"
  type        = string
  default     = "t3.micro"
}

variable "storage_gb" {
  description = "EBS storage volume in GB (30GB total free tier limit)"
  type        = number
  default     = 20
}
