package repository

import (
	"context"
	"errors"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/jopari/preptoplate/internal/models"
)

type WeeklyMenuRepository interface {
	Create(ctx context.Context, menu *models.WeeklyMenu) error
	GetByID(ctx context.Context, id int) (*models.WeeklyMenu, error)
	GetActive(ctx context.Context) (*models.WeeklyMenu, error)
	Activate(ctx context.Context, id int) error
	AddMeal(ctx context.Context, menuID, mealID, stock int) error
	GetMealStock(ctx context.Context, menuID, mealID int) (int, error)
	DecrementStock(ctx context.Context, menuID, mealID, quantity int) error
}

type weeklyMenuRepository struct {
	db *pgxpool.Pool
}

func NewWeeklyMenuRepository(db *pgxpool.Pool) WeeklyMenuRepository {
	return &weeklyMenuRepository{db: db}
}

func (r *weeklyMenuRepository) Create(ctx context.Context, menu *models.WeeklyMenu) error {
	query := `INSERT INTO weekly_menus (week_start_date, is_active) VALUES ($1, $2) RETURNING id`
	err := r.db.QueryRow(ctx, query, menu.WeekStartDate, menu.IsActive).Scan(&menu.ID)
	return err
}

func (r *weeklyMenuRepository) GetByID(ctx context.Context, id int) (*models.WeeklyMenu, error) {
	// Get menu
	menuQuery := `SELECT id, week_start_date, is_active FROM weekly_menus WHERE id = $1`
	var menu models.WeeklyMenu
	err := r.db.QueryRow(ctx, menuQuery, id).Scan(&menu.ID, &menu.WeekStartDate, &menu.IsActive)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}

	// Get meals for this menu
	mealsQuery := `
		SELECT mm.menu_id, mm.meal_id, mm.initial_stock, mm.available_stock,
		       m.id, m.name, m.description, m.image_url, m.calories, m.protein, m.carbs, m.fat, m.price
		FROM menu_meals mm
		JOIN meals m ON mm.meal_id = m.id
		WHERE mm.menu_id = $1
		ORDER BY m.id
	`
	rows, err := r.db.Query(ctx, mealsQuery, id)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	menu.Meals = []models.WeeklyMenuMeal{}
	for rows.Next() {
		var menuMeal models.WeeklyMenuMeal
		err := rows.Scan(
			&menuMeal.MenuID, &menuMeal.Meal.ID, &menuMeal.InitialStock, &menuMeal.AvailableStock,
			&menuMeal.Meal.ID, &menuMeal.Meal.Name, &menuMeal.Meal.Description, &menuMeal.Meal.ImageURL,
			&menuMeal.Meal.Calories, &menuMeal.Meal.Protein, &menuMeal.Meal.Carbs, &menuMeal.Meal.Fat, &menuMeal.Meal.Price,
		)
		if err != nil {
			return nil, err
		}
		menu.Meals = append(menu.Meals, menuMeal)
	}

	return &menu, nil
}

func (r *weeklyMenuRepository) GetActive(ctx context.Context) (*models.WeeklyMenu, error) {
	// Get active menu
	menuQuery := `SELECT id FROM weekly_menus WHERE is_active = true LIMIT 1`
	var menuID int
	err := r.db.QueryRow(ctx, menuQuery).Scan(&menuID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}

	return r.GetByID(ctx, menuID)
}

func (r *weeklyMenuRepository) Activate(ctx context.Context, id int) error {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	// Deactivate all menus
	_, err = tx.Exec(ctx, `UPDATE weekly_menus SET is_active = false`)
	if err != nil {
		return err
	}

	// Activate the specified menu
	result, err := tx.Exec(ctx, `UPDATE weekly_menus SET is_active = true WHERE id = $1`, id)
	if err != nil {
		return err
	}

	if result.RowsAffected() == 0 {
		return errors.New("weekly menu not found")
	}

	return tx.Commit(ctx)
}

func (r *weeklyMenuRepository) AddMeal(ctx context.Context, menuID, mealID, stock int) error {
	query := `
		INSERT INTO menu_meals (menu_id, meal_id, initial_stock, available_stock) 
		VALUES ($1, $2, $3, $3)
	`
	_, err := r.db.Exec(ctx, query, menuID, mealID, stock)
	return err
}

func (r *weeklyMenuRepository) GetMealStock(ctx context.Context, menuID, mealID int) (int, error) {
	query := `SELECT available_stock FROM menu_meals WHERE menu_id = $1 AND meal_id = $2`
	var stock int
	err := r.db.QueryRow(ctx, query, menuID, mealID).Scan(&stock)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return 0, errors.New("meal not found in menu")
		}
		return 0, err
	}
	return stock, nil
}

func (r *weeklyMenuRepository) DecrementStock(ctx context.Context, menuID, mealID, quantity int) error {
	query := `
		UPDATE menu_meals 
		SET available_stock = available_stock - $1 
		WHERE menu_id = $2 AND meal_id = $3 AND available_stock >= $1
	`
	result, err := r.db.Exec(ctx, query, quantity, menuID, mealID)
	if err != nil {
		return err
	}

	if result.RowsAffected() == 0 {
		return errors.New("insufficient stock or meal not found")
	}

	return nil
}
