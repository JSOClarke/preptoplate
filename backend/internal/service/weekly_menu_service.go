package service

import (
	"context"
	"errors"
	"time"

	"github.com/jopari/preptoplate/internal/models"
	"github.com/jopari/preptoplate/internal/repository"
)

type WeeklyMenuService interface {
	Create(ctx context.Context, req *models.CreateWeeklyMenuRequest) (*models.WeeklyMenu, error)
	GetByID(ctx context.Context, id int) (*models.WeeklyMenu, error)
	GetAll(ctx context.Context) ([]models.WeeklyMenu, error)
	GetActive(ctx context.Context) (*models.WeeklyMenu, error)
	Update(ctx context.Context, id int, req *models.UpdateWeeklyMenuRequest) (*models.WeeklyMenu, error)
	Delete(ctx context.Context, id int) error
	Activate(ctx context.Context, id int) error
}

type weeklyMenuService struct {
	menuRepo repository.WeeklyMenuRepository
	mealRepo repository.MealRepository
}

func NewWeeklyMenuService(menuRepo repository.WeeklyMenuRepository, mealRepo repository.MealRepository) WeeklyMenuService {
	return &weeklyMenuService{
		menuRepo: menuRepo,
		mealRepo: mealRepo,
	}
}

func (s *weeklyMenuService) Create(ctx context.Context, req *models.CreateWeeklyMenuRequest) (*models.WeeklyMenu, error) {
	// Parse week start date
	weekStart, err := time.Parse("2006-01-02", req.WeekStartDate)
	if err != nil {
		return nil, errors.New("invalid date format, use YYYY-MM-DD")
	}

	// Validate all meals exist
	for _, mealInput := range req.Meals {
		meal, err := s.mealRepo.GetByID(ctx, mealInput.MealID)
		if err != nil {
			return nil, err
		}
		if meal == nil {
			return nil, errors.New("meal not found")
		}
	}

	// Create menu
	menu := &models.WeeklyMenu{
		WeekStartDate: weekStart,
		IsActive:      false,
	}

	err = s.menuRepo.Create(ctx, menu)
	if err != nil {
		return nil, err
	}

	// Add meals to menu
	for _, mealInput := range req.Meals {
		err = s.menuRepo.AddMeal(ctx, menu.ID, mealInput.MealID, mealInput.Stock)
		if err != nil {
			return nil, err
		}
	}

	// Return full menu with meals
	return s.menuRepo.GetByID(ctx, menu.ID)
}

func (s *weeklyMenuService) GetByID(ctx context.Context, id int) (*models.WeeklyMenu, error) {
	menu, err := s.menuRepo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if menu == nil {
		return nil, errors.New("weekly menu not found")
	}
	return menu, nil
}

func (s *weeklyMenuService) GetAll(ctx context.Context) ([]models.WeeklyMenu, error) {
	return s.menuRepo.GetAll(ctx)
}

func (s *weeklyMenuService) GetActive(ctx context.Context) (*models.WeeklyMenu, error) {
	return s.menuRepo.GetActive(ctx)
}

func (s *weeklyMenuService) Activate(ctx context.Context, id int) error {
	// Verify menu exists
	_, err := s.GetByID(ctx, id)
	if err != nil {
		return err
	}

	return s.menuRepo.Activate(ctx, id)
}

func (s *weeklyMenuService) Update(ctx context.Context, id int, req *models.UpdateWeeklyMenuRequest) (*models.WeeklyMenu, error) {
	// Verify menu exists
	_, err := s.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	// Parse week start date
	weekStart, err := time.Parse("2006-01-02", req.WeekStartDate)
	if err != nil {
		return nil, errors.New("invalid date format, use YYYY-MM-DD")
	}

	// Validate all meals exist
	for _, mealInput := range req.Meals {
		meal, err := s.mealRepo.GetByID(ctx, mealInput.MealID)
		if err != nil {
			return nil, err
		}
		if meal == nil {
			return nil, errors.New("meal not found")
		}
	}

	// Prepare updated menu
	menu := &models.WeeklyMenu{
		WeekStartDate: weekStart,
		Meals:         make([]models.WeeklyMenuMeal, len(req.Meals)),
	}

	for i, mealInput := range req.Meals {
		menu.Meals[i] = models.WeeklyMenuMeal{
			Meal:         models.Meal{ID: mealInput.MealID},
			InitialStock: mealInput.Stock,
		}
	}

	err = s.menuRepo.Update(ctx, id, menu)
	if err != nil {
		return nil, err
	}

	// Return full updated menu
	return s.menuRepo.GetByID(ctx, id)
}

func (s *weeklyMenuService) Delete(ctx context.Context, id int) error {
	// Verify menu exists
	menu, err := s.GetByID(ctx, id)
	if err != nil {
		return err
	}

	// Don't allow deleting active menu
	if menu.IsActive {
		return errors.New("cannot delete active menu, deactivate it first")
	}

	return s.menuRepo.Delete(ctx, id)
}
