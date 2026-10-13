package main

import (
	"backend/config"
	"backend/controllers"
	"backend/middleware"
	"backend/models"
	"net/http"
	"os"
	"strings"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	config.ConnectDatabase()
	config.DB.AutoMigrate(&models.Article{}, &models.User{})

	r := gin.Default()

	frontendURL := os.Getenv("FRONTEND_URL")

	allowedOrigins := []string{
		"http://localhost:5173",
		"http://localhost:4173",
		"https://tell-news-frontend.onrender.com",
	}

	if frontendURL != "" {
		allowedOrigins = append(allowedOrigins, frontendURL)
	}

	r.Use(cors.New(cors.Config{
		AllowOrigins:     allowedOrigins,
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		AllowCredentials: true,
	}))

	api := r.Group("/api")
	{
		// Public Auth Routes
		api.POST("/register", controllers.Signup)
		api.POST("/login", controllers.Login)

		// Public News & Ads Routes
		api.GET("/news", controllers.GetArticles)
		api.GET("/news/:slug", controllers.GetArticleBySlug)
		api.GET("/ads/:id", controllers.GetAdDetail)
		api.GET("/validate", controllers.ValidateAuth)
		api.POST("/logout", controllers.Logout)
	}

	r.StaticFS("/uploads", http.Dir("uploads"))

	r.Use(func(c *gin.Context) {
		if strings.Contains(c.Request.URL.Path, "/uploads") {
			c.Header("Cache-Control", "public, max-age=31536000")
		}
		c.Next()
	})

	r.GET("/api/status", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "Running"})
	})

	// PROTECTED ROUTES (Only Admins)
	admin := api.Group("/")
	admin.Use(middleware.AdminOnly())
	{
		admin.POST("/news", controllers.CreateArticle)
		admin.PUT("/news/:slug", controllers.UpdateArticle)
		admin.DELETE("/news/:slug", controllers.DeleteArticle)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	if err := r.Run(":" + port); err != nil {
		panic(err)
	}
}
