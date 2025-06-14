// script.js

document.addEventListener('DOMContentLoaded', () => {
    const hero = document.querySelector('.hero');
    if (hero) {
        const heroTitle = hero.querySelector('.hero-content h1');
        const slideIndicatorsContainer = document.querySelector('.slide-indicators');

        const slidesData = [
            {
                title: 'Веном',
                description: 'В этом мире у каждого есть второй шанс',
                backgroundImage: 'images/s1.jpg'
            },
            {
                title: 'Человек-Паук: Нет пути домой',
                description: 'Описание фильма Человек-Паук.',
                backgroundImage: 'images/s2.jpg'
            },
            {
                title: 'Первому игроку приготовиться',
                description: 'Описание фильма Первому игроку приготовиться.',
                backgroundImage: 'images/s3.jpg'
            },
            {
                title: 'Джокер',
                description: 'Описание фильма Джокер.',
                backgroundImage: 'images/s4.jpg'
            }
        ];

        // Создаем все слайды заранее
        const slidesContainer = document.createElement('div');
        slidesContainer.className = 'slides-container';
        slidesContainer.style.position = 'absolute';
        slidesContainer.style.top = '0';
        slidesContainer.style.left = '0';
        slidesContainer.style.width = '100%';
        slidesContainer.style.height = '100%';
        hero.insertBefore(slidesContainer, hero.firstChild);

        // Создаем слайды
        const slides = slidesData.map((slide, index) => {
            const slideDiv = document.createElement('div');
            slideDiv.className = 'slide';
            slideDiv.style.position = 'absolute';
            slideDiv.style.top = '0';
            slideDiv.style.left = '0';
            slideDiv.style.width = '100%';
            slideDiv.style.height = '100%';
            slideDiv.style.backgroundImage = `url('${slide.backgroundImage}')`;
            slideDiv.style.backgroundSize = 'cover';
            slideDiv.style.backgroundPosition = 'center';
            slideDiv.style.opacity = index === 0 ? '1' : '0';
            slideDiv.style.transition = 'opacity 0.5s ease-in-out';
            slideDiv.style.visibility = index === 0 ? 'visible' : 'hidden';
            slideDiv.style.zIndex = '1';
            slidesContainer.appendChild(slideDiv);
            return slideDiv;
        });

        // Создаем затемняющий слой
        const overlay = document.createElement('div');
        overlay.className = 'slides-overlay';
        overlay.style.position = 'absolute';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        overlay.style.zIndex = '2';
        slidesContainer.appendChild(overlay);

        let currentSlide = 0;
        let slideInterval;
        let isTransitioning = false;

        function updateSlide() {
            if (isTransitioning) return;
            isTransitioning = true;

            const nextSlide = (currentSlide + 1) % slides.length;
            
            // Подготавливаем следующий слайд
            slides[nextSlide].style.visibility = 'visible';
            slides[nextSlide].style.zIndex = '1';
            
            // Скрываем текущий слайд
            slides[currentSlide].style.opacity = '0';
            heroTitle.style.opacity = '0';

            // Показываем новый слайд
            setTimeout(() => {
                slides[nextSlide].style.opacity = '1';
                heroTitle.textContent = slidesData[nextSlide].title;
                heroTitle.style.opacity = '1';
                
                // Скрываем предыдущий слайд
                slides[currentSlide].style.visibility = 'hidden';
                slides[currentSlide].style.zIndex = '0';
                
                currentSlide = nextSlide;
                updateIndicators();
                isTransitioning = false;
            }, 500);
        }

        function updateIndicators() {
            slideIndicatorsContainer.innerHTML = '';
            slidesData.forEach((_, index) => {
                const dot = document.createElement('span');
                dot.classList.add('dot');
                if (index === currentSlide) {
                    dot.classList.add('active');
                }
                dot.addEventListener('click', () => {
                    if (isTransitioning) return;
                    
                    // Подготавливаем выбранный слайд
                    slides[index].style.visibility = 'visible';
                    slides[index].style.zIndex = '1';
                    
                    // Скрываем текущий слайд
                    slides[currentSlide].style.opacity = '0';
                    heroTitle.style.opacity = '0';
                    
                    setTimeout(() => {
                        slides[index].style.opacity = '1';
                        heroTitle.textContent = slidesData[index].title;
                        heroTitle.style.opacity = '1';
                        
                        // Скрываем предыдущий слайд
                        slides[currentSlide].style.visibility = 'hidden';
                        slides[currentSlide].style.zIndex = '0';
                        
                        currentSlide = index;
                        updateIndicators();
                    }, 500);
                    resetAutoSlide();
                });
                slideIndicatorsContainer.appendChild(dot);
            });
        }

        function startAutoSlide() {
            slideInterval = setInterval(updateSlide, 5000);
        }

        function resetAutoSlide() {
            clearInterval(slideInterval);
            startAutoSlide();
        }

        // Инициализация
        updateIndicators();
        startAutoSlide();

        // Добавляем стили для плавного перехода заголовка
        heroTitle.style.transition = 'opacity 0.3s ease-in-out';
    }

    // Код для обработки кликов по карточкам фильмов
    const movieCardLinks = document.querySelectorAll('.movie-card-link');
    movieCardLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const movieData = JSON.parse(link.dataset.movie);
            localStorage.setItem('currentMovie', JSON.stringify(movieData));
        });
    });

    // Функционал админ-панели
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    if (tabButtons.length > 0) {
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabId = button.getAttribute('data-tab');
                // Активация кнопки
                tabButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                // Показ соответствующего контента
                tabContents.forEach(content => {
                    content.classList.remove('active');
                    if (content.id === tabId) {
                        content.classList.add('active');
                    }
                });
            });
        });
    }

    // Модальное окно
    const modal = document.querySelector('.modal');
    const addButtons = document.querySelectorAll('.add-btn');
    const closeButtons = document.querySelectorAll('.close');

    if (modal) {
        // Открытие модального окна
        addButtons.forEach(button => {
            button.addEventListener('click', () => {
                modal.style.display = 'block';
                document.body.style.overflow = 'hidden';
            });
        });

        // Закрытие модального окна
        closeButtons.forEach(button => {
            button.addEventListener('click', () => {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            });
        });

        // Закрытие по клику вне модального окна
        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    }

    // Обработка форм
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            try {
                // Здесь будет отправка данных на сервер
                console.log('Form data:', data);
                // Временная имитация успешной отправки
                alert('Данные успешно сохранены!');
                if (modal) {
                    modal.style.display = 'none';
                    document.body.style.overflow = 'auto';
                }
                form.reset();
            } catch (error) {
                console.error('Error:', error);
                alert('Произошла ошибка при сохранении данных');
            }
        });
    });

    // Обработка кнопок редактирования и удаления
    const editButtons = document.querySelectorAll('.edit-btn');
    const deleteButtons = document.querySelectorAll('.delete-btn');

    editButtons.forEach(button => {
        button.addEventListener('click', () => {
            const itemId = button.getAttribute('data-id');
            // Здесь будет логика редактирования
            console.log('Edit item:', itemId);
            if (modal) {
                modal.style.display = 'block';
                document.body.style.overflow = 'hidden';
            }
        });
    });

    deleteButtons.forEach(button => {
        button.addEventListener('click', () => {
            const itemId = button.getAttribute('data-id');
            if (confirm('Вы уверены, что хотите удалить этот элемент?')) {
                // Здесь будет логика удаления
                console.log('Delete item:', itemId);
            }
        });
    });

    // Проверяем состояние авторизации
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const myTicketsLink = document.getElementById('myTicketsLink');
    const loginLink = document.getElementById('loginLink');
    const logoutLink = document.getElementById('logoutLink');

    if (currentUser) {
        // Пользователь авторизован
        if (myTicketsLink) myTicketsLink.style.display = 'block';
        if (loginLink) loginLink.style.display = 'none';
        if (logoutLink) {
            logoutLink.style.display = 'block';
            logoutLink.addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.removeItem('currentUser');
                window.location.reload();
            });
        }
    } else {
        // Пользователь не авторизован
        if (myTicketsLink) myTicketsLink.style.display = 'none';
        if (loginLink) loginLink.style.display = 'block';
        if (logoutLink) logoutLink.style.display = 'none';
    }

    function renderTickets() {
        const ticketsContainer = document.getElementById('tickets-container');
        if (!ticketsContainer) return;

        const tickets = JSON.parse(localStorage.getItem('tickets')) || [];
        
        if (tickets.length === 0) {
            ticketsContainer.innerHTML = `
                <div class="no-tickets">
                    <i class="fas fa-ticket-alt"></i>
                    <h3>У вас пока нет билетов</h3>
                    <p>После покупки билетов они появятся здесь</p>
                </div>
            `;
            return;
        }

        ticketsContainer.innerHTML = '';
        tickets.forEach(ticket => {
            const movie = [...nowShowing, ...comingSoon].find(m => m.id === ticket.movieId);
            if (!movie) return;

            const ticketCard = document.createElement('div');
            ticketCard.className = 'ticket-card';

            // Постер
            const posterDiv = document.createElement('div');
            posterDiv.className = 'ticket-poster';
            const posterImg = document.createElement('img');
            posterImg.src = movie.poster;
            posterImg.alt = movie.title;
            posterDiv.appendChild(posterImg);

            // Информация
            const infoDiv = document.createElement('div');
            infoDiv.className = 'ticket-info';
            infoDiv.innerHTML = `
                <h3>${movie.title}</h3>
                <p class="ticket-date"><i class="far fa-calendar"></i> ${ticket.date}</p>
                <p class="ticket-time"><i class="far fa-clock"></i> ${ticket.time}</p>
                <p class="ticket-hall"><i class="fas fa-door-open"></i> Зал ${ticket.hall}</p>
                <p class="ticket-seats"><i class="fas fa-chair"></i> Места: ${ticket.seats.join(', ')}</p>
            `;

            // QR-код (данные: название фильма, дата, время, места)
            const qrData = `${movie.title} | ${ticket.date} | ${ticket.time} | Зал: ${ticket.hall} | Места: ${ticket.seats.join(',')}`;
            const qrDiv = generateQRCode(qrData);

            // Кнопки
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'ticket-actions';
            actionsDiv.innerHTML = `
                <button class="btn btn-primary" onclick="printTicket(this)"><i class="fas fa-print"></i> Распечатать</button>
                <button class="btn btn-danger" onclick="cancelTicket('${ticket.id}')"><i class="fas fa-times"></i> Отменить</button>
            `;

            // Сборка карточки
            ticketCard.appendChild(posterDiv);
            ticketCard.appendChild(infoDiv);
            ticketCard.appendChild(qrDiv);
            ticketCard.appendChild(actionsDiv);
            ticketsContainer.appendChild(ticketCard);
        });
    }

    // --- Функция генерации QR-кода ---
    function generateQRCode(text) {
        const qrDiv = document.createElement('div');
        const qrImg = document.createElement('img');
        // Используем бесплатный API для генерации QR-кода
        qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(text)}`;
        qrImg.alt = 'QR-код билета';
        qrDiv.className = 'ticket-qr';
        qrDiv.appendChild(qrImg);
        return qrDiv;
    }

    // --- Функция печати билета ---
    window.printTicket = function(btn) {
        const ticketCard = btn.closest('.ticket-card');
        if (!ticketCard) return;
        const printWindow = window.open('', '', 'width=700,height=600');
        printWindow.document.write('<html><head><title>Печать билета</title>');
        printWindow.document.write('<link rel="stylesheet" href="style.css">');
        printWindow.document.write('</head><body>');
        printWindow.document.write(ticketCard.outerHTML);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => { printWindow.print(); printWindow.close(); }, 500);
    };

    // --- Автоматическое сохранение фильмов из index.html в localStorage ---
    if (!localStorage.getItem('movies')) {
        const movieCardLinks = document.querySelectorAll('.movie-card-link[data-movie]');
        const movies = Array.from(movieCardLinks).map(link => {
            try {
                return JSON.parse(link.dataset.movie);
            } catch (e) {
                return null;
            }
        }).filter(Boolean);
        if (movies.length > 0) {
            localStorage.setItem('movies', JSON.stringify(movies));
        }
    }

    // --- Подсветка активной ссылки в навигации (улучшено для всех страниц) ---
    const navLinks = document.querySelectorAll('nav ul li a');
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (
            (currentPage === 'index.html' && (href === 'index.html' || href === './' || href === '/')) ||
            (href && href !== 'index.html' && currentPage === href)
        ) {
            link.classList.add('active');
            link.setAttribute('aria-current', 'page');
        }
    });

    // Универсальный обработчик для всех header/nav
    document.querySelectorAll('header').forEach(header => {
        const burger = header.querySelector('.burger');
        const navUl = header.querySelector('nav ul');
        if (burger && navUl) {
            burger.addEventListener('click', (e) => {
                e.stopPropagation();
                navUl.classList.toggle('open');
                burger.classList.toggle('open');
            });
            // Закрытие меню по клику вне меню
            document.addEventListener('click', (e) => {
                if (!navUl.contains(e.target) && !burger.contains(e.target)) {
                    navUl.classList.remove('open');
                    burger.classList.remove('open');
                }
            });
            // Закрытие меню по клику на ссылку
            navUl.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => {
                    navUl.classList.remove('open');
                    burger.classList.remove('open');
                });
            });
        } else {
            if (!burger) console.warn('Не найден .burger в header');
            if (!navUl) console.warn('Не найден nav ul в header');
        }
    });
}); 