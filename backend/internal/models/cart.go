package models

import "time"

type Cart struct {
	ID         int        `json:"id"`
	UserID     int        `json:"user_id"`
	Items      []CartItem `json:"items"`
	TotalItems int        `json:"total_items"`
	TotalPrice int        `json:"total_price"` // in cents
	CreatedAt  time.Time  `json:"created_at"`
	UpdatedAt  time.Time  `json:"updated_at"`
}

type CartItem struct {
	ID        int       `json:"id"`
	CartID    int       `json:"-"`
	Meal      Meal      `json:"meal"`
	MealID    int       `json:"-"`
	Quantity  int       `json:"quantity"`
	CreatedAt time.Time `json:"created_at"`
}

type AddToCartRequest struct {
	MealID   int `json:"meal_id" binding:"required"`
	Quantity int `json:"quantity" binding:"required,min=1"`
}

type UpdateCartItemRequest struct {
	Quantity int `json:"quantity" binding:"required,min=0"` // 0 = remove
}
