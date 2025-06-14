// movie_details.js

document.addEventListener('DOMContentLoaded', () => {
    // Проверяем статус авторизации при загрузке страницы
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const myTicketsLink = document.getElementById('myTicketsLink');
    const loginLink = document.getElementById('loginLink');
    const logoutLink = document.getElementById('logoutLink');

    if (isLoggedIn) {
        if (myTicketsLink) myTicketsLink.style.display = 'block';
        if (loginLink) loginLink.style.display = 'none';
        if (logoutLink) logoutLink.style.display = 'block';
    } else {
        if (myTicketsLink) myTicketsLink.style.display = 'none';
        if (loginLink) loginLink.style.display = 'block';
        if (logoutLink) logoutLink.style.display = 'none';
    }

    // Get movie data from localStorage
    const movieDataString = localStorage.getItem('currentMovie');

    if (movieDataString) {
        const movie = JSON.parse(movieDataString);

        // Populate the movie details page with data
        document.title = movie.title + ' - Аврора';

        // Hero section
        const heroSection = document.querySelector('.movie-details-hero');
        if (heroSection && movie.background && movie.background !== '#') {
             heroSection.style.backgroundImage = `url('${movie.background}')`;
             heroSection.style.backgroundSize = 'cover';
             heroSection.style.backgroundPosition = 'center';
        } else if (heroSection) {
             // Use a default or remove background if not available
             heroSection.style.backgroundImage = 'none';
        }

        const posterElement = document.querySelector('.movie-details-poster');
        if (posterElement) {
            posterElement.src = movie.poster || ''; // Use empty string if poster is not available
            posterElement.alt = 'Постер фильма ' + movie.title;
        }

        const ratingElement = document.querySelector('.movie-info-summary .rating');
        if (ratingElement) {
            ratingElement.textContent = movie.rating || 'N/A';
        }

        const titleElement = document.querySelector('.movie-title');
        if (titleElement) {
            titleElement.textContent = movie.title || 'Название фильма';
        }

        const metaElement = document.querySelector('.movie-meta');
        if (metaElement) {
             const durationSpan = metaElement.querySelector('.movie-duration');
             if (durationSpan) durationSpan.textContent = movie.details.includes('мин') ? movie.details.split('|')[0].trim() : '';
             const genreSpan = metaElement.querySelector('.movie-genre');
             if (genreSpan) genreSpan.textContent = movie.details.includes('|') ? movie.details.split('|')[1].trim() : (movie.details.includes('мин') ? '' : movie.details.trim());
        }


        const shortDescriptionElement = document.querySelector('.movie-short-description');
        if (shortDescriptionElement) {
            shortDescriptionElement.textContent = movie.description || '';
        }

        // Full details section
        const fullDescriptionElement = document.querySelector('.movie-full-description');
        if (fullDescriptionElement) {
            fullDescriptionElement.textContent = movie.full_description || movie.description || '';
        }

        const metaDescriptionElement = document.querySelector('.meta-description-text');
        if (metaDescriptionElement) {
             metaDescriptionElement.textContent = movie.description || ''; // Reusing short description for simplicity
        }

        const metaGenreElement = document.querySelector('.meta-genre-text');
        if (metaGenreElement) {
             metaGenreElement.textContent = movie.details.includes('|') ? movie.details.split('|')[1].trim() : (movie.details.includes('мин') ? '' : movie.details.trim());
        }

        const metaRatingElement = document.querySelector('.meta-rating-text');
        if (metaRatingElement) {
            metaRatingElement.textContent = movie.rating ? movie.rating + '/10' : 'N/A';
        }

        const metaDurationElement = document.querySelector('.meta-duration-text');
        if (metaDurationElement) {
             metaDurationElement.textContent = movie.details.includes('мин') ? movie.details.split('|')[0].trim() : '';
        }

         const metaYearElement = document.querySelector('.meta-year-text');
        if (metaYearElement && movie.year) {
             metaYearElement.textContent = movie.year;
        }

        // Schedule section (example - replace with real data)
        const scheduleContainer = document.getElementById('schedule-container');
        if (scheduleContainer && movie.schedule) {
            scheduleContainer.innerHTML = ''; // Clear existing content

            for (const day in movie.schedule) {
                const dayScheduleDiv = document.createElement('div');
                dayScheduleDiv.classList.add('day-schedule');

                const dateHeader = document.createElement('h4');
                dateHeader.textContent = day;
                dayScheduleDiv.appendChild(dateHeader);

                const timeButtonsDiv = document.createElement('div');
                timeButtonsDiv.classList.add('time-buttons');

                movie.schedule[day].forEach(time => {
                    const button = document.createElement('button');
                    button.classList.add('time-button');
                    button.textContent = time;
                    button.dataset.movieId = movie.title; // Add movie title to dataset
                    button.dataset.sessionDate = day; // Add session date to dataset
                    button.dataset.sessionTime = time; // Add session time to dataset

                    // Добавляем обработчик события для кнопки времени
                    button.addEventListener('click', () => openSeatingModal(movie.title, day, time));

                    timeButtonsDiv.appendChild(button);
                });

                dayScheduleDiv.appendChild(timeButtonsDiv);
                scheduleContainer.appendChild(dayScheduleDiv);
            }
        } else if (scheduleContainer) {
            scheduleContainer.innerHTML = '<p>Расписание недоступно.</p>';
        }

    } else {
        // Handle case where no movie data is found (e.g., redirect to homepage or show error)
        console.error('No movie data found in localStorage');
        // window.location.href = 'index.html'; // Example: redirect to homepage
    }

    // Переменные для модального окна выбора мест
    const seatingModal = document.getElementById('seatingModal');
    const closeButton = seatingModal.querySelector('.close-button');
    const seatingPlan = document.getElementById('seatingPlan');
    const selectedSeatsCountSpan = document.getElementById('selectedSeatsCount');
    const totalPriceSpan = document.getElementById('totalPrice');
    const bookTicketsBtn = document.getElementById('bookTicketsBtn');
    const modalHallInfo = document.getElementById('modalHallInfo');
    const hallNumberSpan = document.getElementById('hallNumber');
    const sessionTimeSpan = document.getElementById('sessionTime');

    let selectedSeats = [];
    let currentSessionData = {};
    let currentHallType = 'regular'; // Добавляем переменную для текущего типа зала

    // Пример конфигурации залов (можно расширить для разных залов)
    const hallConfigs = {
        regular: { rows: 8, columns: 10, seatPrice: 350, displayColumns: 10, name: 'Обычный' },
        '3d': { rows: 10, columns: 12, seatPrice: 450, displayColumns: 12, name: '3D' },
        imax: { rows: 7, columns: 9, seatPrice: 600, displayColumns: 9, name: 'IMAX' },
        vip: { rows: 5, columns: 7, seatPrice: 800, displayColumns: 7, name: 'VIP' }
    };

    // Функция для получения забронированных мест для конкретного сеанса и зала
    function getBookedSeats(movieId, date, time, hallType) {
        const key = `bookedSeats_${movieId}_${date}_${time}_${hallType}`;
        return JSON.parse(localStorage.getItem(key)) || [];
    }

    // Функция для сохранения забронированных мест для конкретного сеанса и зала
    function saveBookedSeats(movieId, date, time, hallType, seats) {
        const key = `bookedSeats_${movieId}_${date}_${time}_${hallType}`;
        localStorage.setItem(key, JSON.stringify(seats));
    }

    // Функция для отрисовки схемы зала
    function renderSeatingPlan() {
        seatingPlan.innerHTML = '';
        const config = hallConfigs[currentHallType];
        // seatingPlan.style.gridTemplateColumns = `repeat(${config.displayColumns}, 1fr)`; // Больше не нужно для flexbox

        const bookedSeats = getBookedSeats(currentSessionData.movieId, currentSessionData.sessionDate, currentSessionData.sessionTime, currentHallType);
        selectedSeats = []; // Очищаем выбранные места при смене зала
        
        for (let row = 0; row < config.rows; row++) { // Ряды теперь начинаются с 0 для букв
            const rowDiv = document.createElement('div');
            rowDiv.classList.add('seat-row');

            const rowLabel = document.createElement('div');
            rowLabel.classList.add('row-label');
            rowLabel.textContent = String.fromCharCode(65 + row); // Преобразуем число в букву (A, B, C...)
            rowDiv.appendChild(rowLabel);

            for (let col = 1; col <= config.columns; col++) {
                const seat = document.createElement('div');
                seat.classList.add('seat');
                seat.dataset.row = row + 1; // Сохраняем номер ряда начиная с 1
                seat.dataset.col = col;
                seat.textContent = col; // Номер места

                const isOccupied = bookedSeats.some(s => s.row === (row + 1) && s.col === col);

                if (isOccupied) {
                    seat.classList.add('occupied');
                } else {
                    seat.classList.add('available');
                    seat.addEventListener('click', () => toggleSeatSelection(seat));
                }
                rowDiv.appendChild(seat);
            }
            seatingPlan.appendChild(rowDiv);
        }
        updateBookingSummary();
    }

    // Функция для переключения выбора места
    function toggleSeatSelection(seat) {
        if (seat.classList.contains('occupied')) return;

        seat.classList.toggle('selected');
        const row = parseInt(seat.dataset.row); // Ряд уже 1-индексирован
        const col = parseInt(seat.dataset.col);

        const index = selectedSeats.findIndex(s => s.row === row && s.col === col);
        if (index !== -1) {
            selectedSeats.splice(index, 1); // Удалить место из выбранных
        } else {
            selectedSeats.push({ row, col, type: currentHallType }); // Добавить место в выбранные с типом зала
        }
        updateBookingSummary();
    }

    // Обновляем функцию openSeatingModal
    function openSeatingModal(movieId, date, time) {
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        if (!isLoggedIn) {
            alert('Для бронирования билетов необходимо войти в систему.');
            window.location.href = 'login.html';
            return;
        }

        seatingModal.classList.add('active');
        currentSessionData = { movieId, sessionDate: date, sessionTime: time };
        
        // Устанавливаем начальный зал (например, 'regular') и активируем его вкладку
        currentHallType = 'regular'; 
        const hallTabs = document.querySelectorAll('.hall-tab');
        hallTabs.forEach(tab => {
            if (tab.dataset.hall === 'regular') {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });
        hallNumberSpan.textContent = hallConfigs[currentHallType].name;
        sessionTimeSpan.textContent = time;

        renderSeatingPlan();
    }

    // Добавляем обработчики для кнопок выбора зала
    const hallTabs = document.querySelectorAll('.hall-tab');
    hallTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            hallTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentHallType = tab.dataset.hall;
            hallNumberSpan.textContent = hallConfigs[currentHallType].name;
            renderSeatingPlan(); // Перерисовываем схему мест для нового зала
        });
    });

    bookTicketsBtn.addEventListener('click', () => {
        if (selectedSeats.length > 0) {
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            if (!currentUser) {
                alert('Для бронирования билетов необходимо войти в систему.');
                window.location.href = 'login.html';
                return;
            }

            // Создаем сообщение для подтверждения
            const seatsText = selectedSeats.map(seat => {
                const rowLetter = String.fromCharCode(64 + seat.row);
                return `${rowLetter}${seat.col}`;
            }).join(', ');

            const confirmationMessage = `Подтвердите бронирование:\n\nФильм: ${currentSessionData.movieId}\nДата: ${currentSessionData.sessionDate}\nВремя: ${currentSessionData.sessionTime}\nЗал: ${hallConfigs[currentHallType].name}\nМеста: ${seatsText}\nСумма: ${selectedSeats.length * hallConfigs[currentHallType].seatPrice} ₽`;

            if (confirm(confirmationMessage)) {
                let bookedSeats = getBookedSeats(currentSessionData.movieId, currentSessionData.sessionDate, currentSessionData.sessionTime, currentHallType);
                bookedSeats = [...bookedSeats, ...selectedSeats];
                saveBookedSeats(currentSessionData.movieId, currentSessionData.sessionDate, currentSessionData.sessionTime, currentHallType, bookedSeats);

                // Сохраняем билет в профиле пользователя
                const userTickets = JSON.parse(localStorage.getItem(`tickets_${currentUser.username}`)) || [];
                console.log('Current user:', currentUser);
                console.log('Current userTickets:', userTickets);
                
                // Получаем информацию о фильме
                const movies = JSON.parse(localStorage.getItem('movies')) || [];
                console.log('currentSessionData:', currentSessionData);
                console.log('movies:', movies);
                // Попробуем найти фильм по title, если не найден — по id
                let movie = movies.find(m => m.title === currentSessionData.movieId);
                if (!movie) {
                    movie = movies.find(m => m.id === currentSessionData.movieId);
                }
                console.log('Found movie:', movie);
                
                // Создаем новый билет с простой структурой данных
                const newTicket = {
                    movieTitle: currentSessionData.movieId,
                    date: currentSessionData.sessionDate,
                    time: currentSessionData.sessionTime,
                    hallType: currentHallType,
                    hallName: hallConfigs[currentHallType].name,
                    seats: selectedSeats.map(seat => ({
                        row: seat.row,
                        col: seat.col
                    })),
                    moviePoster: movie ? movie.poster : 'images/default-poster.jpg'
                };
                console.log('New ticket:', newTicket);
                
                userTickets.push(newTicket);
                localStorage.setItem(`tickets_${currentUser.username}`, JSON.stringify(userTickets));
                console.log('Saved tickets:', JSON.parse(localStorage.getItem(`tickets_${currentUser.username}`)));

                alert('Бронирование успешно завершено!');
                closeSeatingModal();
            }
        } else {
            alert('Пожалуйста, выберите хотя бы одно место.');
        }
    });

    function updateBookingSummary() {
        selectedSeatsCountSpan.textContent = selectedSeats.length;
        
        const seatsText = selectedSeats.map(seat => {
            const rowLetter = String.fromCharCode(64 + seat.row); // Преобразуем номер ряда в букву
            return `${rowLetter}${seat.col}`;
        }).join(', ');

        document.getElementById('selectedSeatsInfo').textContent = seatsText;
        totalPriceSpan.textContent = selectedSeats.length * hallConfigs[currentHallType].seatPrice;
    }

    // Функция закрытия модального окна
    closeButton.addEventListener('click', () => {
        seatingModal.classList.remove('active');
    });
}); 