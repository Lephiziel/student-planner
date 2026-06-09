package grade

import (
	"errors"

	"gorm.io/gorm"
)

type GradeRepository struct {
	db *gorm.DB
}

func NewGradeRepository(db *gorm.DB) *GradeRepository {
	return &GradeRepository{
		db: db,
	}
}

func (gr *GradeRepository) GetByTaskID(taskID, userID uint) ([]Grade, error) {
	var grade []Grade

	result := gr.db.Where("task_id = ? AND user_id = ?", taskID, userID).Find(&grade)

	return grade, result.Error
}

func (gr *GradeRepository) Create(grade Grade) (Grade, error) {
	result := gr.db.Create(&grade)

	return grade, result.Error
}

func (gr *GradeRepository) Update(grade Grade) (Grade, error) {
	result := gr.db.Save(&grade)

	return grade, result.Error
}

func (gr *GradeRepository) Delete(id, userID uint) error {
	var grade Grade

	result := gr.db.Where("id = ? AND user_id = ?", id, userID).First(&grade)

	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		return result.Error
	}

	deleteResult := gr.db.Delete(&grade)

	return deleteResult.Error
}

func (gr *GradeRepository) GetByID(id, userID uint) (Grade, error) {
	var grade Grade

	result := gr.db.Where("id = ? AND user_id = ?", id, userID).First(&grade)

	return grade, result.Error
}
