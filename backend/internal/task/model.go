package task

import (
	"time"

	"gorm.io/gorm"
)

type Task struct {
	gorm.Model
	UserID      uint       `json:"user_id" gorm:"not null"`
	SubjectID   *uint      `json:"subject_id"`
	Title       string     `json:"title"`
	Description string     `json:"description"`
	DueDate     *time.Time `json:"due_date"`
	Priority    string     `json:"priority" gorm:"not null;default:medium"`
	Status      string     `json:"status" gorm:"not null;default:todo"`
}

type TaskStats struct {
	Total      int64 `json:"total"`
	Done       int64 `json:"done"`
	InProgress int64 `json:"in_progress"`
	Todo       int64 `json:"todo"`
	Overdue    int64 `json:"overdue"`
}
