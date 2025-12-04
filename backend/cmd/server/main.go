package main

import (
	"log"

	"github.com/jopari/preptoplate/internal/api"
	"github.com/jopari/preptoplate/internal/config"
	"github.com/jopari/preptoplate/internal/database"
)

func main() {
	cfg := config.LoadConfig()

	dbPool, err := database.ConnectDB(cfg.DBUrl)
	if err != nil {
		log.Fatalf("Could not connect to database: %v", err)
	}
	defer dbPool.Close()

	r := api.SetupRouter(dbPool, cfg)

	log.Printf("Server starting on port %s", cfg.Port)
	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}
