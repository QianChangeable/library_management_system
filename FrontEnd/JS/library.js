// 图书馆管理系统前端逻辑
class LibraryManager {
    constructor() {
        this.currentUser = authManager.getUserInfo();
        this.init();
    }

    // 初始化
    init() {
        this.bindEvents();
        // 强制加载个人信息（包含借阅记录）
        this.loadUserProfile().catch(err => {
            console.error('初始化数据加载失败:', err);
            document.getElementById('borrowRecords').innerHTML = '<p>加载失败，请刷新页面</p>';
        });
        this.loadBorrowRecords();
    }

    // 绑定事件
    bindEvents() {
        // 导航菜单点击事件
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', e => {
                e.preventDefault();
                const label = link.querySelector('.nav-label')?.textContent.trim();
                this.handleNavigation(label);
            });
        });

        // 退出登录
        document.getElementById('logoutBtn').addEventListener('click', () => {
            authManager.logout();
        });

        // 图书搜索事件
        document.getElementById('searchBooksBtn').addEventListener('click', () => {
            this.searchBooks();
        });

        // 显示所有图书事件
        document.getElementById('showAllBooksBtn').addEventListener('click', () => {
            this.loadAllBooks();
        });

        // 搜索框回车事件
        document.getElementById('bookSearchInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.searchBooks();
            }
        });

        // 模态框关闭事件
        document.getElementById('closeModal').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('cancelBorrowBtn').addEventListener('click', () => {
            this.closeModal();
        });

        // 借书事件
        document.getElementById('borrowBookBtn').addEventListener('click', () => {
            this.borrowBook();
        });

        // 点击模态框外部关闭
        document.getElementById('bookDetailModal').addEventListener('click', (e) => {
            if (e.target === document.getElementById('bookDetailModal')) {
                this.closeModal();
            }
        });
    }

    // 处理导航
    handleNavigation(label) {
        const panels = document.querySelectorAll('.content-panel');
        panels.forEach(panel => panel.classList.remove('active'));

        switch (label) {
            case '个人信息':
                document.getElementById('profilePanel').classList.add('active');
                this.loadUserProfile();
                break;
            case '图书':
                document.getElementById('bookPanel').classList.add('active');
                this.loadAllBooks();
                break;
        }
    }

    // 加载用户个人信息
    async loadUserProfile() {
        try {
            const response = await fetch(`http://localhost:8085/student/info?stu_id=${this.currentUser.stu_id}`, {
                headers: authManager.getAuthHeaders(),
            });

            if (!authManager.checkApiResponse(response)) return;

            const data = await response.json();

            if (data.data) {
                this.displayUserInfo(data.data);
                this.loadBorrowRecords();
            }
        } catch (error) {
            console.error('加载用户信息失败:', error);
            this.showMessage('profilePanel', '加载用户信息失败', 'error');
        }
    }

    // 显示用户信息
    displayUserInfo(userInfo) {
        document.getElementById('stuId').textContent = userInfo.stu_id;
        document.getElementById('stuName').textContent = userInfo.name;
        document.getElementById('trustLevel').textContent = userInfo.trust || '0';

        const canBorrow = userInfo.can_borrow !== false;
        document.getElementById('borrowStatus').textContent = canBorrow ? '可借阅' : '不可借阅';
        document.getElementById('borrowStatus').style.color = canBorrow ? '#28a745' : '#dc3545';
    }

    // 加载借阅记录
    async loadBorrowRecords() {
        try {
            const recordsContainer = document.getElementById('borrowRecords');
            recordsContainer.innerHTML = '<p class="loading">加载借阅记录中...</p>';

            const response = await fetch(`http://localhost:8085/borrow/records?stu_id=${this.currentUser.stu_id}`, {
                headers: authManager.getAuthHeaders(),
            });

            if (!authManager.checkApiResponse(response)) return;

            const data = await response.json();
            if (data.data && data.data.length > 0) {
                this.displayBorrowRecords(data.data);
            } else {
                recordsContainer.innerHTML = '<p class="result-message">暂无借阅记录</p>';
            }
        } catch (error) {
            console.error('加载借阅记录失败:', error);
            document.getElementById('borrowRecords').innerHTML = '<p class="result-message error">加载借阅记录失败</p>';
        }
    }

    // 显示借阅记录
    displayBorrowRecords(records) {
        const recordsContainer = document.getElementById('borrowRecords');
        
        const recordsHTML = records.map(record => {
            const borrowDate = new Date(record.borrow_date).toLocaleDateString();
            const dueDate = new Date(record.due_date).toLocaleDateString();
            const isOverdue = record.is_overdue;
            const fineAmount = record.fine_amount || 0;
            const bookTitle = record.book_title || '未知图书';
            const bookAuthor = record.book_author || '未知作者';
            
            return `
                <div class="record-item ${isOverdue ? 'overdue' : ''}">
                    <div class="record-info">
                        <p><strong>书名:</strong> ${bookTitle}</p>
                        <p><strong>作者:</strong> ${bookAuthor}</p>
                        <p><strong>书籍编号:</strong> ${record.book_id}</p>
                        <p><strong>借阅日期:</strong> ${borrowDate}</p>
                        <p><strong>预计归还:</strong> ${dueDate}</p>
                        <p><strong>状态:</strong> 
                            <span class="status ${isOverdue ? 'unavailable' : 'available'}">
                                ${isOverdue ? '已逾期' : '借阅中'}
                            </span>
                        </p>
                        ${fineAmount > 0 ? `<p><strong>罚款金额:</strong> ¥${fineAmount.toFixed(2)}</p>` : ''}
                    </div>
                    <div class="record-actions">
                        <button class="return-btn" onclick="libraryManager.returnBook('${record.book_id}')">
                            还书
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        recordsContainer.innerHTML = recordsHTML;
    }


    

    // 加载所有图书
    async loadAllBooks() {
        const bookList = document.getElementById('bookList');
        bookList.innerHTML = '<p class="loading">加载图书中...</p>';

        try {
            const response = await fetch('http://localhost:8085/books/list', {
                headers: authManager.getAuthHeaders(),
            });

            // 检查响应状态
            if (!response.ok) {
                const errorData = await response.json();
                const errorMessage = errorData.error || '加载失败';
                bookList.innerHTML = `<p class="result-message error">加载图书失败：${errorMessage}</p>`;
                return;
            }

            if (!authManager.checkApiResponse(response)) return;

            const data = await response.json();
            if (data.data && data.data.length > 0) {
                this.displayBooks(data.data);
            } else {
                bookList.innerHTML = '<p class="result-message">暂无图书数据</p>';
            }
        } catch (error) {
            console.error('加载图书失败:', error);
            bookList.innerHTML = '<p class="result-message error">加载图书失败：网络错误，请检查网络连接后重试</p>';
        }
    }

    // 搜索图书
    async searchBooks() {
        const keyword = document.getElementById('bookSearchInput').value.trim();
        if (!keyword) {
            this.showMessage('bookPanel', '请输入搜索关键词', 'warning');
            return;
        }

        const bookList = document.getElementById('bookList');
        bookList.innerHTML = '<p class="loading">搜索中...</p>';

        try {
            const response = await fetch(`http://localhost:8085/books/search?keyword=${encodeURIComponent(keyword)}`, {
                headers: authManager.getAuthHeaders(),
            });

            // 检查响应状态
            if (!response.ok) {
                const errorData = await response.json();
                const errorMessage = errorData.error || '搜索失败';
                bookList.innerHTML = `<p class="result-message error">搜索失败：${errorMessage}</p>`;
                return;
            }

            if (!authManager.checkApiResponse(response)) return;

            const data = await response.json();
            if (data.data && data.data.length > 0) {
                this.displayBooks(data.data);
            } else {
                bookList.innerHTML = '<p class="result-message">未找到相关图书，请尝试其他关键词</p>';
            }
        } catch (error) {
            console.error('搜索图书失败:', error);
            bookList.innerHTML = '<p class="result-message error">搜索失败：网络错误，请检查网络连接后重试</p>';
        }
    }

    // 显示图书列表
    displayBooks(books) {
        const bookList = document.getElementById('bookList');
        
        if (!books || books.length === 0) {
            bookList.innerHTML = '<p class="result-message">暂无图书</p>';
            return;
        }

        const booksHTML = books.map(book => `
            <div class="book-card" data-book-id="${book.book_id}">
                <h4>${book.title}</h4>
                <div class="author">作者: ${book.author}</div>
                <div class="description">${book.description || '暂无描述'}</div>
                <div class="book-meta">
                    <div class="copies-info">
                        库存: ${book.available_copies}/${book.total_copies}
                    </div>
                    <div class="status ${book.available_copies > 0 && book.can_borrow ? 'available' : 'unavailable'}">
                        ${book.available_copies > 0 && book.can_borrow ? '可借阅' : '不可借阅'}
                    </div>
                </div>
                <button class="view-detail-btn" onclick="libraryManager.showBookDetail('${book.book_id}')">
                    查看详情
                </button>
            </div>
        `).join('');

        bookList.innerHTML = booksHTML;
    }

    // 显示图书详情
    async showBookDetail(bookId) {
        try {
            const response = await fetch(`http://localhost:8085/books/${bookId}`, {
                headers: authManager.getAuthHeaders(),
            });

            // 检查响应状态
            if (!response.ok) {
                const errorData = await response.json();
                const errorMessage = errorData.error || '获取详情失败';
                this.showMessage('bookPanel', `获取图书详情失败：${errorMessage}`, 'error');
                return;
            }

            if (!authManager.checkApiResponse(response)) return;

            const data = await response.json();
            if (data.data) {
                this.displayBookDetail(data.data);
                this.currentBookId = bookId;
                this.showModal();
            } else {
                this.showMessage('bookPanel', '图书详情不存在', 'error');
            }
        } catch (error) {
            console.error('获取图书详情失败:', error);
            this.showMessage('bookPanel', '获取图书详情失败：网络错误，请检查网络连接后重试', 'error');
        }
    }

    // 显示图书详情内容
    displayBookDetail(book) {
        document.getElementById('modalBookTitle').textContent = book.title;
        
        const detailContent = document.getElementById('bookDetailContent');
        detailContent.innerHTML = `
            <div class="book-detail">
                <div class="detail-row">
                    <div class="detail-label">图书编号:</div>
                    <div class="detail-value">${book.book_id}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">书名:</div>
                    <div class="detail-value">${book.title}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">作者:</div>
                    <div class="detail-value">${book.author}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">总数量:</div>
                    <div class="detail-value">${book.total_copies}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">可借数量:</div>
                    <div class="detail-value">${book.available_copies}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">借阅状态:</div>
                    <div class="detail-value">
                        <span class="status ${book.available_copies > 0 && book.can_borrow ? 'available' : 'unavailable'}">
                            ${book.available_copies > 0 && book.can_borrow ? '可借阅' : '不可借阅'}
                        </span>
                    </div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">添加时间:</div>
                    <div class="detail-value">${new Date(book.created_at).toLocaleDateString()}</div>
                </div>
                <div class="detail-row description">
                    <div class="detail-label">图书描述:</div>
                    <div class="detail-value">${book.description || '暂无描述'}</div>
                </div>
            </div>
        `;

        // 设置借书按钮状态
        const borrowBtn = document.getElementById('borrowBookBtn');
        if (book.available_copies > 0 && book.can_borrow) {
            borrowBtn.disabled = false;
            borrowBtn.textContent = '借阅此书';
        } else {
            borrowBtn.disabled = true;
            borrowBtn.textContent = '暂不可借阅';
        }
    }

    // 借书功能
    async borrowBook() {
        if (!this.currentBookId) {
            this.showMessage('bookPanel', '请选择要借阅的图书', 'warning');
            return;
        }

        const borrowBtn = document.getElementById('borrowBookBtn');
        const originalText = borrowBtn.textContent;
        borrowBtn.disabled = true;
        borrowBtn.textContent = '借阅中...';

        try {
            const response = await fetch('http://localhost:8085/borrow/borrow', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...authManager.getAuthHeaders(),
                },
                body: JSON.stringify({
                    stu_id: this.currentUser.stu_id,
                    book_id: this.currentBookId
                })
            });

            // 检查响应状态
            if (!response.ok) {
                const errorData = await response.json();
                const errorMessage = errorData.error || '借书失败';
                
                // 先关闭借书窗口
                this.closeModal();
                
                // 处理特定的错误情况
                if (errorMessage.includes('学生借阅权限已被禁用')) {
                    this.showMessage('bookPanel', '借阅失败：您的借阅权限已被禁用，可能由于逾期未还书或未支付罚款。请先归还逾期图书或支付罚款后重试。', 'error');
                } else if (errorMessage.includes('书籍不可借阅或已全部借出')) {
                    this.showMessage('bookPanel', '借阅失败：该图书暂不可借阅或已全部借出，请选择其他图书。', 'error');
                } else if (errorMessage.includes('已达到最大借阅数量')) {
                    this.showMessage('bookPanel', '借阅失败：您已达到最大借阅数量限制，请先归还部分图书。', 'error');
                } else {
                    this.showMessage('bookPanel', `借阅失败：${errorMessage}`, 'error');
                }
                return;
            }

            if (!authManager.checkApiResponse(response)) return;

            const data = await response.json();
            this.showMessage('bookPanel', data.message || '借书成功', 'success');
            this.closeModal();
            
            // 刷新图书列表
            this.loadAllBooks();
            
            // 刷新用户信息（可能影响借阅状态）
            this.loadUserProfile();
        } catch (error) {
            console.error('借书失败:', error);
            // 先关闭借书窗口
            this.closeModal();
            this.showMessage('bookPanel', '借书失败：网络错误，请检查网络连接后重试', 'error');
        } finally {
            borrowBtn.disabled = false;
            borrowBtn.textContent = originalText;
        }
    }

    // 显示模态框
    showModal() {
        document.getElementById('bookDetailModal').classList.add('show');
    }

    // 关闭模态框
    closeModal() {
        document.getElementById('bookDetailModal').classList.remove('show');
        this.currentBookId = null;
    }

    // 还书功能
    async returnBook(bookId) {
        if (!confirm('确认要归还这本书吗？')) {
            return;
        }

        try {
            const response = await fetch('http://localhost:8085/borrow/return', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...authManager.getAuthHeaders(),
                },
                body: JSON.stringify({
                    stu_id: this.currentUser.stu_id,
                    book_id: bookId
                })
            });

            // 检查响应状态
            if (!response.ok) {
                const errorData = await response.json();
                const errorMessage = errorData.error || '还书失败';
                
                // 处理特定的错误情况
                if (errorMessage.includes('借阅记录不存在')) {
                    this.showMessage('profilePanel', '还书失败：未找到该借阅记录，可能已经归还或记录有误', 'error');
                } else if (errorMessage.includes('图书不存在')) {
                    this.showMessage('profilePanel', '还书失败：图书信息不存在，请联系管理员', 'error');
                } else {
                    this.showMessage('profilePanel', `还书失败：${errorMessage}`, 'error');
                }
                return;
            }

            if (!authManager.checkApiResponse(response)) return;

            const data = await response.json();
            
            // 显示还书结果
            if (data.fine_amount && data.fine_amount > 0) {
                this.showMessage('profilePanel', `${data.message}，罚款金额：¥${data.fine_amount.toFixed(2)}。请注意：逾期罚款可能影响您的借阅权限。`, 'warning');
            } else {
                this.showMessage('profilePanel', data.message || '还书成功', 'success');
            }
            
            // 刷新借阅记录
            this.loadBorrowRecords();
            
            // 刷新用户信息（可能影响借阅状态）
            this.loadUserProfile();
            
        } catch (error) {
            console.error('还书失败:', error);
            this.showMessage('profilePanel', '还书失败：网络错误，请检查网络连接后重试', 'error');
        }
    }

    // 显示消息
    showMessage(panelId, message, type = 'info') {
        const panel = document.getElementById(panelId);
        const messageDiv = document.createElement('div');
        messageDiv.className = `result-message ${type}`;
        messageDiv.textContent = message;
        
        // 插入到面板顶部
        panel.insertBefore(messageDiv, panel.firstChild);
        
        // 3秒后自动移除
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 3000);
    }

    // API请求封装
    async apiRequest(url, options = {}) {
        try {
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    ...authManager.getAuthHeaders(),
                },
                ...options,
            });

            if (!authManager.checkApiResponse(response)) return null;

            return await response.json();
        } catch (error) {
            console.error('API请求失败:', error);
            return null;
        }
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    if (!authManager.checkLoginStatus()) {
        return;
    }

    // 初始化图书馆管理器
    window.libraryManager = new LibraryManager();

    console.log('图书馆管理系统初始化完成');
});

