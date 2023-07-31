#!/bin/bash

set -e

# Function to fetch pull requests with the given label
function fetch_pull_requests() {
  local label="$1"
  echo "Fetching pull requests with label '$label'..."
  curl -s -H "Authorization: Bearer $GITHUB_TOKEN" "https://api.github.com/repos/${GITHUB_REPOSITORY}/pulls?state=open&labels=$label" \
    | jq -r '.[] | .number, .created_at'
}

# Function to check if a pull request has the IGNORE_LABEL
function has_ignore_label() {
  local pr_number="$1"
  echo "Checking if pull request #$pr_number has the IGNORE_LABEL..."
  local labels=$(curl -s -H "Authorization: Bearer $GITHUB_TOKEN" "https://api.github.com/repos/${GITHUB_REPOSITORY}/pulls/$pr_number" \
    | jq -r '.labels[].name')
  if [[ "$labels" =~ "IGNORE_LABEL" ]]; then
    return 0
  else
    return 1
  fi
}

# Function to count approvals for a pull request
function count_approvals() {
  local pr_number="$1"
  echo "Counting approvals for pull request #$pr_number..."
  local approval_count=$(curl -s -H "Authorization: Bearer $GITHUB_TOKEN" "https://api.github.com/repos/${GITHUB_REPOSITORY}/pulls/$pr_number/reviews" \
    | jq -r '[.[] | select(.state == "APPROVED")] | length')
  echo "$approval_count"
}

# Main script

# Convert UPDATE_LABEL and IGNORE_LABEL secrets to arrays
IFS=',' read -r -a update_labels <<< "$UPDATE_LABEL"
IFS=',' read -r -a ignore_labels <<< "$IGNORE_LABEL"

# Fetch pull requests with the given UPDATE_LABEL and filter by MIN_APPROVAL_COUNT
pull_requests_info=""
for label in "${update_labels[@]}"; do
  pull_requests_info+=$(fetch_pull_requests "$label")
done

pull_request_list=()
while read -r pr_number && read -r created_at; do
  if ! has_ignore_label "$pr_number" && [ "$(count_approvals "$pr_number")" -ge "$MIN_APPROVAL_COUNT" ]; then
    pull_request_list+=("$created_at $pr_number")
  fi
done <<< "$pull_requests_info"

# Check if there are any eligible pull requests to process
if [ "${#pull_request_list[@]}" -eq 0 ]; then
  echo "No eligible pull requests found."
  exit 0
fi

# Sort the eligible pull requests by creation date in ascending order
sorted_pull_request_list=($(printf '%s\n' "${pull_request_list[@]}" | sort))

# Extract the PR numbers from the sorted list
sorted_pr_numbers=()
for pr_info in "${sorted_pull_request_list[@]}"; do
  pr_number=$(echo "$pr_info" | cut -d ' ' -f 2)
  sorted_pr_numbers+=("$pr_number")
done

# Now you have a sorted list of eligible pull request numbers in 'sorted_pr_numbers'.
# You can further process them as per your requirements.
# For example, you can print the list of sorted PR numbers:

echo "Sorted eligible pull request numbers (oldest to newest): ${sorted_pr_numbers[*]}"

# Or, you can loop through the list and perform actions on each pull request, like updating them:
for pr_number in "${sorted_pr_numbers[@]}"; do
  # Add your logic to update the PR here, e.g., using the GitHub API to add a comment or modify labels.
  echo "Updating pull request #$pr_number..."
done
