package controllers

import (
	"net/http"
	"time"
	"backend/config"
	"backend/models"   
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
	"github.com/gin-gonic/gin"
)

// Secret key for JWT (Keep this safe!)
var jwtSecret = []byte("JWT_SECRET")

// --- SIGNUP ---
func Signup(c *gin.Context) {
	var input struct {
		Username string `json:"username" binding:"required"`
		Email    string `json:"email" binding:"required"`
		Password string `json:"password" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 1. Hash the password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	// 2. Create the user object (Role defaults to 'user' because of GORM tag)
	user := models.User{
		Username: input.Username,
		Email:    input.Email,
		Password: string(hashedPassword),
	}

	// 3. Save to database
	if err := config.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "User already exists or database error"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Registration successful"})
}

func Login(c *gin.Context) {
	var input struct {
		Email    string `json:"email" binding:"required"`
		Password string `json:"password" binding:"required"`
	}

	// 1. Bind JSON input
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user models.User
	if err := config.DB.Where("email = ?", input.Email).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}
	err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.Password))
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	// 4. Generate JWT Token
	secret := config.GetJWTSecret()
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub":  user.ID,
		"role": user.Role,
		"iat":  time.Now().Unix(),
		"exp":  time.Now().Add(time.Hour * 24).Unix(), // Expires in 24h
		"iss":  "Tell-news",
	})

	// 5. Sign the token using the secret from your .env via config
	tokenString, err := token.SignedString(secret)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create token"})
		return
	}

	// 6. Set the HTTP-Only Cookie
	c.SetCookie(
		"token",          // Cookie Name
		tokenString,      // JWT Value
		3600*24,          // MaxAge in seconds (1 day)
		"/",              // Path
		"localhost",      // Domain
		false,            // Secure: Set to true only if using HTTPS
		true,             // HttpOnly: CRITICAL for security
	)

	// 7. Return non-sensitive info to the frontend
	c.JSON(http.StatusOK, gin.H{
		"message":  "Login successful",
		"role":     user.Role,
		"username": user.Username,
	})
}

func ValidateAuth(c *gin.Context) {
    // 1. Get cookie
    cookie, err := c.Cookie("token")
    if err != nil {
        c.JSON(http.StatusUnauthorized, gin.H{"role": "guest", "authenticated": false})
        return
    }

    // 2. Parse JWT
    token, _ := jwt.Parse(cookie, func(token *jwt.Token) (interface{}, error) {
        return config.GetJWTSecret(), nil
    })

    if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
        c.JSON(http.StatusOK, gin.H{
            "authenticated": true,
            "role":          claims["role"],
            "userId":        claims["sub"],
        })
    } else {
        c.JSON(http.StatusUnauthorized, gin.H{"authenticated": false})
    }
}

func Logout(c *gin.Context) {
    // Overwrite the cookie with an expired date
    c.SetCookie(
        "token",
        "",
        -1, // -1 MaxAge tells the browser to delete it immediately
        "/",
        "localhost",
        false, // Secure (match your login settings)
        true,  // HttpOnly
    )
    c.JSON(http.StatusOK, gin.H{"message": "Logged out successfully"})
}