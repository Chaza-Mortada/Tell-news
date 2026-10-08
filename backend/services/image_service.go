package services

import (
	//"fmt"
	"image"
	"mime/multipart"
	"os"
	"path/filepath"

	"github.com/disintegration/imaging"
	"github.com/google/uuid"
)

func ProcessAndSaveImage(file multipart.File, header *multipart.FileHeader) (string, error) {

	// 🧠 decode image
	img, _, err := image.Decode(file)
	if err != nil {
		return "", err
	}

	// 🎯 ensure uploads folder exists
	if _, err := os.Stat("uploads"); os.IsNotExist(err) {
		os.Mkdir("uploads", os.ModePerm)
	}

	// 🔥 UUID filename
	filename := uuid.New().String() + ".jpg"
	path := filepath.Join("uploads", filename)

	// ✂️ resize + crop to 16:9
	img = imaging.Fill(img, 1200, 675, imaging.Center, imaging.Lanczos)

	// 💾 compress + save
	err = imaging.Save(img, path, imaging.JPEGQuality(80))
	if err != nil {
		return "", err
	}

	// 🌐 return URL
	return "/uploads/" + filename, nil
}