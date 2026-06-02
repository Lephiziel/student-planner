package auth

import (
	"errors"
	"net/http"

	"github.com/Lephiziel/student-planner/internal/middleware"
	"github.com/Lephiziel/student-planner/internal/user"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

type AuthHandler struct {
	userService user.UserService
	secret      string
}

func NewAuthHandler(userService user.UserService, secret string) *AuthHandler {
	return &AuthHandler{
		userService: userService,
		secret:      secret,
	}
}

type RegisterRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=8"`
	Name     string `json:"name" binding:"required,min=2"`
}

type RegisterResponse struct {
	ID    uint   `json:"id"`
	Email string `json:"email"`
	Name  string `json:"name"`
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=8"`
}

type LoginResponse struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
}

type RefreshRequest struct {
	RefreshToken string `json:"refresh_token" binding:"required"`
}

func (ah *AuthHandler) Register(c *gin.Context) {
	var reqBody RegisterRequest
	if err := c.ShouldBindJSON(&reqBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	result, err := ah.userService.Register(reqBody.Name, reqBody.Email, reqBody.Password)

	if err != nil {
		if err.Error() == "email already taken" {
			c.JSON(http.StatusConflict, gin.H{"error": "email already taken"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	registeredUser := RegisterResponse{
		ID:    result.ID,
		Email: result.Email,
		Name:  result.Name,
	}

	c.JSON(http.StatusCreated, gin.H{"success": registeredUser})
}

func (ah *AuthHandler) Login(c *gin.Context) {
	var reqBody LoginRequest
	if err := c.ShouldBindJSON(&reqBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, err := ah.userService.Login(reqBody.Email, reqBody.Password)
	if err != nil {
		if err.Error() == "invalid credentials" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	accessToken, accessErr := GenerateAccessToken(user.ID, ah.secret)
	refreshToken, refreshErr := GenerateRefreshToken(user.ID, ah.secret)

	if accessErr != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": accessErr.Error()})
		return
	}

	if refreshErr != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": refreshErr.Error()})
		return
	}

	loggedUser := LoginResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
	}

	c.JSON(http.StatusOK, gin.H{"success": loggedUser})
}

func (ah *AuthHandler) Refresh(c *gin.Context) {
	var reqBody RefreshRequest
	if err := c.ShouldBindJSON(&reqBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	token, err := jwt.ParseWithClaims(reqBody.RefreshToken, &middleware.Claims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return []byte(ah.secret), nil
	})

	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid token"})
		return
	}

	if !token.Valid {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid token"})
		return
	}

	claims, ok := token.Claims.(*middleware.Claims)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Something bad with token"})
		return
	}

	newAccessToken, err := GenerateAccessToken(claims.UserID, ah.secret)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"access_token": newAccessToken})
}

func (ah *AuthHandler) RegisterRoutes(rg *gin.RouterGroup) {
	users := rg.Group("/auth")
	{
		users.POST("/register", ah.Register)
		users.POST("/login", ah.Login)
		users.POST("/refresh", ah.Refresh)
	}
}
