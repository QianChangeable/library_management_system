package service

import (
	"backend/dao"
	"backend/do"
	"database/sql"
)

type StudentService struct {
	studentDAO *dao.StudentDAO
	borrowDAO  *dao.BorrowDAO
}

func NewStudentService(db *sql.DB) *StudentService {
	return &StudentService{
		studentDAO: dao.NewStudentDAO(db),
		borrowDAO:  dao.NewBorrowDAO(db),
	}
}

// 获取学生信息
func (s *StudentService) GetStudentInfo(stuID string) (*do.Student, error) {
	return s.studentDAO.GetStudentByID(stuID)
}

// 检查学生是否可以借书
func (s *StudentService) CanStudentBorrow(stuID string) (bool, string, error) {
	student, err := s.studentDAO.GetStudentByID(stuID)
	if err != nil {
		return false, "", err
	}
	
	if !student.CanBorrow {
		return false, "学生借阅权限已被禁用", nil
	}
	
	// 检查是否有未支付的罚款
	hasUnpaidFine, err := s.studentDAO.HasUnpaidFine(stuID)
	if err != nil {
		return false, "", err
	}
	
	if hasUnpaidFine {
		return false, "有未支付的罚款，请先支付罚款", nil
	}
	
	return true, "", nil
}

// 禁用学生借阅权限
func (s *StudentService) DisableBorrowPermission(stuID string) error {
	return s.studentDAO.UpdateStudentBorrowStatus(stuID, false)
}

// 启用学生借阅权限
func (s *StudentService) EnableBorrowPermission(stuID string) error {
	return s.studentDAO.UpdateStudentBorrowStatus(stuID, true)
}

// 获取学生的借阅记录
func (s *StudentService) GetStudentBorrowRecords(stuID string) ([]do.BorrowRecord, error) {
	return s.borrowDAO.GetStudentBorrowRecords(stuID)
}

// 检查学生是否有逾期记录
func (s *StudentService) HasOverdueRecords(stuID string) (bool, error) {
	records, err := s.borrowDAO.GetStudentBorrowRecords(stuID)
	if err != nil {
		return false, err
	}
	
	for _, record := range records {
		if record.IsOverdue {
			return true, nil
		}
	}
	
	return false, nil
}
