package database

import (
	"fmt"
	"log"

	"github.com/Lephiziel/student-planner/pkg/config"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func Connect(cfg config.Config) *gorm.DB {
	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s", cfg.DBHost, cfg.DBUser, cfg.DBPassword, cfg.DBName, cfg.DBPort)
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Не удалось подключиться к БД")
	}

	return db
}
