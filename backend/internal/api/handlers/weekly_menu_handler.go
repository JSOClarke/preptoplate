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

// @Summary      Create weekly menu
// @Description  Admin only - Create a new weekly menu with meals and stock
// @Tags         admin,weekly-menu
// @Accept       json
// @Produce      json
// @Param        menu  body      models.CreateWeeklyMenuRequest  true  "Menu data"
// @Success      201   {object}  models.WeeklyMenu
// @Failure      400   {object}  map[string]string
// @Failure      401   {object}  map[string]string
// @Failure      403   {object}  map[string]string
// @Security     BearerAuth
// @Router       /admin/weekly-menus [post]
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

// @Summary      List all weekly menus
// @Description  Admin only - Get list of all weekly menus
// @Tags         admin,weekly-menu
// @Produce      json
// @Success      200  {array}   models.WeeklyMenu
// @Failure      401  {object}  map[string]string
// @Failure      403  {object}  map[string]string
// @Failure      500  {object}  map[string]string
// @Security     BearerAuth
// @Router       /admin/weekly-menus [get]
func (h *WeeklyMenuHandler) List(c *gin.Context) {
	menus, err := h.service.GetAll(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, menus)
}

// @Summary      Get weekly menu by ID
// @Description  Admin only - Get details of a specific weekly menu
// @Tags         admin,weekly-menu
// @Produce      json
// @Param        id   path      int  true  "Menu ID"
// @Success      200  {object}  models.WeeklyMenu
// @Failure      400  {object}  map[string]string
// @Failure      401  {object}  map[string]string
// @Failure      403  {object}  map[string]string
// @Failure      404  {object}  map[string]string
// @Security     BearerAuth
// @Router       /admin/weekly-menus/{id} [get]
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

// @Summary      Activate weekly menu
// @Description  Admin only - Set a menu as active (deactivates all other menus)
// @Tags         admin,weekly-menu
// @Param        id   path      int  true  "Menu ID"
// @Success      200  {object}  map[string]string
// @Failure      400  {object}  map[string]string
// @Failure      401  {object}  map[string]string
// @Failure      403  {object}  map[string]string
// @Security     BearerAuth
// @Router       /admin/weekly-menus/{id}/activate [put]
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

// @Summary      Update weekly menu
// @Description  Admin only - Update a weekly menu's date and meals
// @Tags         admin,weekly-menu
// @Accept       json
// @Produce      json
// @Param        id    path      int                            true  "Menu ID"
// @Param        menu  body      models.UpdateWeeklyMenuRequest true  "Menu data"
// @Success      200   {object}  models.WeeklyMenu
// @Failure      400   {object}  map[string]string
// @Failure      401   {object}  map[string]string
// @Failure      403   {object}  map[string]string
// @Security     BearerAuth
// @Router       /admin/weekly-menus/{id} [put]
func (h *WeeklyMenuHandler) Update(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid menu id"})
		return
	}

	var req models.UpdateWeeklyMenuRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	menu, err := h.service.Update(c.Request.Context(), id, &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, menu)
}

// @Summary      Delete weekly menu
// @Description  Admin only - Delete a weekly menu (cannot delete active menus)
// @Tags         admin,weekly-menu
// @Param        id   path      int  true  "Menu ID"
// @Success      200  {object}  map[string]string
// @Failure      400  {object}  map[string]string
// @Failure      401  {object}  map[string]string
// @Failure      403  {object}  map[string]string
// @Security     BearerAuth
// @Router       /admin/weekly-menus/{id} [delete]
func (h *WeeklyMenuHandler) Delete(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid menu id"})
		return
	}

	err = h.service.Delete(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "menu deleted successfully"})
}

// Public endpoints

// @Summary      Get active weekly menu
// @Description  Get the currently active weekly menu with stock information
// @Tags         weekly-menu
// @Produce      json
// @Success      200  {object}  models.WeeklyMenu
// @Failure      404  {object}  map[string]string
// @Failure      500  {object}  map[string]string
// @Router       /menu [get]
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
