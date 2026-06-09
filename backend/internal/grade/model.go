package grade

import (
	"gorm.io/gorm"
)

type Grade struct {
	gorm.Model
	TaskID   uint    `json:"task_id" gorm:"not null"`
	UserID   uint    `json:"user_id" gorm:"not null"`
	Score    float64 `json:"score"`
	Feedback string  `json:"feedback"`
}
