output "ecr_repository_url" {
  description = "URL of the ECR Repository for pushing Docker images"
  value       = aws_ecr_repository.lxon_node.repository_url
}

output "alb_dns_name" {
  description = "Public DNS address of the AWS Application Load Balancer"
  value       = aws_lb.lxon_alb.dns_name
}

output "ecs_cluster_name" {
  description = "Name of the ECS Cluster"
  value       = aws_ecs_cluster.lxon_cluster.name
}

output "rpc_endpoint" {
  description = "LXON Blockchain Node JSON-RPC Endpoint"
  value       = "http://${aws_lb.lxon_alb.dns_name}:8545"
}
