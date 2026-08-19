# RDS Subnet Group
resource "aws_db_subnet_group" "main" {
  name       = "${var.project_name}-db-subnet-group"
  subnet_ids = [for subnet in aws_subnet.database : subnet.id]

  tags = {
    Name        = "${var.project_name}-db-subnet-group"
    Environment = var.environment
  }
}

# RDS Parameter Group
resource "aws_db_parameter_group" "main" {
  name   = "${var.project_name}-db-params"
  family = "postgres16"

  parameter {
    name  = "log_connections"
    value = "1"
  }

  parameter {
    name  = "log_disconnections"
    value = "1"
  }

  parameter {
    name  = "log_statement"
    value = "all"
  }
}

# RDS Instance
resource "aws_db_instance" "main" {
  identifier             = "${var.project_name}-db"
  allocated_storage      = var.db_allocated_storage
  max_allocated_storage  = var.db_allocated_storage * 2
  storage_type           = "gp3"
  storage_encrypted      = true
  engine                 = "postgres"
  engine_version         = "16.1"
  instance_class         = var.db_instance_class
  db_name                = var.db_name
  username               = var.db_username
  password               = random_string.db_password.result
  db_subnet_group_name   = aws_db_subnet_group.main.name
  parameter_group_name   = aws_db_parameter_group.main.name
  multi_az               = var.enable_multi_az
  publicly_accessible    = false
  skip_final_snapshot    = var.environment == "production" ? false : true
  final_snapshot_identifier = "${var.project_name}-db-final-snapshot-${formatdate("YYYY-MM-DD-hhmm", timestamp())}"
  backup_retention_period = var.environment == "production" ? 30 : 7
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"

  vpc_security_group_ids = [aws_security_group.rds.id]

  tags = {
    Name        = "${var.project_name}-db"
    Environment = var.environment
  }
}

# Random password for RDS
resource "random_string" "db_password" {
  length  = 16
  special = false
}

# Store DB password in Secrets Manager
resource "aws_secretsmanager_secret" "db_credentials" {
  name = "${var.project_name}/db/credentials"

  tags = {
    Environment = var.environment
  }
}

resource "aws_secretsmanager_secret_version" "db_credentials" {
  secret_id     = aws_secretsmanager_secret.db_credentials.id
  secret_string = jsonencode({
    username = var.db_username
    password = random_string.db_password.result
    host     = aws_db_instance.main.address
    port     = aws_db_instance.main.port
    database = var.db_name
  })
}
