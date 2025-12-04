package api

import (
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/jopari/preptoplate/internal/api/handlers"
	"github.com/jopari/preptoplate/internal/config"
	"github.com/jopari/preptoplate/internal/middleware"
	"github.com/jopari/preptoplate/internal/repository"
	"github.com/jopari/preptoplate/internal/service"
)

func SetupRouter(db *pgxpool.Pool, cfg *config.Config) *gin.Engine {
	r := gin.Default()

	// Repositories
	userRepo := repository.NewUserRepository(db)
	mealRepo := repository.NewMealRepository(db)

	// Services
	authService := service.NewAuthService(userRepo, cfg)
	mealService := service.NewMealService(mealRepo)

	// Handlers
	authHandler := handlers.NewAuthHandler(authService)
	mealHandler := handlers.NewMealHandler(mealService)

	// Routes
	api := r.Group("/api")
	{
		auth := api.Group("/auth")
		{
			auth.POST("/register", authHandler.Register)
			auth.POST("/login", authHandler.Login)
		}

		meals := api.Group("/meals")
		{
			// Public routes
			meals.GET("", mealHandler.List)
			meals.GET("/:id", mealHandler.GetByID)

			// Admin-only routes
			admin := meals.Group("")
			admin.Use(middleware.AuthMiddleware(cfg), middleware.RequireAdmin())
			{
				admin.POST("", mealHandler.Create)
				admin.PUT("/:id", mealHandler.Update)
				admin.DELETE("/:id", mealHandler.Delete)
			}
		}
	}

	return r
}
