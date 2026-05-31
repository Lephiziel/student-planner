package user

import (
	"gorm.io/gorm"
)

type UserRepository struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) *UserRepository {
	return &UserRepository{
		db: db,
	}
}

func (ur *UserRepository) FindByEmail(email string) (User, error) {
	var user User

	result := ur.db.Where("email = ?", email).First(&user)

	return user, result.Error
}

func (ur *UserRepository) Create(user User) (User, error) {
	result := ur.db.Create(&user)

	return user, result.Error
}
