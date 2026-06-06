package subject

import (
	"errors"

	"gorm.io/gorm"
)

type SubjectService struct {
	repo SubjectRepository
}

func NewSubjectService(repo SubjectRepository) *SubjectService {
	return &SubjectService{
		repo: repo,
	}
}

func (ss *SubjectService) GetAll(userID uint) ([]Subject, error) {
	subjects, err := ss.repo.GetAll(userID)

	return subjects, err
}

func (ss *SubjectService) Create(userID uint, name, color string) (Subject, error) {
	subject := Subject{
		UserID: userID,
		Name:   name,
		Color:  color,
	}

	result, err := ss.repo.Create(subject)

	if err != nil {
		return Subject{}, err
	}

	return result, err
}

func (ss *SubjectService) Update(id, userID uint, name, color string) (Subject, error) {
	subject, err := ss.repo.GetByID(id, userID)

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return Subject{}, errors.New("subject not found")
		}
		return Subject{}, err
	}

	subject.Name = name
	subject.Color = color

	result, err := ss.repo.Update(subject)

	return result, err
}

func (ss *SubjectService) Delete(id, userID uint) error {
	err := ss.repo.Delete(id, userID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("subject not found")
		}
		return errors.New("something wrong")
	}
	return nil
}
