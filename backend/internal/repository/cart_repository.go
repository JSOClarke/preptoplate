package repository

import (
	"context"
	"errors"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/jopari/preptoplate/internal/models"
)

type CartRepository interface {
	GetOrCreateByUserID(ctx context.Context, userID int) (*models.Cart, error)
	GetByUserID(ctx context.Context, userID int) (*models.Cart, error)
	AddItem(ctx context.Context, cartID, mealID, quantity int) error
	UpdateItemQuantity(ctx context.Context, itemID, quantity int) error
	RemoveItem(ctx context.Context, itemID int) error
	Clear(ctx context.Context, cartID int) error
	GetItemCount(ctx context.Context, cartID int) (int, error)
	GetItemByCartAndMeal(ctx context.Context, cartID, mealID int) (*models.CartItem, error)
}

type cartRepository struct {
	db *pgxpool.Pool
}

func NewCartRepository(db *pgxpool.Pool) CartRepository {
	return &cartRepository{db: db}
}

func (r *cartRepository) GetOrCreateByUserID(ctx context.Context, userID int) (*models.Cart, error) {
	// Try to get existing cart
	cart, err := r.GetByUserID(ctx, userID)
	if err != nil {
		return nil, err
	}
	if cart != nil {
		return cart, nil
	}

	// Create new cart
	query := `INSERT INTO carts (user_id) VALUES ($1) RETURNING id, created_at, updated_at`
	cart = &models.Cart{UserID: userID, Items: []models.CartItem{}}
	err = r.db.QueryRow(ctx, query, userID).Scan(&cart.ID, &cart.CreatedAt, &cart.UpdatedAt)
	if err != nil {
		return nil, err
	}

	return cart, nil
}

func (r *cartRepository) GetByUserID(ctx context.Context, userID int) (*models.Cart, error) {
	// Get cart
	cartQuery := `SELECT id, user_id, created_at, updated_at FROM carts WHERE user_id = $1`
	var cart models.Cart
	err := r.db.QueryRow(ctx, cartQuery, userID).Scan(&cart.ID, &cart.UserID, &cart.CreatedAt, &cart.UpdatedAt)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}

	// Get cart items with meal details
	itemsQuery := `
		SELECT ci.id, ci.cart_id, ci.meal_id, ci.quantity, ci.created_at,
		       m.id, m.name, m.description, m.image_url, m.calories, m.protein, m.carbs, m.fat, m.price
		FROM cart_items ci
		JOIN meals m ON ci.meal_id = m.id
		WHERE ci.cart_id = $1
		ORDER BY ci.created_at
	`
	rows, err := r.db.Query(ctx, itemsQuery, cart.ID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	cart.Items = []models.CartItem{}
	cart.TotalItems = 0
	cart.TotalPrice = 0

	for rows.Next() {
		var item models.CartItem
		err := rows.Scan(
			&item.ID, &item.CartID, &item.MealID, &item.Quantity, &item.CreatedAt,
			&item.Meal.ID, &item.Meal.Name, &item.Meal.Description, &item.Meal.ImageURL,
			&item.Meal.Calories, &item.Meal.Protein, &item.Meal.Carbs, &item.Meal.Fat, &item.Meal.Price,
		)
		if err != nil {
			return nil, err
		}
		cart.Items = append(cart.Items, item)
		cart.TotalItems += item.Quantity
		cart.TotalPrice += item.Meal.Price * item.Quantity
	}

	return &cart, nil
}

func (r *cartRepository) AddItem(ctx context.Context, cartID, mealID, quantity int) error {
	query := `INSERT INTO cart_items (cart_id, meal_id, quantity) VALUES ($1, $2, $3)`
	_, err := r.db.Exec(ctx, query, cartID, mealID, quantity)
	if err != nil {
		return err
	}

	// Update cart updated_at
	_, _ = r.db.Exec(ctx, `UPDATE carts SET updated_at = $1 WHERE id = $2`, time.Now(), cartID)
	return nil
}

func (r *cartRepository) UpdateItemQuantity(ctx context.Context, itemID, quantity int) error {
	query := `UPDATE cart_items SET quantity = $1 WHERE id = $2`
	result, err := r.db.Exec(ctx, query, quantity, itemID)
	if err != nil {
		return err
	}
	if result.RowsAffected() == 0 {
		return errors.New("cart item not found")
	}
	return nil
}

func (r *cartRepository) RemoveItem(ctx context.Context, itemID int) error {
	query := `DELETE FROM cart_items WHERE id = $1`
	result, err := r.db.Exec(ctx, query, itemID)
	if err != nil {
		return err
	}
	if result.RowsAffected() == 0 {
		return errors.New("cart item not found")
	}
	return nil
}

func (r *cartRepository) Clear(ctx context.Context, cartID int) error {
	query := `DELETE FROM cart_items WHERE cart_id = $1`
	_, err := r.db.Exec(ctx, query, cartID)
	return err
}

func (r *cartRepository) GetItemCount(ctx context.Context, cartID int) (int, error) {
	query := `SELECT COALESCE(SUM(quantity), 0) FROM cart_items WHERE cart_id = $1`
	var count int
	err := r.db.QueryRow(ctx, query, cartID).Scan(&count)
	return count, err
}

func (r *cartRepository) GetItemByCartAndMeal(ctx context.Context, cartID, mealID int) (*models.CartItem, error) {
	query := `SELECT id, cart_id, meal_id, quantity, created_at FROM cart_items WHERE cart_id = $1 AND meal_id = $2`
	var item models.CartItem
	err := r.db.QueryRow(ctx, query, cartID, mealID).Scan(&item.ID, &item.CartID, &item.MealID, &item.Quantity, &item.CreatedAt)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return &item, nil
}
