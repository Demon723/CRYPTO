resource "aws_elasticache_subnet_group" "main" {
  name       = "${var.project_name}-cache-subnet-group"
  subnet_ids = var.subnet_ids

  tags = {
    Name = "${var.project_name}-cache-subnet-group"
  }
}

resource "aws_elasticache_cluster" "main" {
  cluster_id           = "${var.project_name}-redis"
  engine               = "redis"
  engine_version       = "7.0"
  node_type            = var.cache_node_type
  num_cache_nodes      = var.num_cache_nodes
  parameter_group_name = "default.redis7"
  port                 = 6379
  subnet_group_name    = aws_elasticache_subnet_group.main.name
  security_group_ids   = var.security_group_ids

  automatic_failover_enabled = var.num_cache_nodes > 1 ? true : false
  engine_version             = "7.0"
  
  snapshot_retention_limit = 7
  snapshot_window          = "02:00-03:00"

  tags = {
    Name = "${var.project_name}-redis"
  }
}

output "endpoint" {
  value = aws_elasticache_cluster.main.cache_nodes[0].address
}

output "port" {
  value = aws_elasticache_cluster.main.port
}
