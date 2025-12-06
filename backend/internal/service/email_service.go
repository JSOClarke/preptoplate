package service

import (
	"fmt"
	"log"

	"github.com/jopari/preptoplate/internal/config"
	"github.com/jopari/preptoplate/internal/models"
	"github.com/resend/resend-go/v2"
)

type EmailService interface {
	SendOrderReceipt(to string, order *models.Order) error
}

type resendEmailService struct {
	client      *resend.Client
	fromAddress string
}

func NewEmailService(cfg *config.Config) EmailService {
	if cfg.EmailAPIKey == "" {
		log.Println("⚠️ Email API Key not configured. Email service will be disabled.")
		return &noopEmailService{}
	}

	client := resend.NewClient(cfg.EmailAPIKey)
	return &resendEmailService{
		client:      client,
		fromAddress: cfg.EmailFromAddress,
	}
}

func (s *resendEmailService) SendOrderReceipt(to string, order *models.Order) error {
	htmlContent := generateOrderReceiptHTML(order)

	params := &resend.SendEmailRequest{
		From:    s.fromAddress,
		To:      []string{to},
		Subject: fmt.Sprintf("Order Receipt #%d - PrepToPlate", order.ID),
		Html:    htmlContent,
	}

	_, err := s.client.Emails.Send(params)
	if err != nil {
		log.Printf("❌ Failed to send email to %s: %v", to, err)
		return err
	}

	log.Printf("✅ Order receipt sent to %s", to)
	return nil
}

// noopEmailService is used when email is not configured
type noopEmailService struct{}

func (s *noopEmailService) SendOrderReceipt(to string, order *models.Order) error {
	log.Printf("📧 [Mock] Sending order receipt to %s (Email service not configured)", to)
	return nil
}

func generateOrderReceiptHTML(order *models.Order) string {
	// Basic HTML receipt
	// In a real app, this would use a template engine
	itemsHTML := ""
	for _, item := range order.Items {
		itemsHTML += fmt.Sprintf("<li>%s x%d - $%.2f</li>", item.Meal.Name, item.Quantity, float64(item.Meal.Price)/100)
	}

	return fmt.Sprintf(`
		<h1>Thank you for your order!</h1>
		<p>Order ID: #%d</p>
		<p>Total: $%.2f</p>
		<h3>Items:</h3>
		<ul>
			%s
		</ul>
		<p>We will notify you when your meals are on the way!</p>
	`, order.ID, float64(order.TotalPrice)/100, itemsHTML)
}
