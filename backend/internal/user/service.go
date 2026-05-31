package user

import (
	"errors"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type UserService struct {
	repo UserRepository
}

func NewUserService(repo UserRepository) *UserService {
	return &UserService{
		repo: repo,
	}
}

func (us *UserService) Register(name, email, password string) (User, error) {
	_, err := us.repo.FindByEmail(email)

	if err != nil {
		if err != gorm.ErrRecordNotFound {
			return User{}, err
		}
	}

	if err == nil {
		return User{}, errors.New("email already taken")
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return User{}, err
	}

	newUser := User{
		Email:        email,
		PasswordHash: string(hashedPassword),
		Name:         name,
	}

	user, err := us.repo.Create(newUser)

	return user, err
}
