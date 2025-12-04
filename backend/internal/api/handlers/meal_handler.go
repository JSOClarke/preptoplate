package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/jopari/preptoplate/internal/models"
	"github.com/jopari/preptoplate/internal/service"
)

type MealHandler struct {
	service service.MealService
}

func NewMealHandler(service service.MealService) *MealHandler {
	return &MealHandler{service: service}
}

// @Summary      List all meals
// @Description  Get list of all available meals
// @Tags         meals
// @Produce      json
// @Success      200  {array}   models.Meal
// @Failure      500  {object}  map[string]string
// @Router       /meals [get]
func (h *MealHandler) List(c *gin.Context) {
	meals, err := h.service.GetAll(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, meals)
}

// @Summary      Get meal by ID
// @Description  Get a specific meal by its ID
// @Tags         meals
// @Produce      json
// @Param        id   path      int  true  "Meal ID"
// @Success      200  {object}  models.Meal
// @Failure      400  {object}  map[string]string
// @Failure      404  {object}  map[string]string
// @Router       /meals/{id} [get]
func (h *MealHandler) GetByID(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid meal id"})
		return
	}

	meal, err := h.service.GetByID(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if meal == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "meal not found"})
		return
	}

	c.JSON(http.StatusOK, meal)
}

// @Summary      Create meal
// @Description  Admin only - Create a new meal
// @Tags         meals,admin
// @Accept       json
// @Produce      json
// @Param        meal  body      models.CreateMealRequest  true  "Meal data"
// @Success      201   {object}  models.Meal
// @Failure      400   {object}  map[string]string
// @Failure      401   {object}  map[string]string
// @Failure      403   {object}  map[string]string
// @Security     BearerAuth
// @Router       /meals [post]
func (h *MealHandler) Create(c *gin.Context) {
	var req models.CreateMealRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	meal, err := h.service.Create(c.Request.Context(), &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, meal)
}

// @Summary      Update meal
// @Description  Admin only - Update an existing meal
// @Tags         meals,admin
// @Accept       json
// @Produce      json
// @Param        id    path      int  true  "Meal ID"
// @Param        meal  body      models.UpdateMealRequest  true  "Updated meal data"
// @Success      200   {object}  models.Meal
// @Failure      400   {object}  map[string]string
// @Failure      401   {object}  map[string]string
// @Failure      403   {object}  map[string]string
// @Failure     	404   {object}  map[string]string
// @Security     BearerAuth
// @Router       /meals/{id} [put]
func (h *MealHandler) Update(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid meal id"})
		return
	}

	var req models.UpdateMealRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	meal, err := h.service.Update(c.Request.Context(), id, &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, meal)
}

// @Summary      Delete meal
// @Description  Admin only - Delete a meal
// @Tags         meals,admin
// @Param        id   path      int  true  "Meal ID"
// @Success      200  {object}  map[string]string
// @Failure      400  {object}  map[string]string
// @Failure      401  {object}  map[string]string
// @Failure      403  {object}  map[string]string
// @Security     BearerAuth
// @Router       /meals/{id} [delete]
func (h *MealHandler) Delete(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid meal id"})
		return
	}

	err = h.service.Delete(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "meal deleted successfully"})
}
