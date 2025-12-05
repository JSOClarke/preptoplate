package models

type UpdateWeeklyMenuRequest struct {
	WeekStartDate string          `json:"week_start_date" binding:"required"`
	Meals         []MenuMealInput `json:"meals" binding:"required,min=1"`
}
