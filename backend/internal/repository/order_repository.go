package repository

import (
	"context"
	"errors"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/jopari/preptoplate/internal/models"
)

type OrderRepository interface {
	Create(ctx context.Context, order *models.Order) error
	AddItem(ctx context.Context, orderID int, item *models.OrderItem) error
	GetByID(ctx context.Context, id int) (*models.Order, error)
	GetByUserID(ctx context.Context, userID int) ([]models.Order, error)
	UpdateStatus(ctx context.Context, id int, status string) error
}

type orderRepository struct {
	db *pgxpool.Pool
}

func NewOrderRepository(db *pgxpool.Pool) OrderRepository {
	return &orderRepository{db: db}
}

func (r *orderRepository) Create(ctx context.Context, order *models.Order) error {
	query := `
		INSERT INTO orders (user_id, week_id, status, total_price, delivery_date) 
		VALUES ($1, $2, $3, $4, $5) 
		RETURNING id, created_at
	`
	err := r.db.QueryRow(ctx, query,
		order.UserID,
		order.WeekID,
		order.Status,
		order.TotalPrice,
		order.DeliveryDate,
	).Scan(&order.ID, &order.CreatedAt)
	return err
}

func (r *orderRepository) AddItem(ctx context.Context, orderID int, item *models.OrderItem) error {
	query := `
		INSERT INTO order_items (order_id, meal_id, quantity) 
		VALUES ($1, $2, $3)
	`
	_, err := r.db.Exec(ctx, query, orderID, item.MealID, item.Quantity)
	return err
}

func (r *orderRepository) GetByID(ctx context.Context, id int) (*models.Order, error) {
	// Get order
	orderQuery := `
		SELECT id, user_id, week_id, status, total_price, delivery_date, created_at 
		FROM orders 
		WHERE id = $1
	`
	var order models.Order
	err := r.db.QueryRow(ctx, orderQuery, id).Scan(
		&order.ID,
		&order.UserID,
		&order.WeekID,
		&order.Status,
		&order.TotalPrice,
		&order.DeliveryDate,
		&order.CreatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}

	// Get order items with meal details
	itemsQuery := `
		SELECT oi.order_id, oi.meal_id, oi.quantity,
		       m.id, m.name, m.description, m.image_url, m.calories, m.protein, m.carbs, m.fat, m.price
		FROM order_items oi
		JOIN meals m ON oi.meal_id = m.id
		WHERE oi.order_id = $1
	`
	rows, err := r.db.Query(ctx, itemsQuery, id)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	order.Items = []models.OrderItem{}
	for rows.Next() {
		var item models.OrderItem
		err := rows.Scan(
			&item.OrderID, &item.MealID, &item.Quantity,
			&item.Meal.ID, &item.Meal.Name, &item.Meal.Description, &item.Meal.ImageURL,
			&item.Meal.Calories, &item.Meal.Protein, &item.Meal.Carbs, &item.Meal.Fat, &item.Meal.Price,
		)
		if err != nil {
			return nil, err
		}
		item.Price = item.Meal.Price // Price at time of order
		order.Items = append(order.Items, item)
	}

	return &order, nil
}

func (r *orderRepository) GetByUserID(ctx context.Context, userID int) ([]models.Order, error) {
	query := `
		SELECT id, user_id, week_id, status, total_price, delivery_date, created_at 
		FROM orders 
		WHERE user_id = $1 
		ORDER BY created_at DESC
	`
	rows, err := r.db.Query(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	orders := []models.Order{}
	for rows.Next() {
		var order models.Order
		err := rows.Scan(
			&order.ID,
			&order.UserID,
			&order.WeekID,
			&order.Status,
			&order.TotalPrice,
			&order.DeliveryDate,
			&order.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		orders = append(orders, order)
	}

	return orders, nil
}

func (r *orderRepository) UpdateStatus(ctx context.Context, id int, status string) error {
	query := `UPDATE orders SET status = $1 WHERE id = $2`
	result, err := r.db.Exec(ctx, query, status, id)
	if err != nil {
		return err
	}
	if result.RowsAffected() == 0 {
		return errors.New("order not found")
	}
	return nil
}
