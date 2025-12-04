package service

import (
	"context"
	"errors"
	"fmt"

	"github.com/jopari/preptoplate/internal/models"
	"github.com/jopari/preptoplate/internal/repository"
)

const MaxCartItems = 10

type CartService interface {
	GetCart(ctx context.Context, userID int) (*models.Cart, error)
	AddItem(ctx context.Context, userID int, req *models.AddToCartRequest) (*models.Cart, error)
	UpdateItem(ctx context.Context, userID, itemID int, req *models.UpdateCartItemRequest) (*models.Cart, error)
	RemoveItem(ctx context.Context, userID, itemID int) error
	ClearCart(ctx context.Context, userID int) error
}

type cartService struct {
	cartRepo repository.CartRepository
	mealRepo repository.MealRepository
}

func NewCartService(cartRepo repository.CartRepository, mealRepo repository.MealRepository) CartService {
	return &cartService{
		cartRepo: cartRepo,
		mealRepo: mealRepo,
	}
}

func (s *cartService) GetCart(ctx context.Context, userID int) (*models.Cart, error) {
	return s.cartRepo.GetOrCreateByUserID(ctx, userID)
}

func (s *cartService) AddItem(ctx context.Context, userID int, req *models.AddToCartRequest) (*models.Cart, error) {
	// Verify meal exists
	meal, err := s.mealRepo.GetByID(ctx, req.MealID)
	if err != nil {
		return nil, err
	}
	if meal == nil {
		return nil, errors.New("meal not found")
	}

	// Get or create cart
	cart, err := s.cartRepo.GetOrCreateByUserID(ctx, userID)
	if err != nil {
		return nil, err
	}

	// Check if item already exists in cart
	existingItem, err := s.cartRepo.GetItemByCartAndMeal(ctx, cart.ID, req.MealID)
	if err != nil {
		return nil, err
	}

	if existingItem != nil {
		// Update quantity if item exists
		newQuantity := existingItem.Quantity + req.Quantity

		// Check total items limit
		currentCount, err := s.cartRepo.GetItemCount(ctx, cart.ID)
		if err != nil {
			return nil, err
		}
		if currentCount-existingItem.Quantity+newQuantity > MaxCartItems {
			return nil, fmt.Errorf("cannot add %d items, cart limit is %d meals", req.Quantity, MaxCartItems)
		}

		err = s.cartRepo.UpdateItemQuantity(ctx, existingItem.ID, newQuantity)
		if err != nil {
			return nil, err
		}
	} else {
		// Check total items limit before adding new item
		currentCount, err := s.cartRepo.GetItemCount(ctx, cart.ID)
		if err != nil {
			return nil, err
		}
		if currentCount+req.Quantity > MaxCartItems {
			return nil, fmt.Errorf("cannot add %d items, cart limit is %d meals", req.Quantity, MaxCartItems)
		}

		// Add new item
		err = s.cartRepo.AddItem(ctx, cart.ID, req.MealID, req.Quantity)
		if err != nil {
			return nil, err
		}
	}

	// Return updated cart
	return s.cartRepo.GetByUserID(ctx, userID)
}

func (s *cartService) UpdateItem(ctx context.Context, userID, itemID int, req *models.UpdateCartItemRequest) (*models.Cart, error) {
	// Get cart to verify ownership
	cart, err := s.cartRepo.GetByUserID(ctx, userID)
	if err != nil {
		return nil, err
	}
	if cart == nil {
		return nil, errors.New("cart not found")
	}

	// Verify item belongs to user's cart
	var itemFound bool
	var currentItemQuantity int
	for _, item := range cart.Items {
		if item.ID == itemID {
			itemFound = true
			currentItemQuantity = item.Quantity
			break
		}
	}
	if !itemFound {
		return nil, errors.New("cart item not found")
	}

	if req.Quantity == 0 {
		// Remove item if quantity is 0
		return nil, s.cartRepo.RemoveItem(ctx, itemID)
	}

	// Check total items limit
	currentCount, err := s.cartRepo.GetItemCount(ctx, cart.ID)
	if err != nil {
		return nil, err
	}
	newTotalCount := currentCount - currentItemQuantity + req.Quantity
	if newTotalCount > MaxCartItems {
		return nil, fmt.Errorf("cannot update to %d items, cart limit is %d meals", req.Quantity, MaxCartItems)
	}

	// Update quantity
	err = s.cartRepo.UpdateItemQuantity(ctx, itemID, req.Quantity)
	if err != nil {
		return nil, err
	}

	// Return updated cart
	return s.cartRepo.GetByUserID(ctx, userID)
}

func (s *cartService) RemoveItem(ctx context.Context, userID, itemID int) error {
	// Get cart to verify ownership
	cart, err := s.cartRepo.GetByUserID(ctx, userID)
	if err != nil {
		return err
	}
	if cart == nil {
		return errors.New("cart not found")
	}

	// Verify item belongs to user's cart
	var itemFound bool
	for _, item := range cart.Items {
		if item.ID == itemID {
			itemFound = true
			break
		}
	}
	if !itemFound {
		return errors.New("cart item not found")
	}

	return s.cartRepo.RemoveItem(ctx, itemID)
}

func (s *cartService) ClearCart(ctx context.Context, userID int) error {
	cart, err := s.cartRepo.GetByUserID(ctx, userID)
	if err != nil {
		return err
	}
	if cart == nil {
		return errors.New("cart not found")
	}

	return s.cartRepo.Clear(ctx, cart.ID)
}
