#!/bin/bash

REGION="${AWS_REGION:-us-east-1}"

echo "🔍 LXON Node - Free Tier Status Check"
echo "======================================"
echo ""

INSTANCE_ID=$(aws ec2 describe-instances \
  --filters "Name=tag:Name,Values=lxon-node-node" "Name=instance-state-name,Values=running" \
  --query 'Reservations[0].Instances[0].InstanceId' \
  --output text --region $REGION 2>/dev/null)

if [ "$INSTANCE_ID" == "None" ] || [ -z "$INSTANCE_ID" ]; then
  echo "No running LXON node instance found."
  exit 0
fi

echo "Instance ID: $INSTANCE_ID"
echo ""

aws ec2 describe-instances \
  --instance-ids $INSTANCE_ID \
  --region $REGION \
  --query 'Reservations[0].Instances[0].[InstanceType,State.Name,PublicIpAddress,LaunchTime]' \
  --output table

echo ""
echo "📊 Free Tier Usage Estimate:"
LAUNCH_TIME=$(aws ec2 describe-instances --instance-ids $INSTANCE_ID --region $REGION --query 'Reservations[0].Instances[0].LaunchTime' --output text)
echo "  Instance running since: $LAUNCH_TIME"
echo "  Free Tier limit: 750 hours/month (t2.micro)"
echo ""

echo "💾 EBS Volumes:"
aws ec2 describe-volumes \
  --filters "Name=attachment.instance-id,Values=$INSTANCE_ID" \
  --region $REGION \
  --query 'Volumes[*].[VolumeId,Size,VolumeType]' \
  --output table

echo ""
echo "💰 Check current month billing:"
echo "  https://console.aws.amazon.com/billing/home#/bills"
echo ""
echo "📈 Check Free Tier usage:"
echo "  https://console.aws.amazon.com/billing/home#/freetier"
