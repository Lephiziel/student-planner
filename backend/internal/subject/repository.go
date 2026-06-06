package subject

import (
	"errors"

	"gorm.io/gorm"
)

type SubjectRepository struct {
	db *gorm.DB
}

func NewSubjectRepository(db *gorm.DB) *SubjectRepository {
	return &SubjectRepository{
		db: db,
	}
}

func (sr *SubjectRepository) GetAll(userID uint) ([]Subject, error) {
	var subjects []Subject

	result := sr.db.Where("user_id = ?", userID).Find(&subjects)

	return subjects, result.Error
}

func (sr *SubjectRepository) Create(subject Subject) (Subject, error) {
	result := sr.db.Create(&subject)

	return subject, result.Error
}

func (sr *SubjectRepository) Update(subject Subject) (Subject, error) {
	result := sr.db.Save(&subject)

	return subject, result.Error
}

func (sr *SubjectRepository) Delete(id, userID uint) error {
	var subject Subject

	result := sr.db.Where("id = ? AND user_id = ?", id, userID).First(&subject)

	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		return result.Error
	}

	deleteResult := sr.db.Delete(&subject)

	return deleteResult.Error
}

func (sr *SubjectRepository) GetByID(id, userID uint) (Subject, error) {
	var subject Subject

	result := sr.db.Where("id = ? AND user_id = ?", id, userID).First(&subject)

	return subject, result.Error
}
