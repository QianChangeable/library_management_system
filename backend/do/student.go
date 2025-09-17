package do

import "time"


type Student struct{
	StuId   string    `json:"stu_id" gorm:"column:stu_id;primaryKey"`
	Name string `json:"name" gorm:"column:name"`
	Password string `json:"password" gorm:"column:password"`
	Trust float64 `json:"trust" gorm:"column:trust"`
	CreatedAt time.Time `json:"created_at" gorm:"column:created_at"`
}

func (s *Student) TableName() string {
	return "students"
}