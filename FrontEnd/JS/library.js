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
