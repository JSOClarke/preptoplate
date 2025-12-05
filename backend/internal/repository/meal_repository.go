package repository

import (
	"context"
	"errors"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/jopari/preptoplate/internal/models"
)

type MealRepository interface {
	Create(ctx context.Context, meal *models.Meal) error
	GetByID(ctx context.Context, id int) (*models.Meal, error)
	GetAll(ctx context.Context) ([]models.Meal, error)
	Update(ctx context.Context, id int, meal *models.Meal) error
	Delete(ctx context.Context, id int) error
	IsUsedInMenus(ctx context.Context, id int) (bool, error)
}

type mealRepository struct {
	db *pgxpool.Pool
}

func NewMealRepository(db *pgxpool.Pool) MealRepository {
	return &mealRepository{db: db}
}

func (r *mealRepository) Create(ctx context.Context, meal *models.Meal) error {
	query := `
		INSERT INTO meals (name, description, image_url, calories, protein, carbs, fat, price) 
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
		RETURNING id
	`
	err := r.db.QueryRow(ctx, query,
		meal.Name,
		meal.Description,
		meal.ImageURL,
		meal.Calories,
		meal.Protein,
		meal.Carbs,
		meal.Fat,
		meal.Price,
	).Scan(&meal.ID)
	return err
}

func (r *mealRepository) GetByID(ctx context.Context, id int) (*models.Meal, error) {
	query := `
		SELECT id, name, description, image_url, calories, protein, carbs, fat, price 
		FROM meals 
		WHERE id = $1
	`
	var meal models.Meal
	err := r.db.QueryRow(ctx, query, id).Scan(
		&meal.ID,
		&meal.Name,
		&meal.Description,
		&meal.ImageURL,
		&meal.Calories,
		&meal.Protein,
		&meal.Carbs,
		&meal.Fat,
		&meal.Price,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return &meal, nil
}

func (r *mealRepository) GetAll(ctx context.Context) ([]models.Meal, error) {
	query := `
		SELECT id, name, description, image_url, calories, protein, carbs, fat, price 
		FROM meals 
		ORDER BY id
	`
	rows, err := r.db.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var meals []models.Meal
	for rows.Next() {
		var meal models.Meal
		err := rows.Scan(
			&meal.ID,
			&meal.Name,
			&meal.Description,
			&meal.ImageURL,
			&meal.Calories,
			&meal.Protein,
			&meal.Carbs,
			&meal.Fat,
			&meal.Price,
		)
		if err != nil {
			return nil, err
		}
		meals = append(meals, meal)
	}
	return meals, nil
}

func (r *mealRepository) Update(ctx context.Context, id int, meal *models.Meal) error {
	query := `
		UPDATE meals 
		SET name = $1, description = $2, image_url = $3, calories = $4, 
		    protein = $5, carbs = $6, fat = $7, price = $8 
		WHERE id = $9
	`
	result, err := r.db.Exec(ctx, query,
		meal.Name,
		meal.Description,
		meal.ImageURL,
		meal.Calories,
		meal.Protein,
		meal.Carbs,
		meal.Fat,
		meal.Price,
		id,
	)
	if err != nil {
		return err
	}
	if result.RowsAffected() == 0 {
		return errors.New("meal not found")
	}
	return nil
}

func (r *mealRepository) Delete(ctx context.Context, id int) error {
	query := `DELETE FROM meals WHERE id = $1`
	result, err := r.db.Exec(ctx, query, id)
	if err != nil {
		return err
	}
	if result.RowsAffected() == 0 {
		return errors.New("meal not found")
	}
	return nil
}

func (r *mealRepository) IsUsedInMenus(ctx context.Context, id int) (bool, error) {
	query := `SELECT COUNT(*) FROM menu_meals WHERE meal_id = $1`
	var count int
	err := r.db.QueryRow(ctx, query, id).Scan(&count)
	if err != nil {
		return false, err
	}
	return count > 0, nil
}
