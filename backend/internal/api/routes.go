package api

import (
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"

	"github.com/jopari/preptoplate/internal/api/handlers"
	"github.com/jopari/preptoplate/internal/config"
	"github.com/jopari/preptoplate/internal/middleware"
	"github.com/jopari/preptoplate/internal/repository"
	"github.com/jopari/preptoplate/internal/service"

	_ "github.com/jopari/preptoplate/docs" // Swagger docs
)

func SetupRouter(db *pgxpool.Pool, cfg *config.Config) *gin.Engine {
	r := gin.Default()

	// CORS middleware
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// Repositories
	userRepo := repository.NewUserRepository(db)
	mealRepo := repository.NewMealRepository(db)
	cartRepo := repository.NewCartRepository(db)
	menuRepo := repository.NewWeeklyMenuRepository(db)
	orderRepo := repository.NewOrderRepository(db)

	// Services
	authService := service.NewAuthService(userRepo, cfg)
	mealService := service.NewMealService(mealRepo)
	cartService := service.NewCartService(cartRepo, mealRepo)
	menuService := service.NewWeeklyMenuService(menuRepo, mealRepo)
	orderService := service.NewOrderService(orderRepo, cartRepo, menuRepo)

	// Handlers
	authHandler := handlers.NewAuthHandler(authService)
	mealHandler := handlers.NewMealHandler(mealService)
	cartHandler := handlers.NewCartHandler(cartService)
	menuHandler := handlers.NewWeeklyMenuHandler(menuService)
	orderHandler := handlers.NewOrderHandler(orderService)

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

		// Cart routes (authenticated users only)
		cart := api.Group("/cart")
		cart.Use(middleware.AuthMiddleware(cfg))
		{
			cart.GET("", cartHandler.GetCart)
			cart.POST("/items", cartHandler.AddItem)
			cart.PUT("/items/:id", cartHandler.UpdateItem)
			cart.DELETE("/items/:id", cartHandler.RemoveItem)
			cart.DELETE("", cartHandler.ClearCart)
		}

		// Public menu route
		api.GET("/menu", menuHandler.GetActiveMenu)

		// Admin - Weekly Menu Management
		admin := api.Group("/admin")
		admin.Use(middleware.AuthMiddleware(cfg), middleware.RequireAdmin())
		{
			weeklyMenus := admin.Group("/weekly-menus")
			{
				weeklyMenus.POST("", menuHandler.Create)
				weeklyMenus.GET("/:id", menuHandler.GetByID)
				weeklyMenus.PUT("/:id/activate", menuHandler.Activate)
			}
		}

		// User orders (authenticated)
		orders := api.Group("/orders")
		orders.Use(middleware.AuthMiddleware(cfg))
		{
			orders.POST("/checkout", orderHandler.Checkout)
			orders.GET("", orderHandler.GetOrders)
			orders.GET("/:id", orderHandler.GetByID)
		}
	}

	// Swagger documentation
	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	return r
}
