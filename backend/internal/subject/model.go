package subject

import (
	"gorm.io/gorm"
)

type Subject struct {
	gorm.Model
	UserID uint   `json:"user_id" gorm:"not null"`
	Name   string `json:"name" gorm:"not null"`
	Color  string `json:"color"`
}

type SubjectStats struct {
	SubjectID   uint   `json:"subject_id"`
	SubjectName string `json:"subject_name"`
	Color       string `json:"color"`
	TotalTasks  int64  `json:"total_tasks"`
	DoneTasks   int64  `json:"done_tasks"`
}
