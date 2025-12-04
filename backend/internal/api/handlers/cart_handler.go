package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/jopari/preptoplate/internal/models"
	"github.com/jopari/preptoplate/internal/service"
)

type CartHandler struct {
	service service.CartService
}

func NewCartHandler(service service.CartService) *CartHandler {
	return &CartHandler{service: service}
}

func (h *CartHandler) GetCart(c *gin.Context) {
	userID, _ := c.Get("user_id")

	cart, err := h.service.GetCart(c.Request.Context(), userID.(int))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, cart)
}

func (h *CartHandler) AddItem(c *gin.Context) {
	userID, _ := c.Get("user_id")

	var req models.AddToCartRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	cart, err := h.service.AddItem(c.Request.Context(), userID.(int), &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, cart)
}

func (h *CartHandler) UpdateItem(c *gin.Context) {
	userID, _ := c.Get("user_id")

	itemIDParam := c.Param("id")
	itemID, err := strconv.Atoi(itemIDParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid item id"})
		return
	}

	var req models.UpdateCartItemRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	cart, err := h.service.UpdateItem(c.Request.Context(), userID.(int), itemID, &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if req.Quantity == 0 {
		c.JSON(http.StatusOK, gin.H{"message": "item removed from cart"})
		return
	}

	c.JSON(http.StatusOK, cart)
}

func (h *CartHandler) RemoveItem(c *gin.Context) {
	userID, _ := c.Get("user_id")

	itemIDParam := c.Param("id")
	itemID, err := strconv.Atoi(itemIDParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid item id"})
		return
	}

	err = h.service.RemoveItem(c.Request.Context(), userID.(int), itemID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "item removed from cart"})
}

func (h *CartHandler) ClearCart(c *gin.Context) {
	userID, _ := c.Get("user_id")

	err := h.service.ClearCart(c.Request.Context(), userID.(int))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "cart cleared"})
}
