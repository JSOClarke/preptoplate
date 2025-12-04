# Meal Database Seeder

This script populates the database with 15 sample meals for testing and development.

## Usage

```bash
cd backend
go run cmd/seed_meals/main.go
```

## What it creates

15 diverse meals including:
- Grilled Chicken & Quinoa Bowl
- Spicy Shrimp Stir-Fry
- Mediterranean Salmon
- Turkey Meatballs with Marinara
- Teriyaki Beef & Broccoli
- Vegan Buddha Bowl
- Cajun Chicken Pasta
- Thai Peanut Tofu
- And 7 more...

Each meal includes:
- ✅ Name and description
- ✅ Placeholder image URL (using placehold.co)
- ✅ Nutrition info (calories, protein, carbs, fat)
- ✅ Price (ranging from $9.99 to $15.99)

## Note

Images are placeholder URLs. You can replace these with S3 URLs later when you implement image upload.
