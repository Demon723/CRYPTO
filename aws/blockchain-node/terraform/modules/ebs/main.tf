# EBS Volumes for blockchain data (one per AZ for redundancy)
resource "aws_ebs_volume" "blockchain_data" {
  count             = length(var.availability_zones)
  availability_zone = var.availability_zones[count.index]
  size              = var.volume_size
  type              = "gp3"
  iops              = 3000
  throughput        = 125
  encrypted         = true

  tags = {
    Name = "${var.project_name}-data-${count.index + 1}"
  }
}

output "volume_ids" {
  value = aws_ebs_volume.blockchain_data[*].id
}

output "volume_arns" {
  value = aws_ebs_volume.blockchain_data[*].arn
}
