#!/bin/bash

# Create a GitHub Pull Request from Google Cloud Shell
# Usage: ./create-gcp-pr.sh "PR Title" "PR Description" "[base_branch]"
#
# Google Cloud Shell comes with git and gh CLI pre-installed.
# You must authenticate gh first:
#   gh auth login --hostname github.com

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# --- Prerequisites -----------------------------------------------------------

if ! command -v gh &> /dev/null; then
    echo -e "${RED}Error: GitHub CLI (gh) is not installed${NC}"
    echo "Install: curl -sf https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg"
    exit 1
fi

if ! gh auth status &> /dev/null; then
    echo -e "${RED}Error: Not authenticated with GitHub${NC}"
    echo "Run: gh auth login --hostname github.com"
    exit 1
fi

REPO_NAME=$(gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null || echo "")
if [ -z "$REPO_NAME" ]; then
    REPO_NAME=$(git remote get-url origin 2>/dev/null | sed -E 's#(git@|https://)github.com[:/](.+)(\.git)?#\2#')
fi

PR_TITLE="${1:-GCP Deployment Update}"
PR_DESCRIPTION="${2:-Deploying latest changes to Google Cloud Platform}"
BASE_BRANCH="${3:-main}"

CURRENT_BRANCH=$(git branch --show-current)
if [ -z "$CURRENT_BRANCH" ]; then
    echo -e "${RED}Error: Detached HEAD state. Checkout a branch first.${NC}"
    exit 1
fi

echo -e "${GREEN}=== Creating GCP Deployment Pull Request ===${NC}"
echo "Repository:  ${REPO_NAME}"
echo "Head:        ${CURRENT_BRANCH}"
echo "Base:        ${BASE_BRANCH}"
echo "Title:       ${PR_TITLE}"
echo ""

# --- Stage & commit ----------------------------------------------------------

if git diff --quiet && git diff --cached --quiet; then
    echo -e "${YELLOW}No changes to commit${NC}"
else
    echo "Staging changes..."
    git add .

    echo "Committing changes..."
    git commit -m "$PR_TITLE"
fi

# --- Push --------------------------------------------------------------------

echo "Pushing to remote..."
git push -u origin "$CURRENT_BRANCH"

# --- Create / sync PR --------------------------------------------------------

echo "Creating pull request..."
if gh pr view "$CURRENT_BRANCH" &> /dev/null 2>&1; then
    echo -e "${YELLOW}PR already exists for branch '${CURRENT_BRANCH}'. Syncing with new commits...${NC}"
    gh pr edit "$CURRENT_BRANCH" \
        --title "$PR_TITLE" \
        --body "$PR_DESCRIPTION"
else
    gh pr create \
        --title "$PR_TITLE" \
        --body "$PR_DESCRIPTION" \
        --base "$BASE_BRANCH" \
        --head "$CURRENT_BRANCH" \
        --label "gcp,deployment"
fi

PR_URL=$(gh pr view "$CURRENT_BRANCH" --json url -q .url)
echo -e "${GREEN}=== Pull Request Created ===${NC}"
echo "URL: ${PR_URL}"
echo ""
echo "Open in browser: gh pr view --web"
