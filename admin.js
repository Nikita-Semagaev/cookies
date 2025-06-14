document.addEventListener('DOMContentLoaded', function() {
    // Проверка прав администратора
    if (localStorage.getItem('isAdmin') !== 'true') {
        window.location.href = 'index.html';
        return;
    }

    // Инициализация пустых массивов данных
    let movies = [];
    let schedule = [];
    let users = [];

    // Загрузка данных из localStorage, если они есть
    const savedMovies = localStorage.getItem('movies');
    const savedSchedule = localStorage.getItem('schedule');
    const savedUsers = localStorage.getItem('users');

    if (savedMovies) movies = JSON.parse(savedMovies);
    if (savedSchedule) schedule = JSON.parse(savedSchedule);
    if (savedUsers) users = JSON.parse(savedUsers);

    // Миграция данных фильмов: добавляем недостающие поля
    function migrateMovies() {
        let changed = false;
        movies = movies.map(movie => {
            let updated = { ...movie };
            if (typeof updated.genre === 'undefined') { updated.genre = ''; changed = true; }
            if (typeof updated.duration === 'undefined') { updated.duration = ''; changed = true; }
            if (typeof updated.description === 'undefined') { updated.description = ''; changed = true; }
            if (typeof updated.full_description === 'undefined') { updated.full_description = ''; changed = true; }
            if (typeof updated.poster === 'undefined') { updated.poster = ''; changed = true; }
            if (typeof updated.background === 'undefined') { updated.background = ''; changed = true; }
            if (typeof updated.rating === 'undefined') { updated.rating = ''; changed = true; }
            if (typeof updated.year === 'undefined') { updated.year = ''; changed = true; }
            return updated;
        });
        if (changed) {
            localStorage.setItem('movies', JSON.stringify(movies));
        }
    }

    migrateMovies();

    console.log('Текущие фильмы в localStorage:', movies);

    // Функции для работы с фильмами
    function renderMovies() {
        const moviesList = document.getElementById('moviesList');
        if (movies.length === 0) {
            moviesList.innerHTML = '<p class="empty-message">Нет добавленных фильмов</p>';
            return;
        }

        moviesList.innerHTML = movies.map(movie => `
            <div class="movie-item">
                <div class="item-info">
                    <h3>${movie.title}</h3>
                    <p>Жанр: ${movie.genre ? movie.genre : 'Не указан'}</p>
                    <p>Длительность: ${movie.duration ? movie.duration + ' мин' : 'Не указана'}</p>
                    <p>Год: ${movie.year ? movie.year : 'Не указан'}</p>
                    <p>Рейтинг: ${movie.rating ? movie.rating : 'Не указан'}</p>
                    <p class="description">${movie.description || ''}</p>
                </div>
                <div class="item-actions">
                    <button class="edit-btn" data-id="${movie.id}">Редактировать</button>
                    <button class="delete-btn" data-id="${movie.id}">Удалить</button>
                </div>
            </div>
        `).join('');

        // Обновляем список фильмов в форме расписания
        const movieSelect = document.getElementById('scheduleMovie');
        if (movieSelect) {
            if (movies.length === 0) {
                movieSelect.innerHTML = '<option value="">Нет доступных фильмов</option>';
            } else {
                movieSelect.innerHTML = movies.map(movie => 
                    `<option value="${movie.id}">${movie.title}</option>`
                ).join('');
            }
        }
    }

    function addMovie(movie) {
        movie.id = Date.now().toString();
        // Гарантируем наличие всех нужных полей
        movie = {
            title: movie.title || '',
            genre: movie.genre || '',
            duration: movie.duration || '',
            description: movie.description || '',
            full_description: movie.full_description || '',
            poster: movie.poster || '',
            background: movie.background || '',
            rating: movie.rating || '',
            year: movie.year || '',
            id: movie.id
        };
        movies.push(movie);
        localStorage.setItem('movies', JSON.stringify(movies));
        renderMovies();
    }

    function updateMovie(id, updatedMovie) {
        const index = movies.findIndex(movie => movie.id === id);
        if (index !== -1) {
            movies[index] = { ...movies[index], ...updatedMovie };
            localStorage.setItem('movies', JSON.stringify(movies));
            renderMovies();
        }
    }

    function deleteMovie(id) {
        movies = movies.filter(movie => movie.id !== id);
        localStorage.setItem('movies', JSON.stringify(movies));
        renderMovies();
    }

    // Функции для работы с расписанием
    function renderSchedule() {
        const scheduleList = document.getElementById('scheduleList');
        if (schedule.length === 0) {
            scheduleList.innerHTML = '<p class="empty-message">Нет добавленных сеансов</p>';
            return;
        }

        scheduleList.innerHTML = schedule.map(session => {
            const movie = movies.find(m => m.id === session.movieId);
            return `
                <div class="schedule-item">
                    <div class="item-info">
                        <h3>${movie ? movie.title : 'Фильм не найден'}</h3>
                        <p>Дата: ${session.date}</p>
                        <p>Время: ${session.time}</p>
                        <p>Зал: ${session.hall}</p>
                        <p>Цена: ${session.price} ₽</p>
                    </div>
                    <div class="item-actions">
                        <button class="edit-btn" data-id="${session.id}">Редактировать</button>
                        <button class="delete-btn" data-id="${session.id}">Удалить</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    function addSchedule(session) {
        session.id = Date.now().toString();
        schedule.push(session);
        localStorage.setItem('schedule', JSON.stringify(schedule));
        renderSchedule();
    }

    function updateSchedule(id, updatedSession) {
        const index = schedule.findIndex(session => session.id === id);
        if (index !== -1) {
            schedule[index] = { ...schedule[index], ...updatedSession };
            localStorage.setItem('schedule', JSON.stringify(schedule));
            renderSchedule();
        }
    }

    function deleteSchedule(id) {
        schedule = schedule.filter(session => session.id !== id);
        localStorage.setItem('schedule', JSON.stringify(schedule));
        renderSchedule();
    }

    // Функции для работы с пользователями
    function renderUsers() {
        const usersList = document.getElementById('usersList');
        if (users.length === 0) {
            usersList.innerHTML = '<p class="empty-message">Нет зарегистрированных пользователей</p>';
            return;
        }

        usersList.innerHTML = users.map(user => `
            <div class="user-item">
                <div class="item-info">
                    <h3>${user.name}</h3>
                    <p>Email: ${user.email}</p>
                </div>
                <div class="item-actions">
                    <button class="delete-btn" data-id="${user.id}">Удалить</button>
                </div>
            </div>
        `).join('');
    }

    // Обработчики событий для фильмов
    const movieForm = document.getElementById('movieForm');
    const movieModal = document.getElementById('movieModal');
    const addMovieBtn = document.getElementById('addMovieBtn');

    if (movieForm) {
        movieForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(movieForm);
            const movieData = Object.fromEntries(formData.entries());
            const movieId = document.getElementById('movieId').value;

            // Гарантируем наличие всех нужных полей
            const fullMovieData = {
                title: movieData.title || '',
                genre: movieData.genre || '',
                duration: movieData.duration || '',
                description: movieData.description || '',
                full_description: movieData.full_description || '',
                poster: movieData.poster || '',
                background: movieData.background || '',
                rating: movieData.rating || '',
                year: movieData.year || '',
            };

            if (movieId) {
                updateMovie(movieId, fullMovieData);
            } else {
                addMovie(fullMovieData);
            }

            movieModal.style.display = 'none';
            movieForm.reset();
        });
    }

    if (movieModal) {
        // Открытие модального окна для добавления фильма
        if (addMovieBtn) {
            addMovieBtn.addEventListener('click', function() {
                if (scheduleModal) {
                    scheduleModal.style.display = 'none';
                    scheduleModal.classList.remove('active');
                }
                if (movieModal) {
                    movieModal.style.display = 'flex';
                    movieModal.classList.add('active');
                }
                document.getElementById('modalTitle').textContent = 'Добавить фильм';
                document.getElementById('movieId').value = '';
                movieForm.reset();
            });
        }

        // Закрытие модального окна
        const closeButtons = movieModal.querySelectorAll('.close');
        closeButtons.forEach(button => {
            button.addEventListener('click', function() {
                movieModal.style.display = 'none';
                movieModal.classList.remove('active');
            });
        });

        // Закрытие по клику вне модального окна
        window.addEventListener('click', function(e) {
            if (e.target === movieModal) {
                movieModal.style.display = 'none';
                movieModal.classList.remove('active');
            }
        });
    }

    // Обработчики событий для расписания
    const scheduleForm = document.getElementById('scheduleForm');
    const scheduleModal = document.getElementById('scheduleModal');
    const addScheduleBtn = document.getElementById('addScheduleBtn');

    if (scheduleForm) {
        scheduleForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(scheduleForm);
            const scheduleData = Object.fromEntries(formData.entries());
            const scheduleId = document.getElementById('scheduleId').value;

            if (scheduleId) {
                updateSchedule(scheduleId, scheduleData);
            } else {
                addSchedule(scheduleData);
            }

            scheduleModal.style.display = 'none';
            scheduleForm.reset();
        });
    }

    if (scheduleModal) {
        if (addScheduleBtn) {
            addScheduleBtn.addEventListener('click', function() {
                if (movieModal) {
                    movieModal.style.display = 'none';
                    movieModal.classList.remove('active');
                }
                if (scheduleModal) {
                    scheduleModal.style.display = 'flex';
                    scheduleModal.classList.add('active');
                }
                document.getElementById('scheduleModalTitle').textContent = 'Добавить сеанс';
                document.getElementById('scheduleId').value = '';
                scheduleForm.reset();
            });
        }
    }

    // Обработчики для кнопок закрытия модальных окон
    document.querySelectorAll('.close').forEach(button => {
        button.addEventListener('click', function() {
            this.closest('.modal').classList.remove('active');
        });
    });

    // Обработчики для кнопок редактирования и удаления
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('edit-btn')) {
            const id = e.target.dataset.id;
            const item = movies.find(movie => movie.id === id) || 
                        schedule.find(session => session.id === id);

            if (item) {
                if ('duration' in item) { // Это фильм
                    if (scheduleModal) {
                        scheduleModal.style.display = 'none';
                        scheduleModal.classList.remove('active');
                    }
                    if (movieModal) {
                        movieModal.style.display = 'flex';
                        movieModal.classList.add('active');
                    }
                    document.getElementById('modalTitle').textContent = 'Редактировать фильм';
                    document.getElementById('movieId').value = item.id;
                    document.getElementById('movieTitle').value = item.title || '';
                    document.getElementById('movieGenre').value = item.genre || '';
                    document.getElementById('movieDuration').value = item.duration || '';
                    document.getElementById('movieDescription').value = item.description || '';
                    document.getElementById('movieFullDescription').value = item.full_description || '';
                    document.getElementById('moviePoster').value = item.poster || '';
                    document.getElementById('movieBackground').value = item.background || '';
                    document.getElementById('movieRating').value = item.rating || '';
                    document.getElementById('movieYear').value = item.year || '';
                } else { // Это сеанс
                    if (movieModal) {
                        movieModal.style.display = 'none';
                        movieModal.classList.remove('active');
                    }
                    if (scheduleModal) {
                        scheduleModal.style.display = 'flex';
                        scheduleModal.classList.add('active');
                    }
                    document.getElementById('scheduleModalTitle').textContent = 'Редактировать сеанс';
                    document.getElementById('scheduleId').value = item.id;
                    document.getElementById('scheduleMovie').value = item.movieId;
                    document.getElementById('scheduleDate').value = item.date;
                    document.getElementById('scheduleTime').value = item.time;
                    document.getElementById('scheduleHall').value = item.hall;
                    document.getElementById('schedulePrice').value = item.price;
                }
            }
        }

        if (e.target.classList.contains('delete-btn')) {
            const id = e.target.dataset.id;
            if (confirm('Вы уверены, что хотите удалить этот элемент?')) {
                if (movies.find(movie => movie.id === id)) {
                    deleteMovie(id);
                } else if (schedule.find(session => session.id === id)) {
                    deleteSchedule(id);
                }
            }
        }
    });

    // Обработчик для вкладок
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.dataset.tab;
            
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === tabId) {
                    content.classList.add('active');
                }
            });
        });
    });

    // Обработчик для кнопки выхода
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (confirm('Вы хотите выйти?')) {
                localStorage.removeItem('isLoggedIn');
                localStorage.removeItem('userEmail');
                localStorage.removeItem('isAdmin');
                window.location.href = 'index.html';
            }
        });
    }

    // Инициализация отображения
    renderMovies();
    renderSchedule();
    renderUsers();
}); 