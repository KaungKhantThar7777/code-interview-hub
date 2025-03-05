package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/kaungkhanttar7777/interview-hub/problem-service/internal/models"
	"gorm.io/gorm"
)

type ProblemHandler struct {
	db       *gorm.DB
	validate *validator.Validate
}

func NewProblemHandler(db *gorm.DB, validate *validator.Validate) *ProblemHandler {
	return &ProblemHandler{
		db:       db,
		validate: validate,
	}
}

func (h *ProblemHandler) CreateProblem(c *gin.Context) {
	var problem models.Problem

	if err := c.ShouldBindJSON(&problem); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.validate.Struct(problem); err != nil {
		validationErrors := err.(validator.ValidationErrors)
		errors := make([]string, len(validationErrors))
		for i, e := range validationErrors {
			errors[i] = e.Field() + " is " + e.Tag()
		}
		c.JSON(http.StatusBadRequest, gin.H{"errors": errors})
		return
	}

	result := h.db.Create(&problem)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}

	c.JSON(http.StatusCreated, problem)
}

func (h *ProblemHandler) GetProblem(c *gin.Context) {
	id := c.Param("id")
	var problem models.Problem

	result := h.db.First(&problem, "id = ?", id)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Problem not found"})
		return
	}

	c.JSON(http.StatusOK, problem)
}

func (h *ProblemHandler) GetProblems(c *gin.Context) {
	var problems []models.Problem

	result := h.db.Find(&problems)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}

	c.JSON(http.StatusOK, problems)
}

func (h *ProblemHandler) UpdateProblem(c *gin.Context) {
	id := c.Param("id")
	var problem models.Problem

	result := h.db.First(&problem, "id = ?", id)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Problem not found"})
		return
	}

	if err := c.ShouldBindJSON(&problem); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	h.db.Save(&problem)
	c.JSON(http.StatusOK, problem)
}

func (h *ProblemHandler) DeleteProblem(c *gin.Context) {
	id := c.Param("id")

	result := h.db.Delete(&models.Problem{}, "id = ?", id)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Problem deleted successfully"})
}

// Add other handler methods (GetProblem, UpdateProblem, etc.)
