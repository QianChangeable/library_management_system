package do

import "time"

type Book struct {
	BookID         string    `json:"book_id" gorm:"column:book_id;primaryKey"`
	Title          string    `json:"title" gorm:"column:title"`
	Author         string    `json:"author" gorm:"column:author"`
	Description    string    `json:"description" gorm:"column:description"`
	TotalCopies    int       `json:"total_copies" gorm:"column:total_copies"`
	AvailableCopies int      `json:"available_copies" gorm:"column:available_copies"`
	CanBorrow      bool      `json:"can_borrow" gorm:"column:can_borrow"`
	CreatedAt      time.Time `json:"created_at" gorm:"column:created_at"`
}

func (b *Book) TableName() string {
	return "books"
}
