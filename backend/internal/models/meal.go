package models

type Meal struct {
	ID          int    `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	ImageURL    string `json:"image_url"`
	Calories    int    `json:"calories"`
	Protein     int    `json:"protein"`
	Carbs       int    `json:"carbs"`
	Fat         int    `json:"fat"`
	Price       int    `json:"price"` // stored in cents
}

type CreateMealRequest struct {
	Name        string `json:"name" binding:"required"`
	Description string `json:"description"`
	ImageURL    string `json:"image_url"`
	Calories    int    `json:"calories"`
	Protein     int    `json:"protein"`
	Carbs       int    `json:"carbs"`
	Fat         int    `json:"fat"`
	Price       int    `json:"price" binding:"required"`
}

type UpdateMealRequest struct {
	Name        *string `json:"name"`
	Description *string `json:"description"`
	ImageURL    *string `json:"image_url"`
	Calories    *int    `json:"calories"`
	Protein     *int    `json:"protein"`
	Carbs       *int    `json:"carbs"`
	Fat         *int    `json:"fat"`
	Price       *int    `json:"price"`
}
