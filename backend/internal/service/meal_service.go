package service

import (
	"context"
	"errors"

	"github.com/jopari/preptoplate/internal/models"
	"github.com/jopari/preptoplate/internal/repository"
)

type MealService interface {
	Create(ctx context.Context, req *models.CreateMealRequest) (*models.Meal, error)
	GetByID(ctx context.Context, id int) (*models.Meal, error)
	GetAll(ctx context.Context) ([]models.Meal, error)
	Update(ctx context.Context, id int, req *models.UpdateMealRequest) (*models.Meal, error)
	Delete(ctx context.Context, id int) error
}

type mealService struct {
	repo repository.MealRepository
}

func NewMealService(repo repository.MealRepository) MealService {
	return &mealService{repo: repo}
}

func (s *mealService) Create(ctx context.Context, req *models.CreateMealRequest) (*models.Meal, error) {
	meal := &models.Meal{
		Name:        req.Name,
		Description: req.Description,
		ImageURL:    req.ImageURL,
		Calories:    req.Calories,
		Protein:     req.Protein,
		Carbs:       req.Carbs,
		Fat:         req.Fat,
		Price:       req.Price,
	}

	if err := s.repo.Create(ctx, meal); err != nil {
		return nil, err
	}

	return meal, nil
}

func (s *mealService) GetByID(ctx context.Context, id int) (*models.Meal, error) {
	meal, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if meal == nil {
		return nil, errors.New("meal not found")
	}
	return meal, nil
}

func (s *mealService) GetAll(ctx context.Context) ([]models.Meal, error) {
	return s.repo.GetAll(ctx)
}

func (s *mealService) Update(ctx context.Context, id int, req *models.UpdateMealRequest) (*models.Meal, error) {
	// Get existing meal
	existing, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if existing == nil {
		return nil, errors.New("meal not found")
	}

	// Apply updates only for non-nil fields
	if req.Name != nil {
		existing.Name = *req.Name
	}
	if req.Description != nil {
		existing.Description = *req.Description
	}
	if req.ImageURL != nil {
		existing.ImageURL = *req.ImageURL
	}
	if req.Calories != nil {
		existing.Calories = *req.Calories
	}
	if req.Protein != nil {
		existing.Protein = *req.Protein
	}
	if req.Carbs != nil {
		existing.Carbs = *req.Carbs
	}
	if req.Fat != nil {
		existing.Fat = *req.Fat
	}
	if req.Price != nil {
		existing.Price = *req.Price
	}

	if err := s.repo.Update(ctx, id, existing); err != nil {
		return nil, err
	}

	return existing, nil
}

func (s *mealService) Delete(ctx context.Context, id int) error {
	return s.repo.Delete(ctx, id)
}
