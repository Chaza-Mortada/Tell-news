package main

import (
	"net/http"
	"os"
	"strings"
	"time"

	"backend/config"
	"backend/controllers"
	"backend/middleware"
	"backend/models"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	config.ConnectDatabase()

	if err := config.DB.AutoMigrate(&models.Article{}, &models.User{}); err != nil {
		panic(err)
	}

	r := gin.Default()

	allowedOrigins := []string{
		"http://localhost:5173",
		"http://localhost:4173",
		"https://tell-news-frontend.onrender.com",
	}

	for _, origin := range strings.Split(os.Getenv("FRONTEND_URL"), ",") {
		origin = strings.TrimRight(strings.TrimSpace(origin), "/")
		if origin != "" {
			allowedOrigins = append(allowedOrigins, origin)
		}
	}

	r.Use(cors.New(cors.Config{
		AllowOrigins:     allowedOrigins,
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	api := r.Group("/api")
	{
		api.POST("/register", controllers.Signup)
		api.POST("/login", controllers.Login)

		api.GET("/news", controllers.GetArticles)
		api.GET("/news/:slug", controllers.GetArticleBySlug)
		api.GET("/ads/:id", controllers.GetAdDetail)
		api.GET("/validate", controllers.ValidateAuth)
		api.POST("/logout", controllers.Logout)
	}

	r.StaticFS("/uploads", http.Dir("uploads"))

	r.GET("/api/status", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "Running"})
	})

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
