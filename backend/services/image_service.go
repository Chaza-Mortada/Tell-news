package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"image"
	"image/jpeg"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"time"

	"github.com/disintegration/imaging"
	"github.com/google/uuid"
)

const imageKitUploadURL = "https://upload.imagekit.io/api/v1/files/upload"

type imageKitResponse struct {
	URL string `json:"url"`
}

func ProcessAndSaveImage(file multipart.File, header *multipart.FileHeader) (string, error) {

	privateKey := os.Getenv("IMAGEKIT_PRIVATE_KEY")
	if privateKey == "" {
		return "", fmt.Errorf("IMAGEKIT_PRIVATE_KEY is not configured")
	}

	// Decode uploaded image
	img, _, err := image.Decode(file)
	if err != nil {
		return "", fmt.Errorf("image decode failed: %w", err)
	}

	// Resize and crop to 16:9
	img = imaging.Fill(img, 1200, 675, imaging.Center, imaging.Lanczos)

	// Encode as JPEG in memory
	var imageBuffer bytes.Buffer

	err = jpeg.Encode(&imageBuffer, img, &jpeg.Options{
		Quality: 80,
	})
	if err != nil {
		return "", fmt.Errorf("image encoding failed: %w", err)
	}

	// Generate unique filename
	filename := uuid.New().String() + ".jpg"

	// Prepare multipart upload
	var body bytes.Buffer
	writer := multipart.NewWriter(&body)

	part, err := writer.CreateFormFile("file", filename)
	if err != nil {
		return "", err
	}

	if _, err := part.Write(imageBuffer.Bytes()); err != nil {
		return "", err
	}

	if err := writer.WriteField("fileName", filename); err != nil {
		return "", err
	}

	if err := writer.WriteField("folder", "/tell-news"); err != nil {
		return "", err
	}

	if err := writer.Close(); err != nil {
		return "", err
	}

	// Create HTTP request
	req, err := http.NewRequest(
		http.MethodPost,
		imageKitUploadURL,
		&body,
	)
	if err != nil {
		return "", err
	}

	req.Header.Set("Content-Type", writer.FormDataContentType())
	req.SetBasicAuth(privateKey, "")

	// Send upload request
	client := &http.Client{
		Timeout: 60 * time.Second,
	}

	resp, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("ImageKit upload failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		responseBody, _ := io.ReadAll(resp.Body)

		return "", fmt.Errorf(
			"ImageKit returned status %d: %s",
			resp.StatusCode,
			string(responseBody),
		)
	}

	// Read response
	var result imageKitResponse

	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return "", fmt.Errorf("invalid ImageKit response: %w", err)
	}

	if result.URL == "" {
		return "", fmt.Errorf("ImageKit returned an empty image URL")
	}

	return result.URL, nil
}
