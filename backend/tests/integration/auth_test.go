package integration

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/jopari/preptoplate/internal/models"
)

func TestRegisterUser(t *testing.T) {
	r, db := setupTestEnv()
	defer db.Close()

	// Ensure cleanup of test data
	defer func() {
		_, err := db.Exec(context.Background(), "DELETE FROM users WHERE email LIKE 'test_%'")
		if err != nil {
			t.Logf("Failed to cleanup test users: %v", err)
		}
	}()

	tests := []struct {
		name       string
		payload    map[string]interface{}
		wantStatus int
		validate   func(t *testing.T, body *bytes.Buffer)
	}{
		{
			name: "Successful Registration",
			payload: map[string]interface{}{
				"email":    "test_user@example.com",
				"password": "password123",
			},
			wantStatus: http.StatusCreated,
			validate: func(t *testing.T, body *bytes.Buffer) {
				var res models.AuthResponse
				if err := json.Unmarshal(body.Bytes(), &res); err != nil {
					t.Fatalf("Failed to unmarshal response: %v", err)
				}

				if res.Token == "" {
					t.Error("Expected JWT token to be present, got empty string")
				}

				if res.User.Email != "test_user@example.com" {
					t.Errorf("Expected user email 'test_user@example.com', got '%s'", res.User.Email)
				}

				if res.User.ID == 0 {
					t.Error("Expected user ID to be set, got 0")
				}

				if res.User.PasswordHash != "" {
					t.Error("Expected password hash to be omitted from response")
				}
			},
		},
		{
			name: "Duplicate Email",
			payload: map[string]interface{}{
				"email":    "test_user@example.com",
				"password": "password123",
			},
			wantStatus: http.StatusBadRequest,
			validate: func(t *testing.T, body *bytes.Buffer) {
				if !bytes.Contains(body.Bytes(), []byte("email already in use")) {
					t.Errorf("Expected body to contain 'email already in use', got %q", body.String())
				}
			},
		},
		{
			name: "Invalid Payload - Missing Password",
			payload: map[string]interface{}{
				"email": "test_missing_pass@example.com",
			},
			wantStatus: http.StatusBadRequest,
			validate:   nil, // No specific body check needed for now, or could check validation error
		},
		{
			name:       "Invalid JSON",
			payload:    nil, // Special handling in loop
			wantStatus: http.StatusBadRequest,
			validate:   nil,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			var body []byte
			var err error

			if tt.name == "Invalid JSON" {
				body = []byte(`{invalid-json`)
			} else {
				body, err = json.Marshal(tt.payload)
				if err != nil {
					t.Fatalf("Failed to marshal payload: %v", err)
				}
			}

			req, _ := http.NewRequest("POST", "/api/auth/register", bytes.NewBuffer(body))
			req.Header.Set("Content-Type", "application/json")

			w := httptest.NewRecorder()
			r.ServeHTTP(w, req)

			if w.Code != tt.wantStatus {
				t.Errorf("Expected status %d, got %d. Body: %s", tt.wantStatus, w.Code, w.Body.String())
			}

			if tt.validate != nil {
				tt.validate(t, w.Body)
			}
		})
	}
}

func TestLoginUser(t *testing.T) {
	r, db := setupTestEnv()
	defer db.Close()

	// Setup: Create a test user for login tests
	testEmail := "test_login_user@example.com"
	testPassword := "password123"

	// Register the user first
	registerPayload, _ := json.Marshal(map[string]interface{}{
		"email":    testEmail,
		"password": testPassword,
	})
	registerReq, _ := http.NewRequest("POST", "/api/auth/register", bytes.NewBuffer(registerPayload))
	registerReq.Header.Set("Content-Type", "application/json")
	registerW := httptest.NewRecorder()
	r.ServeHTTP(registerW, registerReq)

	if registerW.Code != http.StatusCreated {
		t.Fatalf("Failed to setup test user. Status: %d, Body: %s", registerW.Code, registerW.Body.String())
	}

	// Cleanup
	defer func() {
		_, err := db.Exec(context.Background(), "DELETE FROM users WHERE email = $1", testEmail)
		if err != nil {
			t.Logf("Failed to cleanup test user: %v", err)
		}
	}()

	tests := []struct {
		name       string
		payload    map[string]interface{}
		wantStatus int
		validate   func(t *testing.T, body *bytes.Buffer)
	}{
		{
			name: "Successful Login",
			payload: map[string]interface{}{
				"email":    testEmail,
				"password": testPassword,
			},
			wantStatus: http.StatusOK,
			validate: func(t *testing.T, body *bytes.Buffer) {
				var res models.AuthResponse
				if err := json.Unmarshal(body.Bytes(), &res); err != nil {
					t.Fatalf("Failed to unmarshal response: %v", err)
				}

				if res.Token == "" {
					t.Error("Expected JWT token to be present, got empty string")
				}

				if res.User.Email != testEmail {
					t.Errorf("Expected user email '%s', got '%s'", testEmail, res.User.Email)
				}

				if res.User.ID == 0 {
					t.Error("Expected user ID to be set, got 0")
				}

				if res.User.PasswordHash != "" {
					t.Error("Expected password hash to be omitted from response")
				}

				if res.User.Role != "user" {
					t.Errorf("Expected user role 'user', got '%s'", res.User.Role)
				}
			},
		},
		{
			name: "Invalid Password",
			payload: map[string]interface{}{
				"email":    testEmail,
				"password": "wrongpassword",
			},
			wantStatus: http.StatusUnauthorized,
			validate: func(t *testing.T, body *bytes.Buffer) {
				if !bytes.Contains(body.Bytes(), []byte("error")) {
					t.Errorf("Expected body to contain 'error', got %q", body.String())
				}
			},
		},
		{
			name: "Non-existent User",
			payload: map[string]interface{}{
				"email":    "nonexistent@example.com",
				"password": "password123",
			},
			wantStatus: http.StatusUnauthorized,
			validate: func(t *testing.T, body *bytes.Buffer) {
				if !bytes.Contains(body.Bytes(), []byte("error")) {
					t.Errorf("Expected body to contain 'error', got %q", body.String())
				}
			},
		},
		{
			name: "Missing Email",
			payload: map[string]interface{}{
				"password": "password123",
			},
			wantStatus: http.StatusBadRequest,
			validate:   nil,
		},
		{
			name: "Missing Password",
			payload: map[string]interface{}{
				"email": testEmail,
			},
			wantStatus: http.StatusBadRequest,
			validate:   nil,
		},
		{
			name:       "Invalid JSON",
			payload:    nil, // Special handling
			wantStatus: http.StatusBadRequest,
			validate:   nil,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			var body []byte
			var err error

			if tt.name == "Invalid JSON" {
				body = []byte(`{invalid-json`)
			} else {
				body, err = json.Marshal(tt.payload)
				if err != nil {
					t.Fatalf("Failed to marshal payload: %v", err)
				}
			}

			req, _ := http.NewRequest("POST", "/api/auth/login", bytes.NewBuffer(body))
			req.Header.Set("Content-Type", "application/json")

			w := httptest.NewRecorder()
			r.ServeHTTP(w, req)

			if w.Code != tt.wantStatus {
				t.Errorf("Expected status %d, got %d. Body: %s", tt.wantStatus, w.Code, w.Body.String())
			}

			if tt.validate != nil {
				tt.validate(t, w.Body)
			}
		})
	}
}
