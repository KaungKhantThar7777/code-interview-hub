package main

import (
	"fmt"
	"log"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"

	"github.com/kaungkhanttar7777/interview-hub/problem-service/internal/config"
	"github.com/kaungkhanttar7777/interview-hub/problem-service/internal/database"
	"github.com/kaungkhanttar7777/interview-hub/problem-service/internal/handlers"
)

func main() {
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatal(err)
	}

	db, err := database.InitDB(cfg)
	if err != nil {
		log.Fatal(err)
	}

	validate := validator.New()
	problemHandler := handlers.NewProblemHandler(db, validate)

	r := gin.Default()

	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "OK",
			"service": "problem-service",
		})
	})

	problems := r.Group("/problems")
	{
		problems.POST("", problemHandler.CreateProblem)
		problems.GET("/:id", problemHandler.GetProblem)
		problems.GET("", problemHandler.GetProblems)
		problems.PUT("/:id", problemHandler.UpdateProblem)
		problems.DELETE("/:id", problemHandler.DeleteProblem)
	}

	log.Fatal(r.Run(fmt.Sprintf(":%s", cfg.Port)))
}
