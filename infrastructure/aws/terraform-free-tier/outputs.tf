output "public_ip" {
  description = "Static Elastic IP address of the LXON Free Tier Node"
  value       = aws_eip.lxon_eip.public_ip
}

output "rpc_endpoint" {
  description = "LXON Blockchain Node JSON-RPC Endpoint (Port 8545)"
  value       = "http://${aws_eip.lxon_eip.public_ip}:8545"
}

output "health_check_url" {
  description = "AWS Free Tier Node Health Check URL"
  value       = "http://${aws_eip.lxon_eip.public_ip}:8545/health"
}

output "metrics_url" {
  description = "AWS Free Tier Node Metrics Endpoint"
  value       = "http://${aws_eip.lxon_eip.public_ip}:8545/metrics"
}

output "monthly_cost" {
  description = "Estimated AWS Monthly Cost"
  value       = "zsh.00 (100% AWS Free Tier Covered)"
}
