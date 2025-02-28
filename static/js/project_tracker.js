function handleTaskAction(action) {
    fetch('/task_action/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCsrfToken()
        },
        body: JSON.stringify({
            task_data: { 
                name: projectData.name  // Include project name to identify the task
            },
            action: action
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert(`Task has been ${action}ed.`);
            location.reload();  // Reload the page to reflect changes
        } else {
            alert('Error: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

// Function to get CSRF token from the cookies
function getCsrfToken() {
    let cookieValue = null;
    let cookies = document.cookie ? document.cookie.split('; ') : [];
    
    for (let i = 0; i < cookies.length; i++) {
        let cookie = cookies[i].split('=');
        if (cookie[0] === 'csrftoken') {
            cookieValue = decodeURIComponent(cookie[1]);
            break;
        }
    }
    return cookieValue;
}

document.addEventListener("DOMContentLoaded", function () {
    const monthYear = document.getElementById("monthYear");
    const calendarDates = document.getElementById("calendarDates");
    const prevMonthBtn = document.getElementById("prevMonth");
    const nextMonthBtn = document.getElementById("nextMonth");

    let currentDate = new Date();

    function renderCalendar() {
        const today = new Date();
        const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        const firstDayOfWeek = firstDayOfMonth.getDay();
        const lastDayOfWeek = lastDayOfMonth.getDay();
        const prevMonthLastDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate();
        
        monthYear.textContent = firstDayOfMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" });

        calendarDates.innerHTML = "";

        // Previous month days
        for (let i = firstDayOfWeek; i > 0; i--) {
            let dateEl = document.createElement("div");
            dateEl.classList.add("date", "other-month");
            dateEl.textContent = prevMonthLastDay - i + 1;
            calendarDates.appendChild(dateEl);
        }

        // Current month days
        for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
            let dateEl = document.createElement("div");
            dateEl.classList.add("date", "current-month");
            dateEl.textContent = i;

            // Set active class if it matches today's date
            if (
                today.getDate() === i &&
                today.getMonth() === currentDate.getMonth() &&
                today.getFullYear() === currentDate.getFullYear()
            ) {
                dateEl.classList.add("selected");
            }

            dateEl.addEventListener("click", function () {
                document.querySelectorAll(".date").forEach(el => el.classList.remove("selected"));
                dateEl.classList.add("selected");
            });

            calendarDates.appendChild(dateEl);
        }

        // Next month days
        for (let i = 1; i < 7 - lastDayOfWeek; i++) {
            let dateEl = document.createElement("div");
            dateEl.classList.add("date", "other-month");
            dateEl.textContent = i;
            calendarDates.appendChild(dateEl);
        }
    }

    prevMonthBtn.addEventListener("click", function () {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });

    nextMonthBtn.addEventListener("click", function () {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });

    renderCalendar();
});

