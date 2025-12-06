package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Port                string
	DBUrl               string
	JWTSecret           string
	CloudinaryCloudName string
	CloudinaryAPIKey    string
	CloudinaryAPISecret string
	EmailAPIKey         string
	EmailFromAddress    string
}

func LoadConfig() *Config {
	err := godotenv.Load()
	if err != nil {
		log.Println("No .env file found, relying on environment variables")
	}

	return &Config{
		Port:                getEnv("PORT", "8080"),
		DBUrl:               getEnv("DATABASE_URL", ""),
		JWTSecret:           getEnv("JWT_SECRET", "secret"),
		CloudinaryCloudName: getEnv("CLOUDINARY_CLOUD_NAME", ""),
		CloudinaryAPIKey:    getEnv("CLOUDINARY_API_KEY", ""),
		CloudinaryAPISecret: getEnv("CLOUDINARY_API_SECRET", ""),
		EmailAPIKey:         getEnv("EMAIL_API_KEY", ""),
		EmailFromAddress:    getEnv("EMAIL_FROM_ADDRESS", "orders@preptoplate.com"),
	}
}

func getEnv(key, fallback string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return fallback
}
