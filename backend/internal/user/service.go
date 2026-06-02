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

func (us *UserService) Login(email, password string) (User, error) {
	user, err := us.repo.FindByEmail(email)

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return User{}, errors.New("invalid credentials")
		}
		return User{}, err
	}

	passwdErr := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password))
	if passwdErr != nil {
		return User{}, errors.New("invalid credentials")
	}

	return user, nil
}

func (us *UserService) GetByID(id uint) (User, error) {
	user, err := us.repo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return User{}, errors.New("User not found")
		}
		return User{}, err
	}

	return user, err
}
