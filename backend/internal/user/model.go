package user

import (
	"gorm.io/gorm"
)

type User struct {
	gorm.Model
	Email        string `json:"email" gorm:"uniqueIndex;not null"`
	PasswordHash string `gorm:"not null" json:"-"`
	Name         string `json:"name" gorm:"not null"`
}
