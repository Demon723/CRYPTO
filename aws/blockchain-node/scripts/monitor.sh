#!/bin/bash

# LXON Node - AWS Monitoring Script
# Monitor blockchain node health, performance, and logs

REGION="${AWS_REGION:-us-east-1}"
CLUSTER_NAME="lxon-node-prod"
SERVICE_NAME="lxon-node-node"

echo "🔍 LXON Blockchain Node - Monitoring Dashboard"
echo "=============================================="
echo ""

# Service Status
echo "📊 Service Status"
aws ecs describe-services \
  --cluster $CLUSTER_NAME \
  --services $SERVICE_NAME \
  --region $REGION \
  --query 'services[0].[serviceName,status,runningCount,desiredCount,pendingCount]' \
  --output table

echo ""
echo "📈 Recent Logs"
aws logs tail /ecs/lxon-node-prod --follow --max-items 50 --region $REGION

echo ""
echo "⚠️  Active Alarms"
aws cloudwatch describe-alarms \
  --alarm-name-prefix lxon-node \
  --state-value ALARM \
  --region $REGION \
  --query 'MetricAlarms[*].[AlarmName,StateReason]' \
  --output table

echo ""
echo "💾 Container Insights Metrics"
aws cloudwatch get-metric-statistics \
  --namespace AWS/ECS \
  --metric-name CPUUtilization \
  --dimensions Name=ClusterName,Value=$CLUSTER_NAME \
  --start-time $(date -u -d '10 minutes ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Average \
  --region $REGION \
  --query 'Datapoints | sort_by(@, &Timestamp)[-5:]' \
  --output table

echo ""
echo "To see live logs:"
echo "  aws logs tail /ecs/lxon-node-prod --follow"
echo ""
echo "To scale the service:"
echo "  aws ecs update-service --cluster $CLUSTER_NAME --service $SERVICE_NAME --desired-count 2"
echo ""
