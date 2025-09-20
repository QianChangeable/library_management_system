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
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const label = link.querySelector('.nav-label')?.textContent.trim();
                this.handleNavigation(label);
            });
        });

        // 退出登录
        document.getElementById('logoutBtn').addEventListener('click', () => {
            authManager.logout();
        });

        // 搜索书籍
        document.getElementById('searchBtn').addEventListener('click', () => {
            this.searchBooks();
        });

        // 借阅书籍
        document.getElementById('borrowBtn').addEventListener('click', () => {
            this.borrowBook();
        });

        // 归还书籍
        document.getElementById('returnBtn').addEventListener('click', () => {
            this.returnBook();
        });

        // 回车键支持
        document.getElementById('searchKeyword').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.searchBooks();
        });

        document.getElementById('borrowBookId').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.borrowBook();
        });

        document.getElementById('returnBookId').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.returnBook();
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
            case '找书':
                document.getElementById('searchBookPanel').classList.add('active');
                break;
            case '借书':
                document.getElementById('borrowBookPanel').classList.add('active');
                break;
            case '还书':
                document.getElementById('returnBookPanel').classList.add('active');
                break;
        }
    }

    // 加载用户个人信息
    async loadUserProfile() {
        try {
            const response = await fetch(`http://localhost:8085/student/info?stu_id=${this.currentUser.stu_id}`, {
                headers: authManager.getAuthHeaders()
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
            // 这里需要根据实际API调整，暂时显示加载中
            const recordsContainer = document.getElementById('borrowRecords');
            recordsContainer.innerHTML = '<p class="loading">加载借阅记录中...</p>';
            
            // 模拟借阅记录数据（实际应该从API获取）
            setTimeout(() => {
                recordsContainer.innerHTML = `
                    <div class="record-item">
                        <div class="record-info">
                            <p><strong>书籍编号:</strong> B001</p>
                            <p><strong>书名:</strong> 示例图书</p>
                            <p><strong>借阅日期:</strong> 2024-01-15</p>
                            <p><strong>预计归还:</strong> 2024-03-15</p>
                            <p><strong>状态:</strong> 借阅中</p>
                        </div>
                    </div>
                `;
            }, 1000);
            
        } catch (error) {
            console.error('加载借阅记录失败:', error);
            document.getElementById('borrowRecords').innerHTML = '<p>加载借阅记录失败</p>';
        }
    }

    // 搜索书籍
    async searchBooks() {
        const keyword = document.getElementById('searchKeyword').value.trim();
        if (!keyword) {
            this.showMessage('searchResults', '请输入搜索关键词', 'warning');
            return;
        }

        try {
            const resultsContainer = document.getElementById('searchResults');
            resultsContainer.innerHTML = '<p class="loading">搜索中...</p>';

            const response = await fetch(`http://localhost:8085/books/search?keyword=${encodeURIComponent(keyword)}`, {
                headers: authManager.getAuthHeaders()
            });

            if (!authManager.checkApiResponse(response)) return;

            const data = await response.json();
            
            if (data.data && data.data.length > 0) {
                this.displaySearchResults(data.data);
            } else {
                resultsContainer.innerHTML = '<p>没有找到相关书籍</p>';
            }
        } catch (error) {
            console.error('搜索书籍失败:', error);
            this.showMessage('searchResults', '搜索书籍失败', 'error');
        }
    }

    // 显示搜索结果
    displaySearchResults(books) {
        const resultsContainer = document.getElementById('searchResults');
        resultsContainer.innerHTML = books.map(book => `
            <div class="book-item">
                <h4>${book.title}</h4>
                <div class="book-info">
                    <p><strong>作者:</strong> ${book.author}</p>
                    <p><strong>编号:</strong> ${book.book_id}</p>
                    <p><strong>总数量:</strong> ${book.total_copies}</p>
                    <p><strong>可借数量:</strong> ${book.available_copies}</p>
                </div>
                <div class="book-status">
                    <span class="${book.can_borrow && book.available_copies > 0 ? 'status-available' : 'status-unavailable'}">
                        ${book.can_borrow && book.available_copies > 0 ? '可借阅' : '不可借阅'}
                    </span>
                </div>
                ${book.description ? `<p><strong>简介:</strong> ${book.description}</p>` : ''}
            </div>
        `).join('');
    }

    // 借阅书籍
    async borrowBook() {
        const bookId = document.getElementById('borrowBookId').value.trim();
        if (!bookId) {
            this.showMessage('borrowResult', '请输入书籍编号', 'warning');
            return;
        }

        try {
            const resultContainer = document.getElementById('borrowResult');
            resultContainer.innerHTML = '<p class="loading">借阅中...</p>';

            const response = await fetch('http://localhost:8085/borrow/borrow', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...authManager.getAuthHeaders()
                },
                body: JSON.stringify({
                    stu_id: this.currentUser.stu_id,
                    book_id: bookId
                })
            });

            if (!authManager.checkApiResponse(response)) return;

            const data = await response.json();
            
            if (response.ok) {
                this.showMessage('borrowResult', data.message || '借阅成功', 'success');
                document.getElementById('borrowBookId').value = '';
                // 刷新用户信息
                this.loadUserProfile();
            } else {
                this.showMessage('borrowResult', data.error || '借阅失败', 'error');
            }
        } catch (error) {
            console.error('借阅书籍失败:', error);
            this.showMessage('borrowResult', '借阅书籍失败', 'error');
        }
    }

    // 归还书籍
    async returnBook() {
        const bookId = document.getElementById('returnBookId').value.trim();
        if (!bookId) {
            this.showMessage('returnResult', '请输入书籍编号', 'warning');
            return;
        }

        try {
            const resultContainer = document.getElementById('returnResult');
            resultContainer.innerHTML = '<p class="loading">归还中...</p>';

            const response = await fetch('http://localhost:8085/borrow/return', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...authManager.getAuthHeaders()
                },
                body: JSON.stringify({
                    stu_id: this.currentUser.stu_id,
                    book_id: bookId
                })
            });

            if (!authManager.checkApiResponse(response)) return;

            const data = await response.json();
            
            if (response.ok) {
                let message = data.message || '归还成功';
                if (data.fine_amount > 0) {
                    message += `，产生罚款 ${data.fine_amount}元`;
                }
                this.showMessage('returnResult', message, data.fine_amount > 0 ? 'warning' : 'success');
                document.getElementById('returnBookId').value = '';
                // 刷新用户信息
                this.loadUserProfile();
            } else {
                this.showMessage('returnResult', data.error || '归还失败', 'error');
            }
        } catch (error) {
            console.error('归还书籍失败:', error);
            this.showMessage('returnResult', '归还书籍失败', 'error');
        }
    }

    // 显示消息
    showMessage(containerId, message, type = 'info') {
        const container = document.getElementById(containerId);
        container.innerHTML = `<div class="result-message ${type}">${message}</div>`;
    }

    // API请求封装
    async apiRequest(url, options = {}) {
        try {
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    ...authManager.getAuthHeaders()
                },
                ...options
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
