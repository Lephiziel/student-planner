package main

import (
	"fmt"

	"github.com/Lephiziel/student-planner/pkg/config"
	"github.com/Lephiziel/student-planner/pkg/database"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	// For test cfg
	cfg := config.Load()
	fmt.Println(cfg.DBHost)

	// For test db
	db := database.Connect(cfg)
	query := db.Exec("SELECT 1")
	fmt.Println(query)

	router := gin.Default()

	router.Use(cors.New(cors.Config{
		AllowOrigins: []string{"http://localhost:5173"},
	}))

	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status": "ok",
		})
	})

	router.Run(cfg.AppPort)
}
