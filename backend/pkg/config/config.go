package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	DBHost     string
	DBPort     string
	DBUser     string
	DBPassword string
	DBName     string
	JWTSecret  string
	AppPort    string
}

func Load() (cfg Config) {
	err := godotenv.Load()
	if err != nil {
		log.Println("Ошибка загрузки .env файла")
	}

	cfg.DBHost = os.Getenv("DB_HOST")
	cfg.DBPort = os.Getenv("DB_PORT")
	cfg.DBUser = os.Getenv("DB_USER")
	cfg.DBPassword = os.Getenv("DB_PASSWORD")
	cfg.DBName = os.Getenv("DB_NAME")
	cfg.JWTSecret = os.Getenv("JWT_SECRET")
	cfg.AppPort = os.Getenv("APP_PORT")

	return cfg
}
