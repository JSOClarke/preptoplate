package integration

import (
	"log"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"
	"github.com/jopari/preptoplate/internal/api"
	"github.com/jopari/preptoplate/internal/config"
	"github.com/jopari/preptoplate/internal/database"
)

// setupTestEnv initializes the application for testing.
// It connects to the database and sets up the router.
// It returns the Gin engine and the database pool.
// The caller is responsible for closing the database pool.
func setupTestEnv() (*gin.Engine, *pgxpool.Pool) {
	// Set Gin to Test Mode to reduce noise
	gin.SetMode(gin.TestMode)

	// Load .env from backend root (relative to tests/integration)
	// We ignore error here because in CI/CD env vars might be set directly
	_ = godotenv.Load("../../.env")

	cfg := config.LoadConfig()

	// Connect to DB
	dbPool, err := database.ConnectDB(cfg.DBUrl)
	if err != nil {
		log.Fatalf("Could not connect to database: %v", err)
	}

	// Setup Router
	r := api.SetupRouter(dbPool, cfg)

	return r, dbPool
}
