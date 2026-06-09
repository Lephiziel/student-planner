package grade

import (
	"errors"

	"github.com/Lephiziel/student-planner/internal/task"
	"gorm.io/gorm"
)

type GradeService struct {
	repo     GradeRepository
	taskRepo task.TaskRepository
}

func NewGradeService(repo GradeRepository, taskRepo task.TaskRepository) *GradeService {
	return &GradeService{
		repo:     repo,
		taskRepo: taskRepo,
	}
}

func (gs *GradeService) GetByTaskID(taskID, userID uint) ([]Grade, error) {
	result, err := gs.repo.GetByTaskID(taskID, userID)
	if err != nil {
		return []Grade{}, err
	}

	return result, nil
}

func (gs *GradeService) Create(userID uint, grade Grade) (Grade, error) {
	grade.UserID = userID

	_, checkErr := gs.taskRepo.GetByID(grade.TaskID, userID)
	if checkErr != nil {
		if errors.Is(checkErr, gorm.ErrRecordNotFound) {
			return Grade{}, errors.New("task not found")
		}
		return Grade{}, checkErr
	}

	result, err := gs.repo.Create(grade)
	if err != nil {
		return Grade{}, err
	}

	return result, nil
}

func (gs *GradeService) Update(id, userID uint, grade Grade) (Grade, error) {
	oldGrade, oldGradeErr := gs.repo.GetByID(id, userID)
	if oldGradeErr != nil {
		if errors.Is(oldGradeErr, gorm.ErrRecordNotFound) {
			return Grade{}, errors.New("grade not found")
		}
		return Grade{}, oldGradeErr
	}

	oldGrade.Score = grade.Score
	oldGrade.Feedback = grade.Feedback

	result, err := gs.repo.Update(oldGrade)
	if err != nil {
		return Grade{}, err
	}

	return result, nil
}

func (gs *GradeService) Delete(id, userID uint) error {
	err := gs.repo.Delete(id, userID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("grade not found")
		}
		return err
	}

	return nil
}
