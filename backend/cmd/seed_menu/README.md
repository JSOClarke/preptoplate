# Weekly Menu Seeder

This script creates a weekly menu and adds all 15 meals to it with stock.

## Prerequisites

Make sure you've already run the meal seeder:
```bash
go run cmd/seed_meals/main.go
```

## Usage

```bash
cd backend
go run cmd/seed_menu/main.go
```

## What it does

1. Creates a weekly menu for the next Monday (or current Monday if today is Monday)
2. Adds all 15 meals to the menu with varying stock levels:
   - Grilled Chicken & Quinoa Bowl: 100 stock
   - Spicy Shrimp Stir-Fry: 80 stock
   - Mediterranean Salmon: 60 stock
   - And 12 more meals with varying stock (60-100)

3. Prints instructions to activate the menu

## Activate the Menu

After running the seeder, activate the menu using one of these methods:

### Option 1: SQL Command
```bash
psql "$DB_URL" -c "UPDATE weekly_menus SET is_active = false; UPDATE weekly_menus SET is_active = true WHERE id = <menu_id>;"
```

### Option 2: API Call
```bash
curl -X PUT "http://localhost:8080/api/admin/weekly-menus/<menu_id>/activate" \
  -H "Authorization: Bearer <admin-token>"
```

## Verify

Check the active menu:
```bash
curl http://localhost:8080/api/menu
```

You should see all 15 meals with their stock levels.
