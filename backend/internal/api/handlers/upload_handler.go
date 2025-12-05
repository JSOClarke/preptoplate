package handlers

import (
	"net/http"
	"path/filepath"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/jopari/preptoplate/internal/service"
)

type UploadHandler struct {
	imageService service.ImageService
}

func NewUploadHandler(imageService service.ImageService) *UploadHandler {
	return &UploadHandler{imageService: imageService}
}

// @Summary      Upload image
// @Description  Admin only - Upload an image to Cloudinary
// @Tags         upload,admin
// @Accept       multipart/form-data
// @Produce      json
// @Param        file  formData  file  true  "Image file"
// @Success      200   {object}  map[string]string
// @Failure      400   {object}  map[string]string
// @Failure      500   {object}  map[string]string
// @Security     BearerAuth
// @Router       /upload [post]
func (h *UploadHandler) HandleImageUpload(c *gin.Context) {
	// 1. Get file from request
	file, header, err := c.Request.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "no file uploaded"})
		return
	}
	defer file.Close()

	// 2. Validate file type (basic check)
	ext := strings.ToLower(filepath.Ext(header.Filename))
	if ext != ".jpg" && ext != ".jpeg" && ext != ".png" && ext != ".webp" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid file type. only jpg, jpeg, png, webp allowed"})
		return
	}

	// 3. Upload to Cloudinary
	url, err := h.imageService.UploadImage(c.Request.Context(), file, header.Filename)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to upload image: " + err.Error()})
		return
	}

	// 4. Return URL
	c.JSON(http.StatusOK, gin.H{"url": url})
}
