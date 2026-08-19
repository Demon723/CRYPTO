terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "LXON-Blockchain"
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}

# ── VPC & Networking ──────────────────────────────────────────────────────────

resource "aws_vpc" "lxon_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "lxon-vpc-${var.environment}"
  }
}

resource "aws_subnet" "public_a" {
  vpc_id                  = aws_vpc.lxon_vpc.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "${var.aws_region}a"
  map_public_ip_on_launch = true

  tags = {
    Name = "lxon-public-subnet-a"
  }
}

resource "aws_subnet" "public_b" {
  vpc_id                  = aws_vpc.lxon_vpc.id
  cidr_block              = "10.0.2.0/24"
  availability_zone       = "${var.aws_region}b"
  map_public_ip_on_launch = true

  tags = {
    Name = "lxon-public-subnet-b"
  }
}

resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.lxon_vpc.id

  tags = {
    Name = "lxon-igw-${var.environment}"
  }
}

resource "aws_route_table" "public_rt" {
  vpc_id = aws_vpc.lxon_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
  }

  tags = {
    Name = "lxon-public-rt"
  }
}

resource "aws_route_table_association" "public_a_assoc" {
  subnet_id      = aws_subnet.public_a.id
  route_table_id = aws_route_table.public_rt.id
}

resource "aws_route_table_association" "public_b_assoc" {
  subnet_id      = aws_subnet.public_b.id
  route_table_id = aws_route_table.public_rt.id
}

# ── Security Groups ───────────────────────────────────────────────────────────

resource "aws_security_group" "node_sg" {
  name        = "lxon-node-sg-${var.environment}"
  description = "Security Group for LXON Blockchain Node Daemon"
  vpc_id      = aws_vpc.lxon_vpc.id

  # JSON-RPC Port
  ingress {
    from_port   = 8545
    to_port     = 8545
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # P2P Consensus Port
  ingress {
    from_port   = 30303
    to_port     = 30303
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "lxon-node-security-group"
  }
}
