package dao

import (
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

func NewDB(addr string) (*gorm.DB, error) {
	db, err := gorm.Open(mysql.Open(addr), &gorm.Config{})
	if err!=nil {
		return nil,err
	}
	return db, nil
}

type Table interface{
	TableName() string
}


func CreateTables(db *gorm.DB,tables []Table) error {
	for _,table := range tables {
		if err := db.AutoMigrate(table);err!=nil{
			return err
		}
	}
	return nil
}
