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

// @Summary      Get user's cart
// @Description  Retrieve the authenticated user's cart with all items
// @Tags         cart
// @Produce      json
// @Success      200  {object}  models.Cart
// @Failure      401  {object}  map[string]string
// @Failure      500  {object}  map[string]string
// @Security     BearerAuth
// @Router       /cart [get]
func (h *CartHandler) GetCart(c *gin.Context) {
	userID, _ := c.Get("user_id")

	cart, err := h.service.GetCart(c.Request.Context(), userID.(int))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, cart)
}

// @Summary      Add meal to cart
// @Description  Add a meal to the user's cart (max 10 meals total)
// @Tags         cart
// @Accept       json
// @Produce      json
// @Param        item  body      models.AddToCartRequest  true  "Meal to add"
// @Success      200   {object}  models.Cart
// @Failure      400   {object}  map[string]string
// @Failure      401   {object}  map[string]string
// @Security     BearerAuth
// @Router       /cart/items [post]
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

// @Summary      Update cart item quantity
// @Description  Update the quantity of a cart item (0 = remove)
// @Tags         cart
// @Accept       json
// @Produce      json
// @Param        id    path      int  true  "Cart Item ID"
// @Param        item  body      models.UpdateCartItemRequest  true  "New quantity"
// @Success      200   {object}  models.Cart
// @Failure      400   {object}  map[string]string
// @Failure      401   {object}  map[string]string
// @Security     BearerAuth
// @Router       /cart/items/{id} [put]
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

// @Summary      Remove item from cart
// @Description  Remove a specific item from the cart
// @Tags         cart
// @Param        id   path      int  true  "Cart Item ID"
// @Success      200  {object}  map[string]string
// @Failure      400  {object}  map[string]string
// @Failure      401  {object}  map[string]string
// @Security     BearerAuth
// @Router       /cart/items/{id} [delete]
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

// @Summary      Clear cart
// @Description  Remove all items from the user's cart
// @Tags         cart
// @Success      200  {object}  map[string]string
// @Failure      400  {object}  map[string]string
// @Failure      401  {object}  map[string]string
// @Security     BearerAuth
// @Router       /cart [delete]
func (h *CartHandler) ClearCart(c *gin.Context) {
	userID, _ := c.Get("user_id")

	err := h.service.ClearCart(c.Request.Context(), userID.(int))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "cart cleared"})
}
