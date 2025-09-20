package dao

import (
	"database/sql"
	"fmt"
	"backend/do"
)

type BookDAO struct {
	db *sql.DB
	tx *sql.Tx
}

func NewBookDAO(db *sql.DB) *BookDAO {
	return &BookDAO{db: db}
}

func NewBookDAOTx(tx *sql.Tx) *BookDAO {
	return &BookDAO{tx: tx}
}

func (dao *BookDAO) getExecutor() interface {
	Query(query string, args ...interface{}) (*sql.Rows, error)
	QueryRow(query string, args ...interface{}) *sql.Row
	Exec(query string, args ...interface{}) (sql.Result, error)
} {
	if dao.tx != nil {
		return dao.tx
	}
	return dao.db
}

// 根据书名或作者查找书籍
func (dao *BookDAO) FindBooksByTitleOrAuthor(keyword string) ([]do.Book, error) {
	query := `
		SELECT book_id, title, author, description, total_copies, available_copies, can_borrow, created_at
		FROM books 
		WHERE (title LIKE ? OR author LIKE ?) AND can_borrow = true
	`
	
	executor := dao.getExecutor()
	rows, err := executor.Query(query, "%"+keyword+"%", "%"+keyword+"%")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var books []do.Book
	for rows.Next() {
		var book do.Book
		err := rows.Scan(
			&book.BookID,
			&book.Title,
			&book.Author,
			&book.Description,
			&book.TotalCopies,
			&book.AvailableCopies,
			&book.CanBorrow,
			&book.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		books = append(books, book)
	}

	return books, nil
}

// 根据图书ID获取书籍信息
func (dao *BookDAO) GetBookByID(bookID string) (*do.Book, error) {
	query := `
		SELECT book_id, title, author, description, total_copies, available_copies, can_borrow, created_at
		FROM books 
		WHERE book_id = ?
	`
	
	executor := dao.getExecutor()
	row := executor.QueryRow(query, bookID)
	
	var book do.Book
	err := row.Scan(
		&book.BookID,
		&book.Title,
		&book.Author,
		&book.Description,
		&book.TotalCopies,
		&book.AvailableCopies,
		&book.CanBorrow,
		&book.CreatedAt,
	)
	
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("书籍不存在")
		}
		return nil, err
	}
	
	return &book, nil
}

// 获取所有书籍列表
func (dao *BookDAO) GetAllBooks() ([]do.Book, error) {
	query := `
		SELECT book_id, title, author, description, total_copies, available_copies, can_borrow, created_at
		FROM books 
		ORDER BY created_at DESC
	`
	
	executor := dao.getExecutor()
	rows, err := executor.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var books []do.Book
	for rows.Next() {
		var book do.Book
		err := rows.Scan(
			&book.BookID,
			&book.Title,
			&book.Author,
			&book.Description,
			&book.TotalCopies,
			&book.AvailableCopies,
			&book.CanBorrow,
			&book.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		books = append(books, book)
	}

	return books, nil
}

// 更新书籍可借阅数量
func (dao *BookDAO) UpdateBookAvailableCopies(bookID string, availableCopies int) error {
	query := "UPDATE books SET available_copies = ? WHERE book_id = ?"
	executor := dao.getExecutor()
	_, err := executor.Exec(query, availableCopies, bookID)
	return err
}
