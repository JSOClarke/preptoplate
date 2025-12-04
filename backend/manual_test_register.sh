#!/bin/bash

# Base URL
URL="http://localhost:8080/api/auth/register"

# Generate a unique email to avoid conflicts
EMAIL="manual_test_$(date +%s)@example.com"

echo "Testing Register Endpoint..."
echo "URL: $URL"
echo "Email: $EMAIL"

# Run curl
# -s: Silent mode (don't show progress bar)
# -v: Verbose (optional, good for debugging, but maybe too noisy for just "seeing output")
# We'll just show the response body.

response=$(curl -s -X POST "$URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"password123\"
  }")

# Check if jq is installed for pretty printing
if command -v jq &> /dev/null; then
    echo "$response" | jq .
else
    echo "$response"
fi

echo ""
