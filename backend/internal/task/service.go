package task

import (
	"errors"

	"gorm.io/gorm"
)

type TaskService struct {
	repo TaskRepository
}

func NewTaskService(repo TaskRepository) *TaskService {
	return &TaskService{
		repo: repo,
	}
}

func (ts *TaskService) GetAll(userID uint, status, priority, dueFrom, dueTo string, subjectID *uint) ([]Task, error) {
	result, err := ts.repo.GetAll(userID, status, priority, dueFrom, dueTo, subjectID)

	return result, err
}

func (ts *TaskService) Create(userID uint, task Task) (Task, error) {
	task.UserID = userID

	result, err := ts.repo.Create(task)

	if err != nil {
		return Task{}, err
	}

	return result, err
}

func (ts *TaskService) Update(id, userID uint, task Task) (Task, error) {
	taskToUpdate, accessErr := ts.repo.GetByID(id, userID)

	if accessErr != nil {
		if errors.Is(accessErr, gorm.ErrRecordNotFound) {
			return Task{}, errors.New("task not found")
		}
		return Task{}, accessErr
	}

	taskToUpdate.SubjectID = task.SubjectID
	taskToUpdate.Title = task.Title
	taskToUpdate.Description = task.Description
	taskToUpdate.DueDate = task.DueDate
	taskToUpdate.Priority = task.Priority
	taskToUpdate.Status = task.Status

	result, err := ts.repo.Update(taskToUpdate)

	return result, err
}

func (ts *TaskService) Delete(id, userID uint) error {
	err := ts.repo.Delete(id, userID)

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("task not found")
		}
		return err
	}
	return nil
}

func (ts *TaskService) UpdateStatus(id, userID uint, status string) error {
	err := ts.repo.UpdateStatus(id, userID, status)

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("task not found")
		}
		return err
	}
	return nil
}
