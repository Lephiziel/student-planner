package subject

import (
	"net/http"
	"strconv"

	"github.com/Lephiziel/student-planner/internal/middleware"
	"github.com/gin-gonic/gin"
)

type SubjectHandler struct {
	subjectService SubjectService
	secret         string
}

type SubjectRequest struct {
	Name  string `json:"name" binding:"required,min=2"`
	Color string `json:"color" binding:"omitempty"`
}

func NewSubjectHandler(subjectService SubjectService, secret string) *SubjectHandler {
	return &SubjectHandler{
		subjectService: subjectService,
		secret:         secret,
	}
}

func (sh *SubjectHandler) GetAll(c *gin.Context) {
	raw, ok := c.Get("userID")
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}
	userID := raw.(uint)

	result, err := sh.subjectService.GetAll(userID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": result})
}

func (sh *SubjectHandler) Create(c *gin.Context) {
	var reqBody SubjectRequest
	if err := c.ShouldBindJSON(&reqBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	raw, ok := c.Get("userID")
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}
	userID := raw.(uint)

	result, err := sh.subjectService.Create(userID, reqBody.Name, reqBody.Color)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"success": result})
}

func (sh *SubjectHandler) Update(c *gin.Context) {
	var reqBody SubjectRequest

	idParam := c.Param("id")

	parsedID, convErr := strconv.ParseUint(idParam, 0, 64)

	raw, ok := c.Get("userID")

	if convErr != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": convErr.Error()})
		return
	}

	id := uint(parsedID)

	if err := c.ShouldBindJSON(&reqBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	userID := raw.(uint)

	result, err := sh.subjectService.Update(id, userID, reqBody.Name, reqBody.Color)
	if err != nil {
		if err.Error() == "subject not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": result})
}

func (sh *SubjectHandler) Delete(c *gin.Context) {
	idParam := c.Param("id")

	parsedID, convErr := strconv.ParseUint(idParam, 0, 64)

	raw, ok := c.Get("userID")

	if convErr != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": convErr.Error()})
		return
	}

	id := uint(parsedID)

	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	userID := raw.(uint)

	err := sh.subjectService.Delete(id, userID)

	if err != nil {
		if err.Error() == "subject not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "deleted"})
}

func (sh *SubjectHandler) GetStats(c *gin.Context) {
	raw, ok := c.Get("userID")
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	userID := raw.(uint)

	result, err := sh.subjectService.GetStats(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": result})
}

func (sh *SubjectHandler) RegisterRoutes(rg *gin.RouterGroup) {
	subjects := rg.Group("/subjects")
	subjects.Use(middleware.AuthMiddleware(sh.secret))
	{
		subjects.GET("/", sh.GetAll)
		subjects.GET("/stats", sh.GetStats)
		subjects.POST("/", sh.Create)
		subjects.PUT("/:id", sh.Update)
		subjects.DELETE("/:id", sh.Delete)
	}
}
