package controller

import (
	"backend/service"
	"net/http"

	"github.com/gin-gonic/gin"
)

type BookController struct {
	bookService *service.BookService
}

func NewBookController(bookService *service.BookService) *BookController {
	return &BookController{bookService: bookService}
}

// 查找书籍
func (c *BookController) SearchBooks(ctx *gin.Context) {
	keyword := ctx.Query("keyword")
	if keyword == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "请输入搜索关键词"})
		return
	}

	books, err := c.bookService.SearchBooks(keyword)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"data": books,
	})
}

// 获取书籍详情
func (c *BookController) GetBookDetail(ctx *gin.Context) {
	bookID := ctx.Param("id")
	if bookID == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "书籍ID不能为空"})
		return
	}

	book, err := c.bookService.GetBookDetail(bookID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"data": book,
	})
}
