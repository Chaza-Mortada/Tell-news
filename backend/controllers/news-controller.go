package controllers

import (
	"backend/config"
	"backend/models"
	"backend/services"
	"fmt"
	"net/http"
	"os"
	"strings"
	"regexp"

	"github.com/google/uuid"
	"github.com/gin-gonic/gin"
)


// =====================
// SLUG CLEANER
// =====================
func cleanSlug(input string) string {
	s := strings.ToLower(input)

	reg := regexp.MustCompile(`[^a-z0-9\s-]`)
	s = reg.ReplaceAllString(s, "")

	regSpace := regexp.MustCompile(`\s+`)
	s = regSpace.ReplaceAllString(s, " ")

	s = strings.TrimSpace(s)
	s = strings.ReplaceAll(s, " ", "-")
	return s
}


// =====================
// CREATE ARTICLE
// =====================
func CreateArticle(c *gin.Context) {

	title := c.PostForm("title")
	description := c.PostForm("description")
	fullDesc := c.PostForm("full_description")

	title_ar := c.PostForm("title_ar")
	description_ar := c.PostForm("description_ar")
	full_description_ar := c.PostForm("full_description_ar")

	title_fr := c.PostForm("title_fr")
	description_fr := c.PostForm("description_fr")
	full_description_fr := c.PostForm("full_description_fr")

	category := c.PostForm("category")
	videoURL := c.PostForm("video_url")
	isBreaking := c.PostForm("is_breaking") == "true"

	if strings.ToLower(category) == "ads" {
		category = "Ads"
	}

	// slug
	baseSlug := cleanSlug(title)
	finalSlug := fmt.Sprintf("%s-%s", baseSlug, uuid.New().String()[:8])

	// ensure uploads folder exists
	if _, err := os.Stat("uploads"); os.IsNotExist(err) {
		os.Mkdir("uploads", os.ModePerm)
	}

	// =====================
	// IMAGE UPLOAD (PRODUCTION)
	// =====================
	form, err := c.MultipartForm()
	if err != nil {
		c.JSON(400, gin.H{"error": "invalid form"})
		return
	}

	files := form.File["media_files"]
	var savedPaths []string

	for _, fileHeader := range files {

		file, err := fileHeader.Open()
		if err != nil {
			continue
		}

		path, err := services.ProcessAndSaveImage(file, fileHeader)
		file.Close()

		if err == nil {
			savedPaths = append(savedPaths, path)
		}
	}

	// =====================
	// SAVE ARTICLE
	// =====================
	newArticle := models.Article{
		Title:             title,
		TitleAr:           title_ar,
		TitleFr:           title_fr,
		Slug:              finalSlug,
		Description:       description,
		DescriptionAr:     description_ar,
		DescriptionFr:     description_fr,
		FullDescription:   fullDesc,
		FullDescriptionAr: full_description_ar,
		FullDescriptionFr: full_description_fr,
		Category:          category,
		VideoURL:          videoURL,
		LinkURL:           c.PostForm("link_url"),
		IsBreaking:        isBreaking,
		ImageURL:          strings.Join(savedPaths, ","),
	}

	if err := config.DB.Create(&newArticle).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, newArticle)
}


// =====================
// GET ARTICLES
// =====================
func GetArticles(c *gin.Context) {
	var articles []models.Article
	config.DB.Limit(10).Order("created_at desc").Find(&articles)
	c.JSON(http.StatusOK, articles)
}


// =====================
// GET ARTICLE BY SLUG
// =====================
func GetArticleBySlug(c *gin.Context) {
	slug := c.Param("slug")
	var article models.Article

	if err := config.DB.Where("slug = ?", strings.ToLower(slug)).First(&article).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Article not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": article})
}


// =====================
// UPDATE ARTICLE
// =====================
func UpdateArticle(c *gin.Context) {

	slug := c.Param("slug")
	var article models.Article

	if err := config.DB.Where("slug = ?", slug).First(&article).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Article not found"})
		return
	}

	// update fields
	article.TitleAr = c.PostForm("title_ar")
	article.DescriptionAr = c.PostForm("description_ar")
	article.FullDescriptionAr = c.PostForm("full_description_ar")

	article.TitleFr = c.PostForm("title_fr")
	article.DescriptionFr = c.PostForm("description_fr")
	article.FullDescriptionFr = c.PostForm("full_description_fr")

	article.Category = c.PostForm("category")
	article.VideoURL = c.PostForm("video_url")
	article.LinkURL = c.PostForm("link_url")
	article.IsBreaking = c.PostForm("is_breaking") == "true"

	// =====================
	// NEW IMAGES (OPTIONAL)
	// =====================
	form, err := c.MultipartForm()
	if err == nil {

		files := form.File["media_files"]

		if len(files) > 0 {

			var newPaths []string

			for _, fileHeader := range files {

				file, err := fileHeader.Open()
				if err != nil {
					continue
				}

				path, err := services.ProcessAndSaveImage(file, fileHeader)
				file.Close()

				if err == nil {
					newPaths = append(newPaths, path)
				}
			}

			article.ImageURL = strings.Join(newPaths, ",")
		}
	}

	config.DB.Save(&article)

	c.JSON(http.StatusOK, gin.H{
		"message": "Updated successfully",
		"data":    article,
	})
}


// =====================
// DELETE ARTICLE
// =====================
func DeleteArticle(c *gin.Context) {

	slug := c.Param("slug")

	result := config.DB.Where("slug = ?", slug).Delete(&models.Article{})

	if result.RowsAffected == 0 {
		c.JSON(404, gin.H{"error": "Not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Article moved to trash"})
}


// =====================
// GET AD DETAIL
// =====================
func GetAdDetail(c *gin.Context) {

	id := c.Param("id")
	var ad models.Article

	if err := config.DB.Where("id = ? AND category = ?", id, "Ads").First(&ad).Error; err != nil {
		c.JSON(404, gin.H{"error": "Advertisement not found"})
		return
	}

	c.JSON(200, ad)
}