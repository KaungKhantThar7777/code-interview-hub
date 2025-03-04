package main

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
)

type Problem struct {
	ID          string     `json:"id"`
	Title       string     `json:"title" validate:"required,min=3"`
	Difficulty  string     `json:"difficulty" validate:"required,oneof=easy medium hard"`
	Description string     `json:"description" validate:"required,min=10"`
	Examples    []Example  `json:"examples" validate:"required,min=1,dive"`
	TestCases   []TestCase `json:"testCases" validate:"required,min=1,dive"`
}

type Example struct {
	Input       string `json:"input" validate:"required"`
	Output      string `json:"output" validate:"required"`
	Explanation string `json:"explanation" validate:"required"`
}

type TestCase struct {
	Input    string `json:"input" validate:"required"`
	Output   string `json:"output" validate:"required"`
	IsHidden bool   `json:"isHidden"`
}

var validate *validator.Validate

func main() {
	validate = validator.New()

	r := gin.Default()

	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "OK",
			"service": "problem-service",
		})
	})

	r.POST("/problems", createProblem)

	log.Fatal(r.Run(":3003"))

}

func createProblem(c *gin.Context) {
	var newProblem Problem

	if err := c.ShouldBindJSON(&newProblem); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := validate.Struct(newProblem); err != nil {
		validationErrors := err.(validator.ValidationErrors)

		errors := make([]string, len(validationErrors))

		for i, e := range validationErrors {
			errors[i] = e.Field() + " is " + e.Tag()
		}

		c.JSON(http.StatusBadRequest, gin.H{"errors": errors})
		return
	}

	c.JSON(http.StatusCreated, newProblem)
}
