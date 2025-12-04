#!/bin/bash

# Cart API Testing Script
# This script tests all cart endpoints

BASE_URL="http://localhost:8080/api"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Cart System Testing ===${NC}\n"

# Step 1: Login to get a token
echo -e "${BLUE}Step 1: Logging in...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@preptoplate.com",
    "password": "admin123"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.token')

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
  echo -e "${RED}❌ Login failed. Please ensure admin user exists.${NC}"
  echo "Response: $LOGIN_RESPONSE"
  exit 1
fi

echo -e "${GREEN}✅ Logged in successfully${NC}"
echo "Token: ${TOKEN:0:20}..."
echo ""

# Step 2: Get empty cart
echo -e "${BLUE}Step 2: Getting cart (should be empty)...${NC}"
curl -s -X GET "$BASE_URL/cart" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""

# Step 3: Add first meal to cart
echo -e "${BLUE}Step 3: Adding meal ID 1 (quantity 2) to cart...${NC}"
curl -s -X POST "$BASE_URL/cart/items" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "meal_id": 1,
    "quantity": 2
  }' | jq .
echo ""

# Step 4: Add second meal to cart
echo -e "${BLUE}Step 4: Adding meal ID 2 (quantity 3) to cart...${NC}"
curl -s -X POST "$BASE_URL/cart/items" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "meal_id": 2,
    "quantity": 3
  }' | jq .
echo ""

# Step 5: Add same meal again (should increment quantity)
echo -e "${BLUE}Step 5: Adding meal ID 1 again (quantity 1) - should increment...${NC}"
curl -s -X POST "$BASE_URL/cart/items" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "meal_id": 1,
    "quantity": 1
  }' | jq .
echo ""

# Step 6: Add more meals to approach the 10 limit
echo -e "${BLUE}Step 6: Adding meal ID 3 (quantity 4) - should reach 10 total...${NC}"
curl -s -X POST "$BASE_URL/cart/items" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "meal_id": 3,
    "quantity": 4
  }' | jq .
echo ""

# Step 7: Try to exceed the limit
echo -e "${BLUE}Step 7: Trying to add 1 more meal (should fail - max 10)...${NC}"
curl -s -X POST "$BASE_URL/cart/items" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "meal_id": 4,
    "quantity": 1
  }' | jq .
echo ""

# Step 8: Get full cart
echo -e "${BLUE}Step 8: Getting current cart state...${NC}"
CART=$(curl -s -X GET "$BASE_URL/cart" \
  -H "Authorization: Bearer $TOKEN")
echo $CART | jq .
echo ""

# Get first item ID for update/remove tests
FIRST_ITEM_ID=$(echo $CART | jq -r '.items[0].id')

# Step 9: Update item quantity
echo -e "${BLUE}Step 9: Updating first item (ID: $FIRST_ITEM_ID) to quantity 1...${NC}"
curl -s -X PUT "$BASE_URL/cart/items/$FIRST_ITEM_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 1
  }' | jq .
echo ""

# Step 10: Remove an item
echo -e "${BLUE}Step 10: Removing first item (ID: $FIRST_ITEM_ID)...${NC}"
curl -s -X DELETE "$BASE_URL/cart/items/$FIRST_ITEM_ID" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""

# Step 11: Get cart after removal
echo -e "${BLUE}Step 11: Getting cart after removal...${NC}"
curl -s -X GET "$BASE_URL/cart" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""

# Step 12: Clear cart
echo -e "${BLUE}Step 12: Clearing entire cart...${NC}"
curl -s -X DELETE "$BASE_URL/cart" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""

# Step 13: Verify cart is empty
echo -e "${BLUE}Step 13: Verifying cart is empty...${NC}"
curl -s -X GET "$BASE_URL/cart" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""

echo -e "${GREEN}✅ Cart testing complete!${NC}"
