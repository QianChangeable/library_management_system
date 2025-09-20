package service

import (
	"backend/dao"
	"backend/do"
	"database/sql"
	"fmt"
	"time"
)

type BorrowService struct {
	bookService    *BookService
	studentService *StudentService
	borrowDAO      *dao.BorrowDAO
	db             *sql.DB
}

func NewBorrowService(db *sql.DB) *BorrowService {
	return &BorrowService{
		bookService:    NewBookService(db),
		studentService: NewStudentService(db),
		borrowDAO:      dao.NewBorrowDAO(db),
		db:             db,
	}
}

// 借书操作
func (s *BorrowService) BorrowBook(stuID, bookID string) error {
	// 开始事务
	tx, err := s.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// 检查学生是否可以借书
	canBorrow, reason, err := s.studentService.CanStudentBorrow(stuID)
	if err != nil {
		return err
	}
	if !canBorrow {
		return fmt.Errorf("借阅失败: %s", reason)
	}

	// 检查书籍是否可以借阅
	canBorrowBook, err := s.bookService.CanBorrowBook(bookID)
	if err != nil {
		return err
	}
	if !canBorrowBook {
		return fmt.Errorf("借阅失败: 书籍不可借阅或已全部借出")
	}

	// 创建借阅记录
	borrowRecord := &do.BorrowRecord{
		StuID:      stuID,
		BookID:     bookID,
		BorrowDate: time.Now(),
		DueDate:    time.Now().AddDate(0, 2, 0), // 两个月后
		ReturnDate: nil,
		IsOverdue:  false,
		FineAmount: 0,
	}

	// 使用事务中的DAO
	borrowDAOTx := dao.NewBorrowDAOTx(tx)
	if err := borrowDAOTx.CreateBorrowRecord(borrowRecord); err != nil {
		return err
	}

	// 减少书籍可借阅数量
	bookDAOTx := dao.NewBookDAOTx(tx)
	book, err := bookDAOTx.GetBookByID(bookID)
	if err != nil {
		return err
	}
	if err := bookDAOTx.UpdateBookAvailableCopies(bookID, book.AvailableCopies-1); err != nil {
		return err
	}

	// 提交事务
	return tx.Commit()
}

// 还书操作
func (s *BorrowService) ReturnBook(stuID, bookID string) (float64, error) {
	// 开始事务
	tx, err := s.db.Begin()
	if err != nil {
		return 0, err
	}
	defer tx.Rollback()

	// 检查是否逾期并计算罚款
	borrowDAOTx := dao.NewBorrowDAOTx(tx)
	isOverdue, fineAmount, err := borrowDAOTx.CheckOverdueAndCalculateFine(stuID, bookID, time.Now())
	if err != nil {
		return 0, err
	}

	// 执行还书操作
	if err := borrowDAOTx.ReturnBook(stuID, bookID, time.Now()); err != nil {
		return 0, err
	}

	// 增加书籍可借阅数量
	bookDAOTx := dao.NewBookDAOTx(tx)
	book, err := bookDAOTx.GetBookByID(bookID)
	if err != nil {
		return 0, err
	}
	if err := bookDAOTx.UpdateBookAvailableCopies(bookID, book.AvailableCopies+1); err != nil {
		return 0, err
	}

	// 如果有逾期罚款，禁用学生借阅权限
	if isOverdue && fineAmount > 0 {
		studentDAOTx := dao.NewStudentDAOTx(tx)
		if err := studentDAOTx.UpdateStudentBorrowStatus(stuID, false); err != nil {
			return 0, err
		}
	}

	// 提交事务
	if err := tx.Commit(); err != nil {
		return 0, err
	}

	return fineAmount, nil
}

// 获取借阅记录详情
func (s *BorrowService) GetBorrowRecord(stuID, bookID string) (*do.BorrowRecord, error) {
	return s.borrowDAO.GetBorrowRecord(stuID, bookID)
}

// 处理罚款支付
func (s *BorrowService) PayFine(stuID string) error {
	// 开始事务
	tx, err := s.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// 检查是否还有未支付的罚款
	studentDAOTx := dao.NewStudentDAOTx(tx)
	hasUnpaidFine, err := studentDAOTx.HasUnpaidFine(stuID)
	if err != nil {
		return err
	}

	if !hasUnpaidFine {
		return fmt.Errorf("没有需要支付的罚款")
	}

	// 启用学生借阅权限
	if err := studentDAOTx.UpdateStudentBorrowStatus(stuID, true); err != nil {
		return err
	}

	// 提交事务
	return tx.Commit()
}
