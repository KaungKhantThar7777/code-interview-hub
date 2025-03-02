package main

import (
	"encoding/json"
	"io"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
)

func getServiceURLs() map[string]string {
	userServiceUrl := os.Getenv("USER_SERVICE_URL")
	if userServiceUrl == "" {
		userServiceUrl = "http://localhost:3001"
	}

	return map[string]string{
		"user-service": userServiceUrl + "/swagger.json",
	}
}

func SwaggerAggregator(c *gin.Context) {
	combinedSwagger := make(map[string]interface{})
	combinedSwagger["openapi"] = "3.0.0"
	combinedSwagger["info"] = map[string]interface{}{
		"title":   "API Gateway",
		"version": "1.0",
	}
	combinedPaths := make(map[string]interface{})
	combinedSwagger["paths"] = combinedPaths

	// Initialize components section
	combinedComponents := make(map[string]interface{})
	combinedSwagger["components"] = combinedComponents
	combinedSchemas := make(map[string]interface{})
	combinedComponents["schemas"] = combinedSchemas

	services := getServiceURLs()
	for _, url := range services {
		resp, err := http.Get(url)
		if err != nil {
			continue
		}

		defer resp.Body.Close()

		body, err := io.ReadAll(resp.Body)
		if err != nil {
			continue
		}
		var swaggerDoc map[string]interface{}

		if err := json.Unmarshal(body, &swaggerDoc); err != nil {
			continue
		}

		// Aggregate paths
		if paths, ok := swaggerDoc["paths"].(map[string]interface{}); ok {
			for key, value := range paths {
				combinedPaths[key] = value
			}
		}

		// Aggregate components/schemas
		if components, ok := swaggerDoc["components"].(map[string]interface{}); ok {
			if schemas, ok := components["schemas"].(map[string]interface{}); ok {
				for key, value := range schemas {
					combinedSchemas[key] = value
				}
			}
		}
	}
	c.JSON(http.StatusOK, combinedSwagger)
}
