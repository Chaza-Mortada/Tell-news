package models

import (
	
	"gorm.io/gorm"
	"time"
)

type Article struct {
    ID               uint   `gorm:"primaryKey"`
    //Title            string `json:"title"`
    // English (Default)
    Title           string `json:"title" gorm:"index"`
    Description     string `json:"description"`
    FullDescription string `json:"full_description"`

    // Arabic
    TitleAr           string `json:"title_ar" gorm:"index"`
    DescriptionAr     string `json:"description_ar"`
    FullDescriptionAr string `json:"full_description_ar"`

    // French
    TitleFr           string `json:"title_fr" gorm:"index"`
    DescriptionFr     string `json:"description_fr"`
    FullDescriptionFr string `json:"full_description_fr"`
    Slug             string `json:"slug" gorm:"uniqueIndex;not null"`
    Category         string `json:"category" gorm:"index"`
    //Description      string `json:"description"`
    //FullDescription  string `json:"full_description"` 
    ImageURL string `json:"image_url"` 
	//ThumbURL string `json:"thumb_url"`
    VideoURL         string `json:"video_url"`
    LinkURL         string `json:"link_url"`
    MediaType        string `json:"media_type"` 
    IsBreaking       bool   `json:"is_breaking"`
    CreatedAt        time.Time `gorm:"index"`
    
}

type Advertisement struct {
    gorm.Model
    Title         string `json:"title" gorm:"index"`
    Slug          string `json:"slug" gorm:"uniqueIndex;not null"`
    Description   string `json:"description"`
    TitleAr       string `json:"title_ar" gorm:"index"`
    DescriptionAr string `json:"description_ar"`
    TitleFr       string `json:"title_fr" gorm:"index"`
    DescriptionFr string `json:"description_fr"`
    ImageURL      string `json:"image_url"`
    LinkURL       string `json:"link_url"`
    Active        bool   `json:"active" gorm:"default:true"`
}