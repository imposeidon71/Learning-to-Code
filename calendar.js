document.addEventListener("DOMContentLoaded", function() {
    const eventForm = document.getElementById("eventForm");
    const monthEvents = document.getElementById("monthEvents");
    const eventPopup = document.getElementById("eventPopup");
    const events = JSON.parse(localStorage.getItem("calendarEvents")) || [];
    
    let currentMonth = document.querySelector(".current-month");
    let calendarDays = document.querySelector(".calendar-days");
    let today = new Date();
    let date = new Date();

    currentMonth.textContent = date.toLocaleDateString("en-US", { month: 'long', year: 'numeric' });
    today.setHours(0, 0, 0, 0);

    renderCalendar();

    function openPopup(dateStr) {
        selectedDate = dateStr;
        document.getElementById('eventDate').value = selectedDate;
        document.getElementById('eventPopup').style.display = "block";
    }

    function closePopup() {
        document.getElementById('eventPopup').style.display = "none";
    }

    eventForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const eventDate = document.getElementById('eventDate').value;
        const eventTitle = document.getElementById('eventTitle').value;
        const eventDetails = document.getElementById('eventDetails').value;

        const newEvent = {
            date: eventDate,
            title: eventTitle,
            details: eventDetails
        };

        events.push(newEvent);
        saveEvents();
        displayEvents();
        closePopup();
    });

    function saveEvents() {
        localStorage.setItem('calendarEvents', JSON.stringify(events));
    }

    function renderCalendar() {
        const prevLastDay = new Date(date.getFullYear(), date.getMonth(), 0).getDate();
        const totalMonthDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
        const startWeekDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
        let daysHTML = "";

        const totalCalendarDay = 6 * 7; // 6 weeks
        for (let i = 0; i < totalCalendarDay; i++) {
            let day = i - startWeekDay + 1;
            let currentDate = new Date(date.getFullYear(), date.getMonth(), day);
            let dayFormatted = currentDate.toISOString().split('T')[0];

            if (i < startWeekDay) {
                daysHTML += `<div class="prev-month-day">${prevLastDay - startWeekDay + i + 1}</div>`;
            } else if (day > 0 && day <= totalMonthDay) {
                let dayClass = currentDate.getTime() === today.getTime() ? 'current-day' : 'month-day';
                if (isEventDay(dayFormatted, currentDate)) {
                    dayClass += ' has-event';
                }
                daysHTML += `<div class="${dayClass}" data-date="${dayFormatted}" onclick="openPopup('${dayFormatted}')">${day}</div>`;
            } else {
                daysHTML += `<div class="next-month-day">${day - totalMonthDay}</div>`;
            }
        }

        calendarDays.innerHTML = daysHTML;
        renderMonthEvents();
    }

    function isEventDay(dayFormatted, currentDate) {
        if (events[dayFormatted]) {
            return true;
        }

        for (let key in events) {
            events[key].forEach(event => {
                if (event.recurring === 'daily') {
                    return isWithinRange(event.recurrenceStart, event.recurrenceEnd, currentDate);
                } else if (event.recurring === 'weekly' && new Date(key).getDay() === currentDate.getDay()) {
                    return isWithinRange(event.recurrenceStart, event.recurrenceEnd, currentDate);
                } else if (event.recurring === 'monthly' && new Date(key).getDate() === currentDate.getDate()) {
                    return isWithinRange(event.recurrenceStart, event.recurrenceEnd, currentDate);
                }
            });
        }
        return false;
    }

    function isWithinRange(start, end, date) {
        let startDate = new Date(start);
        let endDate = new Date(end);
        return date >= startDate && date <= endDate;
    }

    function renderMonthEvents() {
        let startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
        let endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

        let monthEventsHTML = "";
        for (let d = new Date(startOfMonth); d <= endOfMonth; d.setDate(d.getDate() + 1)) {
            let dayFormatted = d.toISOString().split('T')[0];
            if (events[dayFormatted]) {
                events[dayFormatted].forEach(event => {
                    monthEventsHTML += `<div class="event-item">${d.toLocaleDateString('en-US')} - ${event.title} <button class="edit-event" data-date="${dayFormatted}" data-title="${event.title}">Edit</button></div>`;
                });
            }

            for (let key in events) {
                events[key].forEach(event => {
                    if (event.recurring === 'daily' && isWithinRange(event.recurrenceStart, event.recurrenceEnd, d)) {
                        monthEventsHTML += `<div class="event-item">${d.toLocaleDateString('en-US')} - ${event.title} <button class="edit-event" data-date="${dayFormatted}" data-title="${event.title}">Edit</button></div>`;
                    } else if (event.recurring === 'weekly' && new Date(key).getDay() === d.getDay() && isWithinRange(event.recurrenceStart, event.recurrenceEnd, d)) {
                        monthEventsHTML += `<div class="event-item">${d.toLocaleDateString('en-US')} - ${event.title} <button class="edit-event" data-date="${dayFormatted}" data-title="${event.title}">Edit</button></div>`;
                    } else if (event.recurring === 'monthly' && new Date(key).getDate() === d.getDate() && isWithinRange(event.recurrenceStart, event.recurrenceEnd, d)) {
                        monthEventsHTML += `<div class="event-item">${d.toLocaleDateString('en-US')} - ${event.title} <button class="edit-event" data-date="${dayFormatted}" data-title="${event.title}">Edit</button></div>`;
                    }
                });
            }
        }
        monthEvents.innerHTML = monthEventsHTML;
        addEditListeners();
    }

    document.querySelectorAll(".month-btn").forEach(function (element) {
        element.addEventListener("click", function () {
            date.setMonth(date.getMonth() + (element.classList.contains("prev") ? -1 : 1));
            currentMonth.textContent = date.toLocaleDateString("en-US", { month: 'long', year: 'numeric' });
            renderCalendar();
        });
    });

    document.querySelectorAll(".btn").forEach(function (element) {
        element.addEventListener("click", function () {
            let btnClass = element.classList;
            if (btnClass.contains("today")) {
                date = new Date();
            }
            currentMonth.textContent = date.toLocaleDateString("en-US", { month: 'long', year: 'numeric' });
            renderCalendar();
        });
    });

document.addEventListener("DOMContentLoaded", function() {
    const eventForm = document.getElementById("eventForm");
    const monthEvents = document.getElementById("monthEvents");
    const eventPopup = document.getElementById("eventPopup");

    // Load events from local storage
    const events = JSON.parse(localStorage.getItem("calendarEvents")) || [];

    function displayEvents() {
        monthEvents.innerHTML = "";
        events.forEach(event => {
            const eventItem = document.createElement("div");
            eventItem.classList.add("event-item");
            eventItem.innerHTML = `${event.date}: ${event.title} - ${event.details}`;
            monthEvents.appendChild(eventItem);
        });
    }

    function saveEvents() {
        localStorage.setItem("calendarEvents", JSON.stringify(events));
    }

    eventForm.addEventListener("submit", function(e) {
        e.preventDefault();

        const eventDate = document.getElementById("eventDate").value;
        const eventTitle = document.getElementById("eventTitle").value;
        const eventDetails = document.getElementById("eventDetails").value;

        const newEvent = {
            date: eventDate,
            title: eventTitle,
            details: eventDetails
        };

        events.push(newEvent);
        saveEvents();
        displayEvents();
        closePopup();
    });

    displayEvents();
});

function closePopup() {
    const eventPopup = document.getElementById("eventPopup");
    eventPopup.style.display = "none";
