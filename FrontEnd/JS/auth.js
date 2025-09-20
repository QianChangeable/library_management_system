// 认证状态管理
class AuthManager {
    constructor() {
        this.isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
        this.userInfo = this.getUserInfo();
        console.log('AuthManager初始化 - 登录状态:', this.isLoggedIn);
    }

    // 获取用户信息
    getUserInfo() {
        const userInfoStr = sessionStorage.getItem('userInfo');
        return userInfoStr ? JSON.parse(userInfoStr) : null;
    }

    // 检查登录状态
    checkLoginStatus() {
        console.log('检查登录状态:', this.isLoggedIn);
        if (!this.isLoggedIn || !this.userInfo) {
            // 未登录，跳转到登录页
            console.log('未登录，跳转到登录页');
            window.location.href = 'index.html';
            return false;
        }
        return true;
    }

    // 登出
    logout() {
        console.log('登出函数被调用');

        // 清除sessionStorage
        sessionStorage.removeItem('isLoggedIn');
        sessionStorage.removeItem('userInfo');
        console.log('sessionStorage已清除');

        // 清除localStorage
        localStorage.removeItem('savedStuID');
        localStorage.removeItem('savedPassword');
        console.log('localStorage已清除');

        // 验证是否已清除
        console.log('验证登出状态:', sessionStorage.getItem('isLoggedIn'));

        // 强制跳转
        setTimeout(() => {
            console.log('准备跳转到登录页');
            window.location.assign('index.html');
            // 如果assign失败，尝试replace
            setTimeout(() => {
                if (window.location.pathname.includes('house.html')) {
                    console.log('使用replace再次尝试跳转');
                    window.location.replace('index.html');
                }
            }, 500);
        }, 100);
    }

    // 获取认证头
    getAuthHeaders() {
        return {
            'Content-Type': 'application/json',
        };
    }

    // 检查API响应是否需要重新登录
    checkApiResponse(response) {
        if (response.status === 401) {
            this.logout();
            return false;
        }
        return true;
    }

    // 更新用户信息显示
    updateUserDisplay() {
        // 可以在这里更新页面上的用户信息显示
    }
}

// 全局认证管理器
const authManager = new AuthManager();

// 页面加载时检查登录状态
document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM加载完成，当前页面:', window.location.pathname);

    // 检查当前是否为house.html页面
    if (window.location.pathname.includes('house.html')) {
        console.log('在house.html页面，检查登录状态');
        if (!authManager.checkLoginStatus()) {
            return;
        }
        authManager.updateUserDisplay();

        // 查找并绑定登出按钮
        console.log('开始查找登出按钮');
        const allNavLinks = document.querySelectorAll('.nav-link');
        console.log('找到的.nav-link元素数量:', allNavLinks.length);

        allNavLinks.forEach((link, index) => {
            const labelElement = link.querySelector('.nav-label');
            if (labelElement) {
                const labelText = labelElement.textContent.trim();
                console.log(`元素${index}的文本内容: "${labelText}"`);

                if (labelText === 'Sign Out') {
                    console.log('找到登出按钮，绑定点击事件');
                    // 先移除可能存在的旧事件
                    link.removeEventListener('click', handleLogoutClick);
                    // 添加新事件
                    link.addEventListener('click', handleLogoutClick);

                    // 为了测试，给登出按钮添加一个视觉标识
                    link.style.backgroundColor = 'rgba(255, 0, 0, 0.1)';
                }
            }
        });
    }
});

// 登出点击事件处理函数
function handleLogoutClick(e) {
    console.log('登出按钮被点击');
    e.preventDefault();
    e.stopPropagation(); // 阻止事件冒泡
    authManager.logout();
}

