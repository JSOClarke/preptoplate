package config

import (
	"os"
	"testing"
)

func TestLoadConfig(t *testing.T) {
	// Set up test environment variables
	os.Setenv("PORT", "8080")
	os.Setenv("DATABASE_URL", "test-db-url")
	os.Setenv("JWT_SECRET", "test-secret")

	cfg := LoadConfig()

	if cfg.Port != "8080" {
		t.Errorf("Expected Port to be '8080', got '%s'", cfg.Port)
	}

	if cfg.DBUrl != "test-db-url" {
		t.Errorf("Expected DBUrl to be 'test-db-url', got '%s'", cfg.DBUrl)
	}

	if cfg.JWTSecret != "test-secret" {
		t.Errorf("Expected JWTSecret to be 'test-secret', got '%s'", cfg.JWTSecret)
	}

	// Clean up
	os.Unsetenv("PORT")
	os.Unsetenv("DATABASE_URL")
	os.Unsetenv("JWT_SECRET")
}

func TestGetEnv(t *testing.T) {
	// Test with existing env var
	os.Setenv("TEST_VAR", "test-value")
	result := getEnv("TEST_VAR", "fallback")
	if result != "test-value" {
		t.Errorf("Expected 'test-value', got '%s'", result)
	}
	os.Unsetenv("TEST_VAR")

	// Test with fallback
	result = getEnv("NON_EXISTENT_VAR", "fallback")
	if result != "fallback" {
		t.Errorf("Expected 'fallback', got '%s'", result)
	}
}
