package dao

import (
	"database/sql"
	"fmt"
	"time"
	"backend/do"
)

type BorrowDAO struct {
	db *sql.DB
	tx *sql.Tx
}

func NewBorrowDAO(db *sql.DB) *BorrowDAO {
	return &BorrowDAO{db: db}
}

func NewBorrowDAOTx(tx *sql.Tx) *BorrowDAO {
	return &BorrowDAO{tx: tx}
}

func (dao *BorrowDAO) getExecutor() interface {
	Query(query string, args ...interface{}) (*sql.Rows, error)
	QueryRow(query string, args ...interface{}) *sql.Row
	Exec(query string, args ...interface{}) (sql.Result, error)
} {
	if dao.tx != nil {
		return dao.tx
	}
	return dao.db
}

// 创建借阅记录
func (dao *BorrowDAO) CreateBorrowRecord(record *do.BorrowRecord) error {
	query := `
		INSERT INTO borrow_records (stu_id, book_id, borrow_date, due_date, return_date, is_overdue, fine_amount)
		VALUES (?, ?, ?, ?, ?, ?, ?)
	`
	
	executor := dao.getExecutor()
	_, err := executor.Exec(
		query,
		record.StuID,
		record.BookID,
		record.BorrowDate,
		record.DueDate,
		record.ReturnDate,
		record.IsOverdue,
		record.FineAmount,
	)
	return err
}

// 根据学号和图书ID获取借阅记录
func (dao *BorrowDAO) GetBorrowRecord(stuID, bookID string) (*do.BorrowRecord, error) {
	query := `
		SELECT id, stu_id, book_id, borrow_date, due_date, return_date, is_overdue, fine_amount, created_at
		FROM borrow_records 
		WHERE stu_id = ? AND book_id = ? AND return_date IS NULL
	`
	
	executor := dao.getExecutor()
	row := executor.QueryRow(query, stuID, bookID)
	
	var record do.BorrowRecord
	err := row.Scan(
		&record.ID,
		&record.StuID,
		&record.BookID,
		&record.BorrowDate,
		&record.DueDate,
		&record.ReturnDate,
		&record.IsOverdue,
		&record.FineAmount,
		&record.CreatedAt,
	)
	
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("借阅记录不存在")
		}
		return nil, err
	}
	
	return &record, nil
}

// 还书操作
func (dao *BorrowDAO) ReturnBook(stuID, bookID string, returnDate time.Time) error {
	query := `
		UPDATE borrow_records 
		SET return_date = ?, is_overdue = (due_date < ?)
		WHERE stu_id = ? AND book_id = ? AND return_date IS NULL
	`
	
	executor := dao.getExecutor()
	_, err := executor.Exec(query, returnDate, returnDate, stuID, bookID)
	return err
}

// 检查是否逾期并计算罚款
func (dao *BorrowDAO) CheckOverdueAndCalculateFine(stuID, bookID string, currentDate time.Time) (bool, float64, error) {
	record, err := dao.GetBorrowRecord(stuID, bookID)
	if err != nil {
		return false, 0, err
	}
	
	if currentDate.After(record.DueDate) {
		// 计算逾期天数
		daysOverdue := int(currentDate.Sub(record.DueDate).Hours() / 24)
		fineAmount := float64(daysOverdue) * 0.5 // 每天0.5元罚款
		
		// 更新罚款金额
		updateQuery := "UPDATE borrow_records SET is_overdue = true, fine_amount = ? WHERE id = ?"
		executor := dao.getExecutor()
		_, err := executor.Exec(updateQuery, fineAmount, record.ID)
		if err != nil {
			return false, 0, err
		}
		
		return true, fineAmount, nil
	}
	
	return false, 0, nil
}

// 获取学生的所有借阅记录
func (dao *BorrowDAO) GetStudentBorrowRecords(stuID string) ([]do.BorrowRecord, error) {
	query := `
		SELECT id, stu_id, book_id, borrow_date, due_date, return_date, is_overdue, fine_amount, created_at
		FROM borrow_records 
		WHERE stu_id = ? AND return_date IS NULL
	`
	
	executor := dao.getExecutor()
	rows, err := executor.Query(query, stuID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var records []do.BorrowRecord
	for rows.Next() {
		var record do.BorrowRecord
		err := rows.Scan(
			&record.ID,
			&record.StuID,
			&record.BookID,
			&record.BorrowDate,
			&record.DueDate,
			&record.ReturnDate,
			&record.IsOverdue,
			&record.FineAmount,
			&record.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		records = append(records, record)
	}

	return records, nil
}
