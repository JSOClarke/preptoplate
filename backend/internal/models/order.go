package models

import "time"

type Order struct {
	ID           int         `json:"id"`
	UserID       int         `json:"user_id"`
	WeekID       int         `json:"week_id"`
	Status       string      `json:"status"`
	TotalPrice   int         `json:"total_price"`
	DeliveryDate time.Time   `json:"delivery_date"`
	Items        []OrderItem `json:"items"`
	CreatedAt    time.Time   `json:"created_at"`
}

type OrderItem struct {
	OrderID  int  `json:"-"`
	MealID   int  `json:"-"`
	Meal     Meal `json:"meal"`
	Quantity int  `json:"quantity"`
	Price    int  `json:"price"` // Price at time of order (in cents)
}

type CheckoutRequest struct {
	DeliveryDate string `json:"delivery_date" binding:"required"`
}
