package task

import (
	"net/http"
	"strconv"
	"time"

	"github.com/Lephiziel/student-planner/internal/middleware"
	"github.com/gin-gonic/gin"
)

type TaskHandler struct {
	taskService TaskService
	secret      string
}

func NewTaskHandler(taskService TaskService, secret string) *TaskHandler {
	return &TaskHandler{
		taskService: taskService,
		secret:      secret,
	}
}

type TaskRequest struct {
	Title       string     `json:"title" binding:"required,min=2"`
	Description string     `json:"description" binding:"omitempty"`
	DueDate     *time.Time `json:"due_date" binding:"omitempty"`
	Priority    string     `json:"priority" binding:"required,oneof=low medium high"`
	Status      string     `json:"status" binding:"required,oneof=todo in_progress done"`
	SubjectID   *uint      `json:"subject_id" binding:"omitempty"`
}

type UpdateStatusRequest struct {
	Status string `json:"status" binding:"required,oneof=todo in_progress done"`
}

func (th *TaskHandler) GetAll(c *gin.Context) {
	raw, ok := c.Get("userID")
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	userID := raw.(uint)

	status := c.Query("status")

	priority := c.Query("priority")

	dueFrom := c.Query("due_from")

	dueTo := c.Query("due_to")

	subjectID := c.Query("subject_id")

	var parsedID *uint

	if subjectID != "" {
		parsed, err := strconv.ParseUint(subjectID, 0, 0)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		id := uint(parsed)
		parsedID = &id
	}

	result, err := th.taskService.GetAll(userID, status, priority, dueFrom, dueTo, parsedID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": result})
}

func (th *TaskHandler) Create(c *gin.Context) {
	var reqBody TaskRequest

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

	newTask := Task{
		SubjectID:   reqBody.SubjectID,
		Title:       reqBody.Title,
		Description: reqBody.Description,
		DueDate:     reqBody.DueDate,
		Priority:    reqBody.Priority,
		Status:      reqBody.Status,
	}

	result, err := th.taskService.Create(userID, newTask)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"success": result})
}

func (th *TaskHandler) Update(c *gin.Context) {
	var reqBody TaskRequest

	idParam := c.Param("id")

	parsedID, convErr := strconv.ParseUint(idParam, 0, 0)
	if convErr != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": convErr.Error()})
		return
	}

	id := uint(parsedID)

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

	taskToUpdate := Task{
		SubjectID:   reqBody.SubjectID,
		Title:       reqBody.Title,
		Description: reqBody.Description,
		DueDate:     reqBody.DueDate,
		Priority:    reqBody.Priority,
		Status:      reqBody.Status,
	}

	result, err := th.taskService.Update(id, userID, taskToUpdate)
	if err != nil {
		if err.Error() == "task not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": result})
}

func (th *TaskHandler) Delete(c *gin.Context) {
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

	err := th.taskService.Delete(id, userID)
	if err != nil {
		if err.Error() == "task not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "deleted"})
}

func (th *TaskHandler) UpdateStatus(c *gin.Context) {
	var reqBody UpdateStatusRequest

	idParam := c.Param("id")

	parseID, convErr := strconv.ParseUint(idParam, 0, 0)
	if convErr != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": convErr.Error()})
		return
	}
	id := uint(parseID)

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

	err := th.taskService.UpdateStatus(id, userID, reqBody.Status)
	if err != nil {
		if err.Error() == "task not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "updated"})
}

func (th *TaskHandler) GetStats(c *gin.Context) {
	raw, ok := c.Get("userID")
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}
	userID := raw.(uint)

	result, err := th.taskService.GetStats(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": result})
}

func (th *TaskHandler) RegisterRoutes(rg *gin.RouterGroup) {
	tasks := rg.Group("/tasks")
	tasks.Use(middleware.AuthMiddleware(th.secret))
	{
		tasks.GET("/", th.GetAll)
		tasks.GET("/stats", th.GetStats)
		tasks.POST("/", th.Create)
		tasks.PUT("/:id", th.Update)
		tasks.DELETE("/:id", th.Delete)
		tasks.PATCH("/:id/status", th.UpdateStatus)
	}
}
