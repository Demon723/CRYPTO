#!/bin/bash

# Script to create GitHub Pull Request for GCP Deployment
# Usage: ./create-gcp-pr.sh "PR Title" "Description"

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo -e "${RED}Error: GitHub CLI (gh) is not installed${NC}"
    echo "Install it from: https://cli.github.com/"
    exit 1
fi

# Check if user is authenticated
if ! gh auth status &> /dev/null; then
    echo -e "${RED}Error: Not authenticated with GitHub${NC}"
    echo "Run: gh auth login"
    exit 1
fi

# Get PR title from argument
PR_TITLE="${1:-GCP Deployment Update}"
PR_DESCRIPTION="${2:-Deploying latest changes to Google Cloud Platform}"

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)
MAIN_BRANCH="main"

# Check if there are changes to commit
if git diff --quiet && git diff --cached --quiet; then
    echo -e "${YELLOW}No changes to commit${NC}"
    echo "Make some changes first, then run this script again"
    exit 1
fi

echo -e "${GREEN}=== Creating GCP Deployment Pull Request ===${NC}"
echo ""

# Stage all changes
echo "Staging changes..."
git add .

# Commit changes
echo "Committing changes..."
git commit -m "$PR_TITLE"

# Push to remote
echo "Pushing to remote..."
git push -u origin "$CURRENT_BRANCH"

# Create pull request
echo "Creating pull request..."
gh pr create \
  --title "$PR_TITLE" \
  --body "$PR_DESCRIPTION" \
  --base "$MAIN_BRANCH" \
  --head "$CURRENT_BRANCH" \
  --label "gcp,deployment" \
  --reviewer "$(git config user.name)" \
  --assignee "$(git config user.name)"

echo -e "${GREEN}=== Pull Request Created Successfully ===${NC}"
echo ""
echo "PR URL: $(gh pr view --web)"
