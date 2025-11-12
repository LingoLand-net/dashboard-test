#!/usr/bin/env bash
set -euo pipefail

# Usage: ./commit_and_push.sh "Commit message" <remote-url>
MSG=${1:-"chore: update dashboard"}
REMOTE_URL=${2:-}

if [ -z "$REMOTE_URL" ]; then
  echo "Usage: $0 \"Commit message\" <git-remote-url>"
  exit 1
fi

# Initialize git if needed
if [ ! -d .git ]; then
  git init
fi

# Set default branch to main if HEAD doesn't exist
if ! git rev-parse --verify HEAD >/dev/null 2>&1; then
  git checkout -b main || true
fi

# Add remote if not present
if ! git remote get-url origin >/dev/null 2>&1; then
  git remote add origin "$REMOTE_URL"
else
  git remote set-url origin "$REMOTE_URL"
fi

# Stage all files (respecting .gitignore)
git add .

git commit -m "$MSG" || echo "Nothing to commit"

# Push
# If GITHUB_TOKEN is set, use it (for non-interactive CI-friendly push)
if [ -n "${GITHUB_TOKEN-}" ]; then
  # Convert https://github.com/owner/repo.git to https://x-access-token:TOKEN@github.com/owner/repo.git
  PUSH_URL=$(echo "$REMOTE_URL" | sed -E "s#https://#https://x-access-token:${GITHUB_TOKEN}@#")
  git push -u "$PUSH_URL" main
else
  git push -u origin main
fi

echo "Pushed to $REMOTE_URL" 
