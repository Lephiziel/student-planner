package main

import (
	"github.com/Lephiziel/student-planner/internal/auth"
	"github.com/Lephiziel/student-planner/internal/grade"
	"github.com/Lephiziel/student-planner/internal/subject"
	"github.com/Lephiziel/student-planner/internal/task"
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
		AllowMethods: []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
	}))

	db.AutoMigrate(&user.User{}, &subject.Subject{}, &task.Task{}, &grade.Grade{})

	repo := user.NewUserRepository(db)

	subjectRepo := subject.NewSubjectRepository(db)

	taskRepo := task.NewTaskRepository(db)

	gradeRepo := grade.NewGradeRepository(db)

	userService := user.NewUserService(*repo)

	subjectService := subject.NewSubjectService(*subjectRepo)

	gradeService := grade.NewGradeService(*gradeRepo, *taskRepo)

	taskService := task.NewTaskService(*taskRepo)

	taskHandler := task.NewTaskHandler(*taskService, cfg.JWTSecret)

	authHandler := auth.NewAuthHandler(*userService, cfg.JWTSecret)

	userHandler := user.NewUserHandler(*userService, cfg.JWTSecret)

	gradeHandler := grade.NewGradeHandler(*gradeService, cfg.JWTSecret)

	subjectHandler := subject.NewSubjectHandler(*subjectService, cfg.JWTSecret)

	api := router.Group("/api")

	authHandler.RegisterRoutes(api)

	userHandler.RegisterRoutes(api)

	subjectHandler.RegisterRoutes(api)

	taskHandler.RegisterRoutes(api)

	gradeHandler.RegisterRoutes(api)

	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status": "ok",
		})
	})

	router.Run(":" + cfg.AppPort)
}
