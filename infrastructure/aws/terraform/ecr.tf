resource "aws_ecr_repository" "lxon_node" {
  name                 = "lxon-blockchain-node"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name = "lxon-blockchain-node-ecr"
  }
}
