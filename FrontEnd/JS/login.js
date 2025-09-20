// 登录功能实现
document.addEventListener('DOMContentLoaded', function() {
    const loginBtn = document.getElementById('loginBtn');
    const stuIDInput = document.getElementById('stuID');
    const passwordInput = document.getElementById('password');
    const rememberMeCheckbox = document.getElementById('rememberMe');
    const errorMessage = document.getElementById('errorMessage');

    // 检查是否有保存的登录信息
    const savedStuID = localStorage.getItem('savedStuID');
    const savedPassword = localStorage.getItem('savedPassword');
    
    if (savedStuID && savedPassword) {
        stuIDInput.value = savedStuID;
        passwordInput.value = savedPassword;
        rememberMeCheckbox.checked = true;
    }

    loginBtn.addEventListener('click', handleLogin);

    // 支持回车键登录
    passwordInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleLogin();
        }
    });

    function handleLogin() {
        const stuID = stuIDInput.value.trim();
        const password = passwordInput.value.trim();

        // 验证输入
        if (!stuID || !password) {
            showError('学号和密码不能为空');
            return;
        }

        // 显示加载状态
        loginBtn.textContent = '登录中...';
        loginBtn.disabled = true;

        // 发送登录请求
        fetch('http://localhost:8085/student/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                stu_id: stuID,
                password: password
            })
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(errorData => {
                    throw new Error(errorData.error || '登录失败');
                });
            }
            return response.json();
        })
        .then(data => {
            // 登录成功
            if (rememberMeCheckbox.checked) {
                localStorage.setItem('savedStuID', stuID);
                localStorage.setItem('savedPassword', password);
            } else {
                localStorage.removeItem('savedStuID');
                localStorage.removeItem('savedPassword');
            }

            // 保存用户信息到sessionStorage
            sessionStorage.setItem('userInfo', JSON.stringify(data.data));
            sessionStorage.setItem('isLoggedIn', 'true');

            // 跳转到主页面
            window.location.href = 'house.html';
        })
        .catch(error => {
            showError(error.message);
        })
        .finally(() => {
            // 恢复按钮状态
            loginBtn.textContent = 'Login';
            loginBtn.disabled = false;
        });
    }

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        
        // 3秒后隐藏错误信息
        setTimeout(() => {
            errorMessage.style.display = 'none';
        }, 3000);
    }

    // 检查登录状态，如果已登录则直接跳转
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (isLoggedIn === 'true') {
        window.location.href = 'house.html';
    }
});
