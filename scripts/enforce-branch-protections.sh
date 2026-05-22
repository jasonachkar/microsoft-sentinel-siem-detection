#!/bin/bash
# Enforces strict DevSecOps branch protections on the main branch via GitHub API.
# Prerequisites: GitHub CLI (gh) installed and authenticated.

# NOTE: Update this variable to match your GitHub Username/Repository
REPO="your-github-username/sentinel-detection-pack" 

echo "Locking down main branch for $REPO..."

# Applies configuration requiring PRs, reviewers, and successful pipeline checks
gh api \
  --method PUT \
  -H "Accept: application/vnd.github+json" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  /repos/$REPO/branches/main/protection \
  -f "required_status_checks[strict]=true" \
  -f "required_status_checks[contexts][]=Validate Rules & Security Scan" \
  -f "enforce_admins=true" \
  -f "required_pull_request_reviews[dismiss_stale_reviews]=true" \
  -f "required_pull_request_reviews[require_code_owner_reviews]=true" \
  -f "required_pull_request_reviews[required_approving_review_count]=1" \
  -f "restrictions=null"

echo "Branch protections and pull request controls applied successfully."