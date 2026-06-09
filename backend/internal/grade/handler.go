package grade

import (
	"net/http"
	"strconv"

	"github.com/Lephiziel/student-planner/internal/middleware"
	"github.com/gin-gonic/gin"
)

type GradeHandler struct {
	gradeService GradeService
	secret       string
}

func NewGradeHandler(gradeService GradeService, secret string) *GradeHandler {
	return &GradeHandler{
		gradeService: gradeService,
		secret:       secret,
	}
}

type GradeRequest struct {
	TaskID   uint    `json:"task_id" binding:"required"`
	Score    float64 `json:"score" binding:"required,min=1,max=5"`
	Feedback string  `json:"feedback" binding:"omitempty"`
}

func (gh *GradeHandler) GetByTaskID(c *gin.Context) {
	taskIDParam := c.Query("task_id")

	parsedID, convErr := strconv.ParseUint(taskIDParam, 0, 0)
	if convErr != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": convErr.Error()})
		return
	}

	taskID := uint(parsedID)

	raw, ok := c.Get("userID")
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	userID := raw.(uint)

	result, err := gh.gradeService.GetByTaskID(taskID, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": result})
}

func (gh *GradeHandler) Create(c *gin.Context) {
	var reqBody GradeRequest

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

	grade := Grade{
		TaskID:   reqBody.TaskID,
		Score:    reqBody.Score,
		Feedback: reqBody.Feedback,
	}

	result, err := gh.gradeService.Create(userID, grade)
	if err != nil {
		if err.Error() == "task not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"success": result})
}

func (gh *GradeHandler) Update(c *gin.Context) {
	var reqBody GradeRequest

	idParam := c.Param("id")

	if err := c.ShouldBindJSON(&reqBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	parsedID, convErr := strconv.ParseUint(idParam, 0, 0)
	if convErr != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": convErr.Error()})
		return
	}

	id := uint(parsedID)

	raw, ok := c.Get("userID")
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	userID := raw.(uint)

	grade := Grade{
		Score:    reqBody.Score,
		Feedback: reqBody.Feedback,
	}

	result, err := gh.gradeService.Update(id, userID, grade)
	if err != nil {
		if err.Error() == "grade not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": result})
}

func (gh *GradeHandler) Delete(c *gin.Context) {
	idParam := c.Param("id")

	parsedID, convErr := strconv.ParseUint(idParam, 0, 0)
	if convErr != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": convErr.Error()})
		return
	}

	id := uint(parsedID)

	raw, ok := c.Get("userID")
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	userID := raw.(uint)

	err := gh.gradeService.Delete(id, userID)
	if err != nil {
		if err.Error() == "grade not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "deleted"})
}

func (gh *GradeHandler) RegisterRoutes(rg *gin.RouterGroup) {
	grades := rg.Group("/grades")
	grades.Use(middleware.AuthMiddleware(gh.secret))
	{
		grades.GET("/", gh.GetByTaskID)
		grades.POST("/", gh.Create)
		grades.PUT("/:id", gh.Update)
		grades.DELETE("/:id", gh.Delete)
	}
}
