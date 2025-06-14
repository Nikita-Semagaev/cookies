document.addEventListener('DOMContentLoaded', () => {
    // Проверяем авторизацию пользователя
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const myTicketsLink = document.getElementById('myTicketsLink');
    const loginLink = document.getElementById('loginLink');
    const logoutLink = document.getElementById('logoutLink');

    if (currentUser) {
        // Пользователь авторизован
        myTicketsLink.style.display = 'block';
        loginLink.style.display = 'none';
        logoutLink.style.display = 'block';
        loadUserTickets(currentUser.username);
    } else {
        // Пользователь не авторизован
        window.location.href = 'login.html';
    }

    // Обработчик выхода из системы
    logoutLink.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    });

    // Функция загрузки билетов пользователя
    function loadUserTickets(username) {
        console.log('Loading tickets for user:', username);
        const ticketsContainer = document.getElementById('ticketsContainer');
        const userTickets = JSON.parse(localStorage.getItem(`tickets_${username}`)) || [];
        console.log('Loaded tickets:', userTickets);

        if (userTickets.length === 0) {
            ticketsContainer.innerHTML = '<div class="no-tickets-message">У вас пока нет забронированных билетов</div>';
            return;
        }

        ticketsContainer.innerHTML = '';
        userTickets.forEach((ticket, index) => {
            const ticketCard = createTicketCard(ticket, index);
            ticketsContainer.appendChild(ticketCard);
        });
    }

    // Функция генерации QR-кода
    function generateQRCode(text) {
        const qrDiv = document.createElement('div');
        const qrImg = document.createElement('img');
        qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(text)}`;
        qrImg.alt = 'QR-код билета';
        qrDiv.className = 'ticket-qr';
        qrDiv.appendChild(qrImg);
        return qrDiv;
    }

    // Функция создания карточки билета
    function createTicketCard(ticket, index) {
        const card = document.createElement('div');
        card.className = 'ticket-card';

        const seatsText = ticket.seats.map(seat => {
            const rowLetter = String.fromCharCode(64 + seat.row);
            return `${rowLetter}${seat.col}`;
        }).join(', ');

        // Получаем постер из localStorage или используем дефолтный
        const movies = JSON.parse(localStorage.getItem('movies')) || [];
        const movie = movies.find(m => m.title === ticket.movieTitle);
        const posterUrl = movie ? movie.poster : 'images/default-poster.jpg';

        // Постер
        const posterDiv = document.createElement('div');
        posterDiv.className = 'ticket-poster';
        const posterImg = document.createElement('img');
        posterImg.src = posterUrl;
        posterImg.alt = `Обложка фильма ${ticket.movieTitle}`;
        posterDiv.appendChild(posterImg);

        // Информация
        const infoDiv = document.createElement('div');
        infoDiv.className = 'ticket-info';
        infoDiv.innerHTML = `
            <h3>${ticket.movieTitle}</h3>
            <div class="ticket-details">Дата: ${ticket.date}</div>
            <div class="ticket-details">Время: ${ticket.time}</div>
            <div class="ticket-details">Зал: ${ticket.hallName}</div>
            <div class="ticket-seats">Места: ${seatsText}</div>
        `;

        // QR-код
        const qrData = `${ticket.movieTitle} | ${ticket.date} | ${ticket.time} | Зал: ${ticket.hallName} | Места: ${seatsText}`;
        const qrDiv = generateQRCode(qrData);

        // Кнопки
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'ticket-actions';
        actionsDiv.innerHTML = `
            <button class="btn btn-primary" onclick="printTicket(this)"><i class="fas fa-print"></i> Распечатать</button>
            <button class="cancel-ticket-btn" data-index="${index}">Отменить бронь</button>
        `;

        // Добавляем обработчик для кнопки отмены
        actionsDiv.querySelector('.cancel-ticket-btn').addEventListener('click', () => cancelTicket(index));

        // Сборка карточки
        card.appendChild(posterDiv);
        card.appendChild(infoDiv);
        card.appendChild(qrDiv);
        card.appendChild(actionsDiv);

        return card;
    }

    // Функция отмены билета
    function cancelTicket(ticketIndex) {
        if (confirm('Вы уверены, что хотите отменить бронь?')) {
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            const userTickets = JSON.parse(localStorage.getItem(`tickets_${currentUser.username}`)) || [];
            const ticket = userTickets[ticketIndex];

            // Удаляем билет из списка пользователя
            userTickets.splice(ticketIndex, 1);
            localStorage.setItem(`tickets_${currentUser.username}`, JSON.stringify(userTickets));

            // Освобождаем места в зале
            const bookedSeats = getBookedSeats(ticket.movieTitle, ticket.date, ticket.time, ticket.hallType);
            const updatedBookedSeats = bookedSeats.filter(seat => 
                !ticket.seats.some(ticketSeat => 
                    ticketSeat.row === seat.row && ticketSeat.col === seat.col
                )
            );
            saveBookedSeats(ticket.movieTitle, ticket.date, ticket.time, ticket.hallType, updatedBookedSeats);

            // Перезагружаем список билетов
            loadUserTickets(currentUser.username);
        }
    }

    // Вспомогательные функции для работы с забронированными местами
    function getBookedSeats(movieId, date, time, hallType) {
        const key = `bookedSeats_${movieId}_${date}_${time}_${hallType}`;
        return JSON.parse(localStorage.getItem(key)) || [];
    }

    function saveBookedSeats(movieId, date, time, hallType, seats) {
        const key = `bookedSeats_${movieId}_${date}_${time}_${hallType}`;
        localStorage.setItem(key, JSON.stringify(seats));
    }

    // Функция печати билета
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
        printWindow.onload = function() {
            printWindow.print();
            printWindow.close();
        };
    };
}); 