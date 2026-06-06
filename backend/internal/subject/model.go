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
