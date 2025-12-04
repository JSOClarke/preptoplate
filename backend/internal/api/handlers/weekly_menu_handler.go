package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/jopari/preptoplate/internal/models"
	"github.com/jopari/preptoplate/internal/service"
)

type WeeklyMenuHandler struct {
	service service.WeeklyMenuService
}

func NewWeeklyMenuHandler(service service.WeeklyMenuService) *WeeklyMenuHandler {
	return &WeeklyMenuHandler{service: service}
}

// Admin endpoints

func (h *WeeklyMenuHandler) Create(c *gin.Context) {
	var req models.CreateWeeklyMenuRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	menu, err := h.service.Create(c.Request.Context(), &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, menu)
}

func (h *WeeklyMenuHandler) GetByID(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid menu id"})
		return
	}

	menu, err := h.service.GetByID(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, menu)
}

func (h *WeeklyMenuHandler) Activate(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid menu id"})
		return
	}

	err = h.service.Activate(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "menu activated"})
}

// Public endpoints

func (h *WeeklyMenuHandler) GetActiveMenu(c *gin.Context) {
	menu, err := h.service.GetActive(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if menu == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "no active menu"})
		return
	}

	c.JSON(http.StatusOK, menu)
}
