package main

import (
	"github.com/Lephiziel/student-planner/internal/auth"
	"github.com/Lephiziel/student-planner/internal/user"
	"github.com/Lephiziel/student-planner/pkg/config"
	"github.com/Lephiziel/student-planner/pkg/database"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	cfg := config.Load()

	db := database.Connect(cfg)

	router := gin.Default()

	router.Use(cors.New(cors.Config{
		AllowOrigins: []string{"http://localhost:5173"},
	}))

	db.AutoMigrate(&user.User{})

	repo := user.NewUserRepository(db)

	userService := user.NewUserService(*repo)

	authHandler := auth.NewAuthHandler(*userService)

	api := router.Group("/api")

	authHandler.RegisterRoutes(api)

	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status": "ok",
		})
	})

	router.Run(":" + cfg.AppPort)
}
