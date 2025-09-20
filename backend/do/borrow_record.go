package do

import "time"

type BorrowRecord struct {
	ID          int       `json:"id" gorm:"column:id;primaryKey;autoIncrement"`
	StuID       string    `json:"stu_id" gorm:"column:stu_id"`
	BookID      string    `json:"book_id" gorm:"column:book_id"`
	BorrowDate  time.Time `json:"borrow_date" gorm:"column:borrow_date"`
	DueDate     time.Time `json:"due_date" gorm:"column:due_date"`
	ReturnDate  time.Time `json:"return_date" gorm:"column:return_date"`
	IsOverdue   bool      `json:"is_overdue" gorm:"column:is_overdue"`
	FineAmount  float64   `json:"fine_amount" gorm:"column:fine_amount"`
	CreatedAt   time.Time `json:"created_at" gorm:"column:created_at"`
}

func (b *BorrowRecord) TableName() string {
	return "borrow_records"
}
