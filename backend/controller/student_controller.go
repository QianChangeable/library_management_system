package controller

import (
	"backend/service"
	"net/http"

	"github.com/gin-gonic/gin"
)

type StudentController struct {
	studentService *service.StudentService
}

func NewStudentController(studentService *service.StudentService) *StudentController {
	return &StudentController{studentService: studentService}
}

// 学生登录
func (c *StudentController) Login(ctx *gin.Context) {
	type LoginRequest struct {
		StuID    string `json:"stu_id" binding:"required"`
		Password string `json:"password" binding:"required"`
	}

	var req LoginRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "请求参数错误: " + err.Error()})
		return
	}

	// 获取学生信息
	student, err := c.studentService.GetStudentInfo(req.StuID)
	if err != nil {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "学号或密码错误"})
		return
	}

	// 验证密码
	if student.Password != req.Password {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "学号或密码错误"})
		return
	}

	// 检查借阅权限
	canBorrow, message, err := c.studentService.CanStudentBorrow(req.StuID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "系统错误: " + err.Error()})
		return
	}

	// 返回登录成功信息
	ctx.JSON(http.StatusOK, gin.H{
		"message": "登录成功",
		"data": gin.H{
			"stu_id":      student.StuId,
			"name":        student.Name,
			"trust":       student.Trust,
			"can_borrow":  canBorrow,
			"borrow_info": message,
		},
	})
}

// 获取学生信息
func (c *StudentController) GetStudentInfo(ctx *gin.Context) {
	stuID := ctx.Query("stu_id")
	if stuID == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "学号不能为空"})
		return
	}

	student, err := c.studentService.GetStudentInfo(stuID)
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "学生不存在"})
		return
	}

	// 隐藏密码信息
	student.Password = ""

	ctx.JSON(http.StatusOK, gin.H{
		"data": student,
	})
}
