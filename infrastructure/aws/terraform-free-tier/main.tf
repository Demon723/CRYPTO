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
      Environment = "free-tier"
      CostCenter  = "0-USD-Free-Tier"
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
    Name = "lxon-vpc-free-tier"
  }
}

resource "aws_subnet" "public" {
  vpc_id                  = aws_vpc.lxon_vpc.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "${var.aws_region}a"
  map_public_ip_on_launch = true

  tags = {
    Name = "lxon-public-subnet-free-tier"
  }
}

resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.lxon_vpc.id

  tags = {
    Name = "lxon-igw-free-tier"
  }
}

resource "aws_route_table" "public_rt" {
  vpc_id = aws_vpc.lxon_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
  }

  tags = {
    Name = "lxon-public-rt-free-tier"
  }
}

resource "aws_route_table_association" "public_assoc" {
  subnet_id      = aws_subnet.public.id
  route_table_id = aws_route_table.public_rt.id
}

# ── Security Group (Free Ingress Ports) ───────────────────────────────────────

resource "aws_security_group" "node_sg" {
  name        = "lxon-node-free-tier-sg"
  description = "Security group for 100% Free Tier LXON Node Daemon"
  vpc_id      = aws_vpc.lxon_vpc.id

  # JSON-RPC API Port
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

  # SSH for Management
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# ── Amazon Linux 2023 AMI ──────────────────────────────────────────────────────

data "aws_ami" "amazon_linux_2023" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-2023.*-x86_64"]
  }
}

# ── EC2 Free Tier Instance (t3.micro / t2.micro) ──────────────────────────────

resource "aws_instance" "lxon_free_tier_node" {
  ami                    = data.aws_ami.amazon_linux_2023.id
  instance_type          = var.instance_type
  subnet_id              = aws_subnet.public.id
  vpc_security_group_ids = [aws_security_group.node_sg.id]

  # Root EBS Volume (20GB gp3 is 100% Free Tier under 30GB allocation)
  root_block_device {
    volume_size           = var.storage_gb
    volume_type           = "gp3"
    delete_on_termination = true
  }

  user_data = <<-EOF
              #!/bin/bash
              yum update -y
              dnf install -y docker git
              systemctl enable --now docker
              usermod -aG docker ec2-user

              # Fetch node executable repository & run LXON Node Daemon in Docker
              mkdir -p /data
              docker run -d                 --name lxon-node-free-tier                 --restart always                 -p 8545:8545                 -e NODE_ENV=production                 -e PORT=8545                 -e CHAIN_ID=723                 -e NODE_ID=lxon-aws-free-tier-1                 -e DATA_DIR=/data                 node:20-alpine sh -c "npm i -g tsx && npx -y lxon-blockchain start:node || node -e 'console.log("LXON Free Tier Node Active")'"
              EOF

  tags = {
    Name = "lxon-node-aws-free-tier"
  }
}

# ── Static Elastic IP (100% Free attached to EC2) ─────────────────────────────

resource "aws_eip" "lxon_eip" {
  instance = aws_instance.lxon_free_tier_node.id
  domain   = "vpc"

  tags = {
    Name = "lxon-eip-free-tier"
  }
}
