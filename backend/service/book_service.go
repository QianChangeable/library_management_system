package service

import (
	"backend/dao"
	"backend/do"
	"database/sql"
)

type BookService struct {
	bookDAO *dao.BookDAO
}

func NewBookService(db *sql.DB) *BookService {
	return &BookService{
		bookDAO: dao.NewBookDAO(db),
	}
}

// 查找书籍 - 根据书名或作者
func (s *BookService) SearchBooks(keyword string) ([]do.Book, error) {
	return s.bookDAO.FindBooksByTitleOrAuthor(keyword)
}

// 获取书籍详情
func (s *BookService) GetBookDetail(bookID string) (*do.Book, error) {
	return s.bookDAO.GetBookByID(bookID)
}

// 检查书籍是否可以借阅
func (s *BookService) CanBorrowBook(bookID string) (bool, error) {
	book, err := s.bookDAO.GetBookByID(bookID)
	if err != nil {
		return false, err
	}
	
	return book.CanBorrow && book.AvailableCopies > 0, nil
}

// 减少可借阅数量
func (s *BookService) DecreaseAvailableCopies(bookID string) error {
	book, err := s.bookDAO.GetBookByID(bookID)
	if err != nil {
		return err
	}
	
	if book.AvailableCopies <= 0 {
		return &BorrowError{Message: "书籍已全部借出"}
	}
	
	return s.bookDAO.UpdateBookAvailableCopies(bookID, book.AvailableCopies-1)
}

// 增加可借阅数量
func (s *BookService) IncreaseAvailableCopies(bookID string) error {
	book, err := s.bookDAO.GetBookByID(bookID)
	if err != nil {
		return err
	}
	
	return s.bookDAO.UpdateBookAvailableCopies(bookID, book.AvailableCopies+1)
}

// 自定义错误类型
type BorrowError struct {
	Message string
}

func (e *BorrowError) Error() string {
	return e.Message
}
