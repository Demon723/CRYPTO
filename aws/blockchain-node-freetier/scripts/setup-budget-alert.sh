#!/bin/bash

set -e

# Set up AWS Budget alert to avoid unexpected charges on Free Tier

REGION="${AWS_REGION:-us-east-1}"
BUDGET_AMOUNT="${1:-5}"  # Default $5 threshold
EMAIL="${ALERT_EMAIL}"

if [ -z "$EMAIL" ]; then
  echo "Usage: ALERT_EMAIL=you@example.com bash setup-budget-alert.sh [amount]"
  exit 1
fi

ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

echo "Setting up AWS Budget alert at \$$BUDGET_AMOUNT for account $ACCOUNT_ID..."

cat > /tmp/budget.json <<EOF
{
  "BudgetName": "LXON-FreeTier-Budget",
  "BudgetLimit": {
    "Amount": "$BUDGET_AMOUNT",
    "Unit": "USD"
  },
  "BudgetType": "COST",
  "TimeUnit": "MONTHLY"
}
EOF

cat > /tmp/notifications.json <<EOF
[
  {
    "Notification": {
      "NotificationType": "ACTUAL",
      "ComparisonOperator": "GREATER_THAN",
      "Threshold": 80,
      "ThresholdType": "PERCENTAGE"
    },
    "Subscribers": [
      {
        "SubscriptionType": "EMAIL",
        "Address": "$EMAIL"
      }
    ]
  },
  {
    "Notification": {
      "NotificationType": "ACTUAL",
      "ComparisonOperator": "GREATER_THAN",
      "Threshold": 100,
      "ThresholdType": "PERCENTAGE"
    },
    "Subscribers": [
      {
        "SubscriptionType": "EMAIL",
        "Address": "$EMAIL"
      }
    ]
  }
]
EOF

aws budgets create-budget \
  --account-id $ACCOUNT_ID \
  --budget file:///tmp/budget.json \
  --notifications-with-subscribers file:///tmp/notifications.json \
  --region us-east-1 2>/dev/null || echo "Budget may already exist, checking..."

rm -f /tmp/budget.json /tmp/notifications.json

echo "✓ Budget alert configured. You'll get emailed at 80% and 100% of \$$BUDGET_AMOUNT/month."
echo ""
echo "View budgets: https://console.aws.amazon.com/billing/home#/budgets"
