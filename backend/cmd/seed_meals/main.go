package main

import (
	"context"
	"log"

	"github.com/jopari/preptoplate/internal/config"
	"github.com/jopari/preptoplate/internal/database"
)

type MealSeed struct {
	Name        string
	Description string
	ImageURL    string
	Calories    int
	Protein     int
	Carbs       int
	Fat         int
	Price       int // in cents
}

func main() {
	log.Println("Starting meal database seed...")

	// Load config
	cfg := config.LoadConfig()

	// Connect to database
	db, err := database.ConnectDB(cfg.DBUrl)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	meals := []MealSeed{
		{
			Name:        "Grilled Chicken & Quinoa Bowl",
			Description: "Tender grilled chicken breast with fluffy quinoa, roasted vegetables, and a light lemon tahini dressing",
			ImageURL:    "https://placehold.co/600x400/007bff/white?text=Chicken+Bowl",
			Calories:    450,
			Protein:     35,
			Carbs:       45,
			Fat:         12,
			Price:       1299, // $12.99
		},
		{
			Name:        "Spicy Shrimp Stir-Fry",
			Description: "Jumbo shrimp tossed with colorful bell peppers, snap peas, and brown rice in a spicy garlic sauce",
			ImageURL:    "https://placehold.co/600x400/dc3545/white?text=Shrimp+Stir-Fry",
			Calories:    380,
			Protein:     28,
			Carbs:       42,
			Fat:         10,
			Price:       1399,
		},
		{
			Name:        "Mediterranean Salmon",
			Description: "Oven-baked salmon fillet with cherry tomatoes, olives, feta cheese, and herb-roasted sweet potato",
			ImageURL:    "https://placehold.co/600x400/28a745/white?text=Salmon+Bowl",
			Calories:    520,
			Protein:     40,
			Carbs:       35,
			Fat:         22,
			Price:       1599,
		},
		{
			Name:        "Turkey Meatballs with Marinara",
			Description: "Lean turkey meatballs in house-made marinara sauce over whole wheat pasta with a side of green beans",
			ImageURL:    "https://placehold.co/600x400/ffc107/white?text=Turkey+Meatballs",
			Calories:    410,
			Protein:     32,
			Carbs:       48,
			Fat:         11,
			Price:       1199,
		},
		{
			Name:        "Teriyaki Beef & Broccoli",
			Description: "Grass-fed beef strips with steamed broccoli and jasmine rice, glazed with our signature teriyaki sauce",
			ImageURL:    "https://placehold.co/600x400/6f42c1/white?text=Beef+Teriyaki",
			Calories:    480,
			Protein:     38,
			Carbs:       40,
			Fat:         16,
			Price:       1499,
		},
		{
			Name:        "Vegan Buddha Bowl",
			Description: "Chickpeas, roasted sweet potato, kale, avocado, and quinoa with creamy tahini dressing",
			ImageURL:    "https://placehold.co/600x400/20c997/white?text=Buddha+Bowl",
			Calories:    420,
			Protein:     15,
			Carbs:       58,
			Fat:         14,
			Price:       1099,
		},
		{
			Name:        "Cajun Chicken Pasta",
			Description: "Blackened chicken with penne pasta, bell peppers, and a creamy cajun sauce with a hint of spice",
			ImageURL:    "https://placehold.co/600x400/e83e8c/white?text=Cajun+Pasta",
			Calories:    540,
			Protein:     36,
			Carbs:       52,
			Fat:         18,
			Price:       1299,
		},
		{
			Name:        "Thai Peanut Tofu",
			Description: "Crispy tofu with snap peas, carrots, and rice noodles in a rich peanut curry sauce",
			ImageURL:    "https://placehold.co/600x400/fd7e14/white?text=Peanut+Tofu",
			Calories:    460,
			Protein:     20,
			Carbs:       50,
			Fat:         19,
			Price:       1199,
		},
		{
			Name:        "Lemon Herb Chicken Breast",
			Description: "Grilled chicken breast marinated in lemon and herbs, served with roasted asparagus and wild rice",
			ImageURL:    "https://placehold.co/600x400/17a2b8/white?text=Lemon+Chicken",
			Calories:    390,
			Protein:     42,
			Carbs:       35,
			Fat:         9,
			Price:       1199,
		},
		{
			Name:        "Korean BBQ Beef Bowl",
			Description: "Marinated beef bulgogi with kimchi, cucumber, edamame, and steamed rice topped with sesame seeds",
			ImageURL:    "https://placehold.co/600x400/6610f2/white?text=Korean+BBQ",
			Calories:    495,
			Protein:     34,
			Carbs:       46,
			Fat:         17,
			Price:       1399,
		},
		{
			Name:        "Southwest Chicken Salad",
			Description: "Grilled chicken over mixed greens with black beans, corn, avocado, and chipotle ranch dressing",
			ImageURL:    "https://placehold.co/600x400/28a745/white?text=Southwest+Salad",
			Calories:    380,
			Protein:     35,
			Carbs:       28,
			Fat:         15,
			Price:       1099,
		},
		{
			Name:        "Honey Glazed Pork Tenderloin",
			Description: "Tender pork with honey glaze, roasted Brussels sprouts, and garlic mashed cauliflower",
			ImageURL:    "https://placehold.co/600x400/dc3545/white?text=Honey+Pork",
			Calories:    440,
			Protein:     36,
			Carbs:       38,
			Fat:         14,
			Price:       1399,
		},
		{
			Name:        "Mediterranean Chickpea Bowl",
			Description: "Spiced chickpeas with cucumber, tomatoes, red onion, feta, and tzatziki over couscous",
			ImageURL:    "https://placehold.co/600x400/007bff/white?text=Chickpea+Bowl",
			Calories:    400,
			Protein:     16,
			Carbs:       55,
			Fat:         12,
			Price:       999,
		},
		{
			Name:        "Garlic Butter Shrimp & Zucchini Noodles",
			Description: "Succulent shrimp sautéed in garlic butter served over spiralized zucchini noodles with cherry tomatoes",
			ImageURL:    "https://placehold.co/600x400/20c997/white?text=Shrimp+Zoodles",
			Calories:    320,
			Protein:     30,
			Carbs:       18,
			Fat:         15,
			Price:       1299,
		},
		{
			Name:        "Classic Beef Lasagna",
			Description: "Layered pasta with seasoned ground beef, ricotta, mozzarella, and marinara sauce with a side salad",
			ImageURL:    "https://placehold.co/600x400/ffc107/white?text=Beef+Lasagna",
			Calories:    560,
			Protein:     32,
			Carbs:       54,
			Fat:         22,
			Price:       1299,
		},
	}

	insertQuery := `
		INSERT INTO meals (name, description, image_url, calories, protein, carbs, fat, price) 
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
	`

	successCount := 0
	for _, meal := range meals {
		_, err := db.Exec(context.Background(), insertQuery,
			meal.Name,
			meal.Description,
			meal.ImageURL,
			meal.Calories,
			meal.Protein,
			meal.Carbs,
			meal.Fat,
			meal.Price,
		)
		if err != nil {
			log.Printf("❌ Failed to insert meal '%s': %v", meal.Name, err)
			continue
		}
		successCount++
		log.Printf("✅ Created meal: %s ($%.2f)", meal.Name, float64(meal.Price)/100)
	}

	log.Printf("\n🎉 Seed completed! Created %d/%d meals", successCount, len(meals))
}
