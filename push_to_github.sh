#!/bin/bash
# Script to push to GitHub

# Check if URL is provided
if [ -z "$1" ]; then
    echo "Usage: ./push_to_github.sh <repository_url>"
    echo "Example: ./push_to_github.sh https://github.com/username/repo.git"
    exit 1
fi

REPO_URL=$1

# Add remote
git remote add origin $REPO_URL

# Rename branch to main
git branch -M main

# Push
git push -u origin main

echo "Pushed to $REPO_URL successfully!"
