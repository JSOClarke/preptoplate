package service

import (
	"context"
	"errors"
	"os"

	"github.com/cloudinary/cloudinary-go/v2"
	"github.com/cloudinary/cloudinary-go/v2/api"
	"github.com/cloudinary/cloudinary-go/v2/api/uploader"
)

type ImageService interface {
	UploadImage(ctx context.Context, file interface{}, filename string) (string, error)
}

type imageService struct {
	cld *cloudinary.Cloudinary
}

func NewImageService() (ImageService, error) {
	cloudName := os.Getenv("CLOUDINARY_CLOUD_NAME")
	apiKey := os.Getenv("CLOUDINARY_API_KEY")
	apiSecret := os.Getenv("CLOUDINARY_API_SECRET")

	if cloudName == "" || apiKey == "" || apiSecret == "" {
		// Return service with nil client, will error on upload attempt
		return &imageService{cld: nil}, nil
	}

	cld, err := cloudinary.NewFromParams(cloudName, apiKey, apiSecret)
	if err != nil {
		return nil, err
	}

	return &imageService{
		cld: cld,
	}, nil
}

func (s *imageService) UploadImage(ctx context.Context, file interface{}, filename string) (string, error) {
	if s.cld == nil {
		return "", errors.New("cloudinary credentials not configured")
	}

	resp, err := s.cld.Upload.Upload(ctx, file, uploader.UploadParams{
		PublicID:       filename,
		Folder:         "preptoplate/meals",
		Overwrite:      api.Bool(true),
		Transformation: "c_limit,w_1000", // Resize to max width 1000px
	})
	if err != nil {
		return "", err
	}

	return resp.SecureURL, nil
}
