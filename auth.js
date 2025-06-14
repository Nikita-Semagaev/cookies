document.addEventListener('DOMContentLoaded', function() {
    // Проверка авторизации при загрузке страницы
    function checkAuthStatus() {
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        
        // Если пользователь не авторизован, но пытается получить доступ к защищенным страницам
        if (!isLoggedIn || !currentUser) {
            const protectedPages = ['my_tickets.html', 'admin.html'];
            const currentPage = window.location.pathname.split('/').pop();
            
            if (protectedPages.includes(currentPage)) {
                window.location.href = 'index.html';
                return;
            }
        }
    }

    // Вызываем проверку авторизации при загрузке страницы
    checkAuthStatus();

    // Обработка формы входа
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            try {
                // Проверка на администратора
                if (email === 'admin@mail.ru' && password === 'admin123') {
                    localStorage.setItem('isLoggedIn', 'true');
                    localStorage.setItem('userEmail', email);
                    localStorage.setItem('isAdmin', 'true');
                    localStorage.setItem('currentUser', JSON.stringify({ username: 'Admin', email: email }));
                    window.location.href = 'admin.html';
                    return;
                }
                
                // Для обычных пользователей
                const users = JSON.parse(localStorage.getItem('users')) || [];
                const user = users.find(u => u.email === email);

                if (!user) {
                    alert('Пользователь с таким email не найден');
                    return;
                }

                if (user.password !== password) {
                    alert('Неверный пароль');
                    return;
                }

                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('userEmail', user.email);
                localStorage.setItem('userName', user.name);
                localStorage.setItem('isAdmin', 'false');
                localStorage.setItem('currentUser', JSON.stringify({ username: user.name, email: user.email }));
                
                window.location.href = 'index.html';
            } catch (error) {
                console.error('Login error:', error);
                alert('Ошибка при входе. Проверьте правильность данных.');
            }
        });
    }

    // Обработка формы регистрации
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value.trim();
            const confirmPassword = document.getElementById('confirmPassword').value.trim();

            // Проверка на пустые поля
            if (!name || !email || !password || !confirmPassword) {
                alert('Пожалуйста, заполните все поля');
                return;
            }
            
            // Проверка email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert('Пожалуйста, введите корректный email');
                return;
            }

            // Проверка длины пароля
            if (password.length < 6) {
                alert('Пароль должен содержать минимум 6 символов');
                return;
            }

            // Проверка совпадения паролей
            if (password !== confirmPassword) {
                alert('Пароли не совпадают');
                return;
            }
            
            try {
                let users = JSON.parse(localStorage.getItem('users')) || [];

                // Проверяем, существует ли пользователь с таким именем или email
                if (users.some(u => u.email === email)) { // Using email as primary identifier
                    alert('Пользователь с таким email уже существует');
                    return;
                }

                const newUser = {
                    name,
                    email,
                    password
                };

                users.push(newUser);
                localStorage.setItem('users', JSON.stringify(users));

                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('userEmail', email);
                localStorage.setItem('userName', name);
                localStorage.setItem('isAdmin', 'false');
                localStorage.setItem('currentUser', JSON.stringify({ username: name, email: email }));
                
                window.location.href = 'index.html';
            } catch (error) {
                console.error('Registration error:', error);
                alert('Ошибка при регистрации. Попробуйте позже.');
            }
        });
    }

    // Проверка состояния авторизации
    function checkAuth() {
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        const isAdmin = localStorage.getItem('isAdmin') === 'true';
        const loginLink = document.getElementById('loginLink');
        const myTicketsLink = document.getElementById('myTicketsLink');
        const logoutLink = document.getElementById('logoutLink');
        
        if (isLoggedIn) {
            if (loginLink) loginLink.style.display = 'none';
            if (myTicketsLink) myTicketsLink.style.display = 'block';
            if (logoutLink) logoutLink.style.display = 'block';
            
            // Добавляем ссылку на админ-панель для администратора
            if (isAdmin) {
                const navList = loginLink.closest('ul');
                if (navList && !navList.querySelector('.admin-panel-link')) {
                    const adminLink = document.createElement('li');
                    adminLink.className = 'admin-panel-link';
                    adminLink.innerHTML = '<a href="admin.html" style="color:#e50914;font-weight:700;">Админ-панель</a>';
                    navList.appendChild(adminLink);
                }
            }
            
            if (logoutLink) {
                logoutLink.addEventListener('click', function(e) {
                    e.preventDefault();
                    if (confirm('Вы хотите выйти?')) {
                        localStorage.removeItem('isLoggedIn');
                        localStorage.removeItem('userEmail');
                        localStorage.removeItem('userName');
                        localStorage.removeItem('isAdmin');
                        localStorage.removeItem('currentUser');
                        window.location.href = 'index.html';
                    }
                });
            }
        } else {
            if (loginLink) loginLink.style.display = 'block';
            if (myTicketsLink) myTicketsLink.style.display = 'none';
            if (logoutLink) logoutLink.style.display = 'none';
        }
    }

    // Проверка доступа к админ-панели
    function checkAdminAccess() {
        const isAdmin = localStorage.getItem('isAdmin') === 'true';
        if (window.location.pathname.includes('admin.html') && !isAdmin) {
            alert('У вас нет доступа к админ-панели');
            window.location.href = 'index.html';
        }
    }

    // Проверяем состояние авторизации при загрузке страницы
    checkAuth();
    checkAdminAccess();
}); 