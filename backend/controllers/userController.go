package controllers

import (
	"net/http"
	"os"
	"strings"
	"time"

	"backend/config"
	"backend/models"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

const authCookieName = "token"

func setAuthCookie(c *gin.Context, token string, maxAge int) {
	secure := strings.EqualFold(os.Getenv("COOKIE_SECURE"), "true")

	switch strings.ToLower(strings.TrimSpace(os.Getenv("COOKIE_SAME_SITE"))) {
	case "none":
		c.SetSameSite(http.SameSiteNoneMode)
	case "strict":
		c.SetSameSite(http.SameSiteStrictMode)
	default:
		c.SetSameSite(http.SameSiteLaxMode)
	}

	// Keep Domain empty so the cookie is scoped to the API host.
	c.SetCookie(authCookieName, token, maxAge, "/", "", secure, true)
}

func parseAuthToken(raw string) (*jwt.Token, error) {
	return jwt.Parse(raw, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, jwt.ErrTokenSignatureInvalid
		}
		return config.GetJWTSecret(), nil
	}, jwt.WithIssuer("Tell-news"))
}

// Signup creates a new account.
func Signup(c *gin.Context) {
	var input struct {
		Username string `json:"username" binding:"required"`
		Email    string `json:"email" binding:"required,email"`
		Password string `json:"password" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Username, valid email, and password are required"})
		return
	}

	input.Username = strings.TrimSpace(input.Username)
	input.Email = strings.ToLower(strings.TrimSpace(input.Email))
	if input.Username == "" || input.Password == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Username and password cannot be empty"})
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to secure password"})
		return
	}

	user := models.User{
		Username: input.Username,
		Email:    input.Email,
		Password: string(hashedPassword),
		Role:     "user",
	}

	if err := config.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Username or email already exists"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Registration successful"})
}

// Login verifies credentials and issues an HTTP-only JWT cookie.
func Login(c *gin.Context) {
	var input struct {
		Email    string `json:"email" binding:"required,email"`
		Password string `json:"password" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Valid email and password are required"})
		return
	}

	input.Email = strings.ToLower(strings.TrimSpace(input.Email))

	var user models.User
	if err := config.DB.Where("email = ?", input.Email).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	now := time.Now()
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub":  user.ID,
		"role": user.Role,
		"iat":  now.Unix(),
		"exp":  now.Add(24 * time.Hour).Unix(),
		"iss":  "Tell-news",
	})

	tokenString, err := token.SignedString(config.GetJWTSecret())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create authentication token"})
		return
	}

	setAuthCookie(c, tokenString, 24*60*60)

	c.JSON(http.StatusOK, gin.H{
		"message":  "Login successful",
		"role":     user.Role,
		"username": user.Username,
	})
}

// ValidateAuth reports the current browser authentication state.
func ValidateAuth(c *gin.Context) {
	rawCookie, err := c.Cookie(authCookieName)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"authenticated": false, "role": "guest"})
		return
	}

	token, err := parseAuthToken(rawCookie)
	if err != nil || token == nil || !token.Valid {
		c.JSON(http.StatusUnauthorized, gin.H{"authenticated": false, "role": "guest"})
		return
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"authenticated": false, "role": "guest"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"authenticated": true,
		"role":          claims["role"],
		"userId":        claims["sub"],
	})
}

// Logout expires the authentication cookie.
func Logout(c *gin.Context) {
	setAuthCookie(c, "", -1)
	c.JSON(http.StatusOK, gin.H{"message": "Logged out successfully"})
}
