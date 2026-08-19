# User data script to start LXON node
locals {
  user_data = base64encode(templatefile("${path.module}/user-data.sh", {
    validator_address = var.validator_address
    validator_key     = var.validator_key
    chain_id          = var.chain_id
    genesis_time      = var.genesis_time
  }))
}

# Root volume (Free Tier: 30GB/month free, using 15GB)
resource "aws_ebs_volume" "root" {
  availability_zone = data.aws_availability_zones.available.names[0]
  size              = var.root_volume_size
  type              = "gp2"  # Free Tier eligible
  encrypted         = true

  tags = {
    Name = "${var.project_name}-root"
  }
}

# Data volume for blockchain (Free Tier: 30GB/month free, using 15GB)
resource "aws_ebs_volume" "data" {
  availability_zone = data.aws_availability_zones.available.names[0]
  size              = var.data_volume_size
  type              = "gp2"  # Free Tier eligible
  encrypted         = true

  tags = {
    Name = "${var.project_name}-data"
  }
}

# EC2 Instance (Free Tier: t2.micro, 750 hours/month)
resource "aws_instance" "lxon_node" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = var.instance_type
  subnet_id              = var.subnet_id
  vpc_security_group_ids = [var.security_group_id]
  
  # Free tier: 750 hours/month t2.micro
  monitoring             = false  # Free tier uses basic monitoring

  root_block_device {
    volume_size           = var.root_volume_size
    volume_type           = "gp2"
    delete_on_termination = true
    encrypted             = true
  }

  user_data = local.user_data

  tags = {
    Name = "${var.project_name}-node"
  }

  depends_on = [var.security_group_id]
}

# Attach data volume
resource "aws_volume_attachment" "data" {
  device_name = "/dev/sdf"
  volume_id   = aws_ebs_volume.data.id
  instance_id = aws_instance.lxon_node.id
}

# Get latest Ubuntu AMI (Free Tier eligible)
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"]  # Canonical

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }

  filter {
    name   = "root-device-type"
    values = ["ebs"]
  }
}

data "aws_availability_zones" "available" {
  state = "available"
}

output "instance_id" {
  value = aws_instance.lxon_node.id
}

output "private_ip" {
  value = aws_instance.lxon_node.private_ip
}

output "instance_type" {
  value = aws_instance.lxon_node.instance_type
}
