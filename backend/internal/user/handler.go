package user

import (
	"net/http"

	"github.com/Lephiziel/student-planner/internal/middleware"
	"github.com/gin-gonic/gin"
)

type UserHandler struct {
	userService UserService
	secret      string
}

type UserResponse struct {
	ID    uint   `json:"id"`
	Email string `json:"email"`
	Name  string `json:"name"`
}

func NewUserHandler(userService UserService, secret string) *UserHandler {
	return &UserHandler{
		userService: userService,
		secret:      secret,
	}
}

func (us *UserHandler) Me(c *gin.Context) {
	raw, ok := c.Get("userID")
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Not exists"})
		return
	}
	userID := raw.(uint)

	user, err := us.userService.GetByID(userID)

	if err != nil {
		if err.Error() == "User not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	response := UserResponse{
		ID:    user.ID,
		Email: user.Email,
		Name:  user.Name,
	}

	c.JSON(http.StatusOK, gin.H{"success": response})
}

func (us *UserHandler) RegisterRoutes(rg *gin.RouterGroup) {
	users := rg.Group("/users")
	users.Use(middleware.AuthMiddleware(us.secret))
	{
		users.GET("/me", us.Me)
	}
}
