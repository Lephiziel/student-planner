package task

import (
	"errors"

	"gorm.io/gorm"
)

type TaskRepository struct {
	db *gorm.DB
}

func NewTaskRepository(db *gorm.DB) *TaskRepository {
	return &TaskRepository{
		db: db,
	}
}

func (tr *TaskRepository) GetAll(userID uint, status, priority, dueFrom, dueTo string, subjectID *uint) ([]Task, error) {
	var task []Task

	result := tr.db.Where("user_id = ?", userID)

	if status != "" {
		result = result.Where("status = ?", status)
	}

	if priority != "" {
		result = result.Where("priority = ?", priority)
	}

	if dueFrom != "" {
		result = result.Where("due_date >= ?", dueFrom)
	}

	if dueTo != "" {
		result = result.Where("due_date <= ?", dueTo)
	}

	if subjectID != nil {
		result = result.Where("subject_id = ?", subjectID)
	}

	result = result.Find(&task)

	return task, result.Error
}

func (tr *TaskRepository) Create(task Task) (Task, error) {
	result := tr.db.Create(&task)

	return task, result.Error
}

func (tr *TaskRepository) Update(task Task) (Task, error) {
	result := tr.db.Save(&task)

	return task, result.Error
}

func (tr *TaskRepository) Delete(id, userID uint) error {
	var task Task

	result := tr.db.Where("id = ? AND user_id = ?", id, userID).First(&task)

	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		return result.Error
	}

	deleteResult := tr.db.Delete(&task)

	return deleteResult.Error
}

func (tr *TaskRepository) GetByID(id, userID uint) (Task, error) {
	var task Task

	result := tr.db.Where("id = ? AND user_id = ?", id, userID).First(&task)

	return task, result.Error
}

func (tr *TaskRepository) UpdateStatus(id, userID uint, status string) error {
	result := tr.db.Model(&Task{}).Where("id = ? AND user_id = ?", id, userID).Update("status", status)

	return result.Error
}
