package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/jopari/preptoplate/internal/models"
	"github.com/jopari/preptoplate/internal/service"
)

type OrderHandler struct {
	service service.OrderService
}

func NewOrderHandler(service service.OrderService) *OrderHandler {
	return &OrderHandler{service: service}
}

// @Summary      Checkout
// @Description  Convert user's cart to an order (requires exactly 10 meals)
// @Tags         orders
// @Accept       json
// @Produce      json
// @Param        checkout  body      models.CheckoutRequest  true  "Checkout data"
// @Success      201       {object}  models.Order
// @Failure      400       {object}  map[string]string
// @Failure      401       {object}  map[string]string
// @Security     BearerAuth
// @Router       /orders/checkout [post]
func (h *OrderHandler) Checkout(c *gin.Context) {
	userID, _ := c.Get("user_id")

	var req models.CheckoutRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	order, err := h.service.Checkout(c.Request.Context(), userID.(int), &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, order)
}

// @Summary      Get user's orders
// @Description  Get all orders for the authenticated user
// @Tags         orders
// @Produce      json
// @Success      200  {array}   models.Order
// @Failure      401  {object}  map[string]string
// @Failure      500  {object}  map[string]string
// @Security     BearerAuth
// @Router       /orders [get]
func (h *OrderHandler) GetOrders(c *gin.Context) {
	userID, _ := c.Get("user_id")

	orders, err := h.service.GetUserOrders(c.Request.Context(), userID.(int))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, orders)
}

// @Summary      Get order by ID
// @Description  Get details of a specific order (must belong to user)
// @Tags         orders
// @Produce      json
// @Param        id   path      int  true  "Order ID"
// @Success      200  {object}  models.Order
// @Failure      400  {object}  map[string]string
// @Failure      401  {object}  map[string]string
// @Failure      404  {object}  map[string]string
// @Security     BearerAuth
// @Router       /orders/{id} [get]
func (h *OrderHandler) GetByID(c *gin.Context) {
	userID, _ := c.Get("user_id")

	idParam := c.Param("id")
	orderID, err := strconv.Atoi(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid order id"})
		return
	}

	order, err := h.service.GetByID(c.Request.Context(), userID.(int), orderID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, order)
}
