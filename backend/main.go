package main

import (
	"backend/controller"
	"backend/dao"
	"backend/service"
	"fmt"
	"log"

	"github.com/gin-gonic/gin"
)

func main() {
	// 初始化数据库连接
	db, err := dao.NewSQLDB("root:12345678@tcp(localhost:13306)/bookTest?charset=utf8mb4&parseTime=True&loc=Local")
	if err != nil {
		log.Fatalf("数据库连接失败: %v", err)
	}
	defer db.Close()

	// 初始化服务
	bookService := service.NewBookService(db)
	borrowService := service.NewBorrowService(db)
	studentService := service.NewStudentService(db)

	// 初始化控制器
	bookController := controller.NewBookController(bookService)
	borrowController := controller.NewBorrowController(borrowService)
	studentController := controller.NewStudentController(studentService)

	// 创建Gin路由
	r := gin.Default()

	// 图书相关路由
	bookGroup := r.Group("/books")
	{
		bookGroup.GET("/search", bookController.SearchBooks)
		bookGroup.GET("/:id", bookController.GetBookDetail)
	}

	// 借阅相关路由
	borrowGroup := r.Group("/borrow")
	{
		borrowGroup.POST("/borrow", borrowController.BorrowBook)
		borrowGroup.POST("/return", borrowController.ReturnBook)
		borrowGroup.POST("/pay-fine", borrowController.PayFine)
		borrowGroup.GET("/record", borrowController.GetBorrowRecord)
	}

	// 学生相关路由
	studentGroup := r.Group("/student")
	{
		studentGroup.POST("/login", studentController.Login)
		studentGroup.GET("/info", studentController.GetStudentInfo)
	}

	// 健康检查
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status": "OK",
			"message": "图书管理系统运行正常",
		})
	})

	fmt.Println("服务器启动在 :8085 端口")
	if err := r.Run(":8085"); err != nil {
		panic(err)
	}
}
