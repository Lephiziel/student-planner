package main

import (
	"github.com/Lephiziel/student-planner/internal/auth"
	"github.com/Lephiziel/student-planner/internal/subject"
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
		AllowHeaders: []string{"Origin", "Content-Type", "Authorization"},
		AllowMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
	}))

	db.AutoMigrate(&user.User{}, &subject.Subject{})

	repo := user.NewUserRepository(db)

	subjectRepo := subject.NewSubjectRepository(db)

	userService := user.NewUserService(*repo)

	subjectService := subject.NewSubjectService(*subjectRepo)

	authHandler := auth.NewAuthHandler(*userService, cfg.JWTSecret)

	userHandler := user.NewUserHandler(*userService, cfg.JWTSecret)

	subjectHandler := subject.NewSubjectHandler(*subjectService, cfg.JWTSecret)

	api := router.Group("/api")

	authHandler.RegisterRoutes(api)

	userHandler.RegisterRoutes(api)

	subjectHandler.RegisterRoutes(api)

	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status": "ok",
		})
	})

	router.Run(":" + cfg.AppPort)
}
