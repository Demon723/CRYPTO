resource "aws_cloudwatch_metric_alarm" "node_cpu_high" {
  alarm_name          = "${var.project_name}-node-cpu-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ECS"
  period              = "300"
  statistic           = "Average"
  threshold           = "85"
  alarm_description   = "Alert when LXON node CPU > 85%"
  alarm_actions       = [var.sns_topic_arn]

  dimensions = {
    ClusterName = var.cluster_name
  }
}

resource "aws_cloudwatch_metric_alarm" "node_memory_high" {
  alarm_name          = "${var.project_name}-node-memory-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "MemoryUtilization"
  namespace           = "AWS/ECS"
  period              = "300"
  statistic           = "Average"
  threshold           = "85"
  alarm_description   = "Alert when LXON node memory > 85%"
  alarm_actions       = [var.sns_topic_arn]

  dimensions = {
    ClusterName = var.cluster_name
  }
}

resource "aws_cloudwatch_metric_alarm" "node_unhealthy" {
  alarm_name          = "${var.project_name}-node-unhealthy"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "HealthyTaskCount"
  namespace           = "AWS/ECS"
  period              = "300"
  statistic           = "Average"
  threshold           = "1"
  alarm_description   = "Alert when LXON node has no healthy tasks"
  alarm_actions       = [var.sns_topic_arn]

  dimensions = {
    ClusterName = var.cluster_name
    ServiceName = "${var.project_name}-node"
  }
}

resource "aws_cloudwatch_metric_alarm" "node_task_count_zero" {
  alarm_name          = "${var.project_name}-node-task-count-zero"
  comparison_operator = "LessThanOrEqualToThreshold"
  evaluation_periods  = "1"
  metric_name         = "RunningTaskCount"
  namespace           = "AWS/ECS"
  period              = "60"
  statistic           = "Average"
  threshold           = "0"
  alarm_description   = "Alert when no LXON node tasks are running"
  alarm_actions       = [var.sns_topic_arn]

  dimensions = {
    ClusterName = var.cluster_name
    ServiceName = "${var.project_name}-node"
  }
}
