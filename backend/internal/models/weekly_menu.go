package models

import "time"

type WeeklyMenu struct {
	ID            int              `json:"id"`
	WeekStartDate time.Time        `json:"week_start_date"`
	IsActive      bool             `json:"is_active"`
	Meals         []WeeklyMenuMeal `json:"meals,omitempty"`
}

type WeeklyMenuMeal struct {
	MenuID         int  `json:"-"`
	Meal           Meal `json:"meal"`
	InitialStock   int  `json:"initial_stock"`
	AvailableStock int  `json:"available_stock"`
}

type CreateWeeklyMenuRequest struct {
	WeekStartDate string          `json:"week_start_date" binding:"required"`
	Meals         []MenuMealInput `json:"meals" binding:"required,min=1"`
}

type MenuMealInput struct {
	MealID int `json:"meal_id" binding:"required"`
	Stock  int `json:"stock" binding:"required,min=1"`
}

type UpdateStockRequest struct {
	Stock int `json:"stock" binding:"required,min=0"`
}
