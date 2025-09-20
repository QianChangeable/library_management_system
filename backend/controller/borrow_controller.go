package controller

import (
	"backend/service"
	"net/http"

	"github.com/gin-gonic/gin"
)

type BorrowController struct {
	borrowService *service.BorrowService
}

func NewBorrowController(borrowService *service.BorrowService) *BorrowController {
	return &BorrowController{borrowService: borrowService}
}

// 借书
func (c *BorrowController) BorrowBook(ctx *gin.Context) {
	var request struct {
		StuID  string `json:"stu_id" binding:"required"`
		BookID string `json:"book_id" binding:"required"`
	}

	if err := ctx.ShouldBindJSON(&request); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "参数错误: " + err.Error()})
		return
	}

	err := c.borrowService.BorrowBook(request.StuID, request.BookID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"message": "借书成功",
	})
}

// 还书
func (c *BorrowController) ReturnBook(ctx *gin.Context) {
	var request struct {
		StuID  string `json:"stu_id" binding:"required"`
		BookID string `json:"book_id" binding:"required"`
	}

	if err := ctx.ShouldBindJSON(&request); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "参数错误: " + err.Error()})
		return
	}

	fineAmount, err := c.borrowService.ReturnBook(request.StuID, request.BookID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	response := gin.H{
		"message": "还书成功",
	}
	if fineAmount > 0 {
		response["fine_amount"] = fineAmount
		response["message"] = "还书成功，产生逾期罚款"
	}

	ctx.JSON(http.StatusOK, response)
}

// 支付罚款
func (c *BorrowController) PayFine(ctx *gin.Context) {
	var request struct {
		StuID string `json:"stu_id" binding:"required"`
	}

	if err := ctx.ShouldBindJSON(&request); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "参数错误: " + err.Error()})
		return
	}

	err := c.borrowService.PayFine(request.StuID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"message": "罚款支付成功，借阅权限已恢复",
	})
}

// 获取借阅记录
func (c *BorrowController) GetBorrowRecord(ctx *gin.Context) {
	stuID := ctx.Query("stu_id")
	bookID := ctx.Query("book_id")

	if stuID == "" || bookID == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "学号和书籍ID不能为空"})
		return
	}

	record, err := c.borrowService.GetBorrowRecord(stuID, bookID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"data": record,
	})
}

// 获取学生的所有借阅记录
func (c *BorrowController) GetStudentBorrowRecords(ctx *gin.Context) {
	stuID := ctx.Query("stu_id")

	if stuID == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "学号不能为空"})
		return
	}

	records, err := c.borrowService.GetStudentBorrowRecordsWithBookInfo(stuID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"data": records,
	})
}
