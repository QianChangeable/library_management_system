package dao

import (
	"database/sql"
	"fmt"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

// 使用GORM创建数据库连接（用于表迁移）
func NewGormDB(addr string) (*gorm.DB, error) {
	db, err := gorm.Open(mysql.Open(addr), &gorm.Config{})
	if err != nil {
		return nil, err
	}
	return db, nil
}

// 使用标准SQL创建数据库连接（用于业务操作）
func NewSQLDB(addr string) (*sql.DB, error) {
	db, err := sql.Open("mysql", addr)
	if err != nil {
		return nil, err
	}

	// 测试连接
	err = db.Ping()
	if err != nil {
		return nil, err
	}

	return db, nil
}

type Table interface {
	TableName() string
}

func CreateTables(db *gorm.DB, tables []Table) error {
	for _, table := range tables {
		if err := db.AutoMigrate(table); err != nil {
			return err
		}
	}
	return nil
}

// 执行SQL脚本文件
func ExecuteSQLScript(db *sql.DB, sqlScript string) error {
	_, err := db.Exec(sqlScript)
	if err != nil {
		return fmt.Errorf("执行SQL脚本失败: %v", err)
	}
	return nil
}
