// @title           PrepToPlate API
// @version         1.0
// @description     Meal prep subscription service API with weekly menus and stock management
// @termsOfService  http://swagger.io/terms/

// @contact.name   API Support
// @contact.email  support@preptoplate.com

// @license.name  MIT
// @license.url   http://opensource.org/licenses/MIT

// @host      localhost:8080
// @BasePath  /api

// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
// @description Type "Bearer" followed by a space and JWT token

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
