package dao

import (
	"database/sql"
	"fmt"
	"backend/do"
)

type StudentDAO struct {
	db *sql.DB
	tx *sql.Tx
}

func NewStudentDAO(db *sql.DB) *StudentDAO {
	return &StudentDAO{db: db}
}

func NewStudentDAOTx(tx *sql.Tx) *StudentDAO {
	return &StudentDAO{tx: tx}
}

func (dao *StudentDAO) getExecutor() interface {
	Query(query string, args ...interface{}) (*sql.Rows, error)
	QueryRow(query string, args ...interface{}) *sql.Row
	Exec(query string, args ...interface{}) (sql.Result, error)
} {
	if dao.tx != nil {
		return dao.tx
	}
	return dao.db
}

// 根据学号获取学生信息
func (dao *StudentDAO) GetStudentByID(stuID string) (*do.Student, error) {
	query := `
		SELECT stu_id, name, password, trust, can_borrow, created_at
		FROM students 
		WHERE stu_id = ?
	`
	
	executor := dao.getExecutor()
	row := executor.QueryRow(query, stuID)
	
	var student do.Student
	err := row.Scan(
		&student.StuId,
		&student.Name,
		&student.Password,
		&student.Trust,
		&student.CanBorrow,
		&student.CreatedAt,
	)
	
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("学生不存在")
		}
		return nil, err
	}
	
	return &student, nil
}

// 更新学生借阅状态
func (dao *StudentDAO) UpdateStudentBorrowStatus(stuID string, canBorrow bool) error {
	query := "UPDATE students SET can_borrow = ? WHERE stu_id = ?"
	executor := dao.getExecutor()
	_, err := executor.Exec(query, canBorrow, stuID)
	return err
}

// 检查学生是否有未支付的罚款
func (dao *StudentDAO) HasUnpaidFine(stuID string) (bool, error) {
	query := `
		SELECT COUNT(*) 
		FROM borrow_records 
		WHERE stu_id = ? AND is_overdue = true AND fine_amount > 0 AND return_date IS NULL
	`
	
	executor := dao.getExecutor()
	var count int
	err := executor.QueryRow(query, stuID).Scan(&count)
	if err != nil {
		return false, err
	}
	
	return count > 0, nil
}
