package main

import (
	"context"
	"log"

	"github.com/jopari/preptoplate/internal/config"
	"github.com/jopari/preptoplate/internal/database"
	"golang.org/x/crypto/bcrypt"
)

func main() {
	log.Println("Starting database seed...")

	// Load config
	cfg := config.LoadConfig()

	// Connect to database
	db, err := database.ConnectDB(cfg.DBUrl)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	// Default admin credentials
	adminEmail := "admin@preptoplate.com"
	adminPassword := "admin123" // Change this in production!

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(adminPassword), bcrypt.DefaultCost)
	if err != nil {
		log.Fatalf("Failed to hash password: %v", err)
	}

	// Check if admin already exists
	var exists bool
	checkQuery := `SELECT EXISTS(SELECT 1 FROM users WHERE email = $1)`
	err = db.QueryRow(context.Background(), checkQuery, adminEmail).Scan(&exists)
	if err != nil {
		log.Fatalf("Failed to check if admin exists: %v", err)
	}

	if exists {
		log.Printf("Admin user '%s' already exists. Skipping...", adminEmail)
		return
	}

	// Insert admin user
	insertQuery := `
		INSERT INTO users (email, password_hash, role, created_at) 
		VALUES ($1, $2, $3, NOW())
		RETURNING id
	`
	var adminID int
	err = db.QueryRow(context.Background(), insertQuery, adminEmail, string(hashedPassword), "admin").Scan(&adminID)
	if err != nil {
		log.Fatalf("Failed to create admin user: %v", err)
	}

	log.Printf("✅ Admin user created successfully!")
	log.Printf("   Email: %s", adminEmail)
	log.Printf("   Password: %s", adminPassword)
	log.Printf("   ID: %d", adminID)
	log.Println("\n⚠️  IMPORTANT: Change the admin password after first login!")
}
