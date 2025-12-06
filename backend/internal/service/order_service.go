package service

import (
	"context"
	"errors"
	"time"

	"github.com/jopari/preptoplate/internal/models"
	"github.com/jopari/preptoplate/internal/repository"
)

type OrderService interface {
	Checkout(ctx context.Context, userID int, req *models.CheckoutRequest) (*models.Order, error)
	GetByID(ctx context.Context, userID, orderID int) (*models.Order, error)
	GetUserOrders(ctx context.Context, userID int) ([]models.Order, error)
}

type orderService struct {
	orderRepo    repository.OrderRepository
	cartRepo     repository.CartRepository
	menuRepo     repository.WeeklyMenuRepository
	emailService EmailService
	userRepo     repository.UserRepository
}

func NewOrderService(orderRepo repository.OrderRepository, cartRepo repository.CartRepository, menuRepo repository.WeeklyMenuRepository, emailService EmailService, userRepo repository.UserRepository) OrderService {
	return &orderService{
		orderRepo:    orderRepo,
		cartRepo:     cartRepo,
		menuRepo:     menuRepo,
		emailService: emailService,
		userRepo:     userRepo,
	}
}

func (s *orderService) Checkout(ctx context.Context, userID int, req *models.CheckoutRequest) (*models.Order, error) {
	// Get or create user's cart
	cart, err := s.cartRepo.GetOrCreateByUserID(ctx, userID)
	if err != nil {
		return nil, err
	}
	if cart == nil || len(cart.Items) == 0 {
		return nil, errors.New("cart is empty")
	}

	// Validate cart has exactly 10 meals
	if cart.TotalItems != 10 {
		return nil, errors.New("cart must contain exactly 10 meals")
	}

	// Get active weekly menu
	activeMenu, err := s.menuRepo.GetActive(ctx)
	if err != nil {
		return nil, err
	}
	if activeMenu == nil {
		return nil, errors.New("no active weekly menu")
	}

	// Parse delivery date
	deliveryDate, err := time.Parse("2006-01-02", req.DeliveryDate)
	if err != nil {
		return nil, errors.New("invalid delivery date format, use YYYY-MM-DD")
	}

	// Verify stock for all cart items
	for _, item := range cart.Items {
		stock, err := s.menuRepo.GetMealStock(ctx, activeMenu.ID, item.MealID)
		if err != nil {
			return nil, err
		}
		if stock < item.Quantity {
			return nil, errors.New("insufficient stock for meal: " + item.Meal.Name)
		}
	}

	// Create order
	order := &models.Order{
		UserID:       userID,
		WeekID:       activeMenu.ID,
		Status:       "pending",
		TotalPrice:   cart.TotalPrice,
		DeliveryDate: deliveryDate,
	}

	err = s.orderRepo.Create(ctx, order)
	if err != nil {
		return nil, err
	}

	// Add items to order and decrement stock
	for _, cartItem := range cart.Items {
		orderItem := &models.OrderItem{
			OrderID:  order.ID,
			MealID:   cartItem.MealID,
			Quantity: cartItem.Quantity,
			Price:    cartItem.Meal.Price,
		}

		err = s.orderRepo.AddItem(ctx, order.ID, orderItem)
		if err != nil {
			return nil, err
		}

		// Decrement stock
		err = s.menuRepo.DecrementStock(ctx, activeMenu.ID, cartItem.MealID, cartItem.Quantity)
		if err != nil {
			return nil, err
		}
	}

	// Clear cart
	err = s.cartRepo.Clear(ctx, cart.ID)
	if err != nil {
		return nil, err
	}

	// Get complete order details
	finalOrder, err := s.orderRepo.GetByID(ctx, order.ID)
	if err != nil {
		return nil, err
	}

	// Get user email
	user, err := s.userRepo.GetByID(ctx, userID)
	if err == nil && user != nil {
		// Send receipt asynchronously
		go func() {
			err := s.emailService.SendOrderReceipt(user.Email, finalOrder)
			if err != nil {
				// Log error but don't fail the request
				// In production, use a proper logger
			}
		}()
	}

	return finalOrder, nil
}

func (s *orderService) GetByID(ctx context.Context, userID, orderID int) (*models.Order, error) {
	order, err := s.orderRepo.GetByID(ctx, orderID)
	if err != nil {
		return nil, err
	}
	if order == nil {
		return nil, errors.New("order not found")
	}

	// Verify ownership
	if order.UserID != userID {
		return nil, errors.New("unauthorized")
	}

	return order, nil
}

func (s *orderService) GetUserOrders(ctx context.Context, userID int) ([]models.Order, error) {
	return s.orderRepo.GetByUserID(ctx, userID)
}
