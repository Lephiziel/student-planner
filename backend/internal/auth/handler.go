package auth

import (
	"net/http"

	"github.com/Lephiziel/student-planner/internal/user"
	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	userService user.UserService
}

func NewAuthHandler(userService user.UserService) *AuthHandler {
	return &AuthHandler{
		userService: userService,
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

func (ah *AuthHandler) RegisterRoutes(rg *gin.RouterGroup) {
	users := rg.Group("/auth")
	{
		users.POST("/register", ah.Register)
	}
}
