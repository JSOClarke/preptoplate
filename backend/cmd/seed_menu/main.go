package main

import (
	"context"
	"log"
	"time"

	"github.com/jopari/preptoplate/internal/config"
	"github.com/jopari/preptoplate/internal/database"
)

func main() {
	log.Println("Starting weekly menu seed...")

	// Load config
	cfg := config.LoadConfig()

	// Connect to database
	db, err := database.ConnectDB(cfg.DBUrl)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	// Get next Monday (or current Monday if today is Monday)
	now := time.Now()
	daysUntilMonday := (8 - int(now.Weekday())) % 7
	if daysUntilMonday == 0 && now.Weekday() != time.Monday {
		daysUntilMonday = 7
	}
	weekStart := now.AddDate(0, 0, daysUntilMonday)
	weekStart = time.Date(weekStart.Year(), weekStart.Month(), weekStart.Day(), 0, 0, 0, 0, weekStart.Location())

	log.Printf("Creating menu for week starting: %s", weekStart.Format("2006-01-02"))

	// Create weekly menu
	createMenuQuery := `INSERT INTO weekly_menus (week_start_date, is_active) VALUES ($1, $2) RETURNING id`
	var menuID int
	err = db.QueryRow(context.Background(), createMenuQuery, weekStart, false).Scan(&menuID)
	if err != nil {
		log.Fatalf("Failed to create weekly menu: %v", err)
	}

	log.Printf("✅ Created weekly menu with ID: %d", menuID)

	// Add meals to menu with stock
	// This adds all 15 meals from the meal seeder
	meals := []struct {
		MealID       int
		InitialStock int
	}{
		{MealID: 1, InitialStock: 100}, // Grilled Chicken & Quinoa Bowl
		{MealID: 2, InitialStock: 80},  // Spicy Shrimp Stir-Fry
		{MealID: 3, InitialStock: 60},  // Mediterranean Salmon
		{MealID: 4, InitialStock: 90},  // Turkey Meatballs with Marinara
		{MealID: 5, InitialStock: 75},  // Teriyaki Beef & Broccoli
		{MealID: 6, InitialStock: 100}, // Vegan Buddha Bowl
		{MealID: 7, InitialStock: 85},  // Cajun Chicken Pasta
		{MealID: 8, InitialStock: 70},  // Thai Peanut Tofu
		{MealID: 9, InitialStock: 95},  // Lemon Herb Chicken Breast
		{MealID: 10, InitialStock: 65}, // Korean BBQ Beef Bowl
		{MealID: 11, InitialStock: 80}, // Southwest Chicken Salad
		{MealID: 12, InitialStock: 70}, // Honey Glazed Pork Tenderloin
		{MealID: 13, InitialStock: 90}, // Mediterranean Chickpea Bowl
		{MealID: 14, InitialStock: 60}, // Garlic Butter Shrimp & Zucchini Noodles
		{MealID: 15, InitialStock: 75}, // Classic Beef Lasagna
	}

	addMealQuery := `
		INSERT INTO menu_meals (menu_id, meal_id, initial_stock, available_stock) 
		VALUES ($1, $2, $3, $3)
	`

	for _, meal := range meals {
		_, err := db.Exec(context.Background(), addMealQuery, menuID, meal.MealID, meal.InitialStock)
		if err != nil {
			log.Printf("⚠️  Failed to add meal %d: %v", meal.MealID, err)
			continue
		}
		log.Printf("   Added meal ID %d with %d stock", meal.MealID, meal.InitialStock)
	}

	// Ask if user wants to activate this menu
	log.Println("\n✅ Weekly menu created successfully!")
	log.Printf("   Menu ID: %d", menuID)
	log.Printf("   Week Start: %s", weekStart.Format("2006-01-02"))
	log.Printf("   Meals: %d", len(meals))
	log.Println("\nTo activate this menu (deactivates all others), run:")
	log.Printf("   psql \"$DB_URL\" -c \"UPDATE weekly_menus SET is_active = false; UPDATE weekly_menus SET is_active = true WHERE id = %d;\"", menuID)
	log.Println("\nOr use the API:")
	log.Printf("   PUT /api/admin/weekly-menus/%d/activate", menuID)
}
