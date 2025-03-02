package main

import (
	"io"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
)

func main() {
	router := gin.Default()

	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status": "ok",
		})
	})

	userServiceUrl := os.Getenv("USER_SERVICE_URL")
	if userServiceUrl == "" {
		userServiceUrl = "http://localhost:3001"
	}

	api := router.Group("/api")
	{
		userRoutes := api.Group("/users")
		userRoutes.Any("/*path", func(c *gin.Context) {
			path := c.Param("path")
			proxyRequest(c, userServiceUrl+"/api/users"+path)
		})
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	router.Run(":" + port)
}

func proxyRequest(c *gin.Context, targetUrl string) {
	client := &http.Client{
		Timeout: time.Second * 10,
	}

	req, err := http.NewRequest(c.Request.Method, targetUrl, c.Request.Body)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to create request",
		})
		return
	}

	for key, values := range c.Request.Header {
		for _, value := range values {
			req.Header.Add(key, value)
		}
	}

	req.URL.RawQuery = c.Request.URL.RawQuery

	resp, err := client.Do(req)

	if err != nil {
		log.Printf("Error sending request: %v", err)
		c.JSON(http.StatusServiceUnavailable, gin.H{
			"error": "Service unavailable",
		})
		return
	}

	defer resp.Body.Close()

	for key, values := range resp.Header {
		for _, value := range values {
			c.Writer.Header().Add(key, value)
		}
	}

	c.Writer.WriteHeader(resp.StatusCode)

	_, err = io.Copy(c.Writer, resp.Body)

	if err != nil {
		log.Printf("Error copying response body: %v", err)
	}
}
