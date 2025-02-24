document.getElementById('leave-button').addEventListener('click', function() {
    // Hide content and right-sidebar
    document.querySelector('.content').style.display = 'none';
    document.querySelector('.right-sidebar').style.display = 'none';

    // Show leave_tracker
    document.querySelector('.leave_tracker').style.display = 'block';
});

document.getElementById('task-button').addEventListener('click', function() {
    // Show content and right-sidebar
    document.querySelector('.content').style.display = 'block';
    document.querySelector('.right-sidebar').style.display = 'block';

    // Hide leave_tracker
    document.querySelector('.leave_tracker').style.display = 'none';
});

document.addEventListener("DOMContentLoaded", function() {
    fetch("/generate-pie-chart/")
    .then(response => response.json())
    .then(data => {
        let pieChartDiv = document.getElementById("pie_chart");
        pieChartDiv.innerHTML = `<img src="${data.image_base64}" alt="Pie Chart" style="width: 100%; max-width: 18vw;">`;
    })
    .catch(error => console.error("Error loading pie chart:", error));
});

document.addEventListener("DOMContentLoaded", function () {
    const applyBtn = document.querySelector(".apply-btn");
    const cancelBtn = document.querySelector(".btn-secondary"); // Cancel button
    const leaveStatistics = document.querySelector(".leave-statistics");
    const upcomingHolidays = document.querySelector(".upcoming-holidays");
    const applyLeave = document.querySelector(".apply-leave");

    // Input fields to be cleared on Cancel
    const fromDate = document.getElementById("from_date");
    const toDate = document.getElementById("to_date");
    const selectedFrom = document.getElementById("selected-from");
    const selectedTo = document.getElementById("selected-to");
    const leaveType = document.getElementById("leave-type");
    const notify = document.getElementById("notify");
    const reason = document.getElementById("reason");

    applyBtn.addEventListener("click", function () {
        // Hide leave statistics and upcoming holidays
        leaveStatistics.style.display = "none";
        upcomingHolidays.style.display = "none";

        // Show apply leave section
        applyLeave.style.display = "block";
    });

    cancelBtn.addEventListener("click", function () {
        // Show leave statistics and upcoming holidays
        leaveStatistics.style.display = "block";
        upcomingHolidays.style.display = "block";

        // Hide apply leave section
        applyLeave.style.display = "none";

        // Clear form fields
        fromDate.value = "";  // Clear FROM date
        toDate.value = "";  // Clear TO date
        selectedFrom.textContent = ""; // Clear displayed FROM date
        selectedTo.textContent = ""; // Clear displayed TO date
        leaveType.selectedIndex = 0;  // Reset leave type dropdown
        notify.selectedIndex = 0;  // Reset notify dropdown
        reason.value = "";  // Clear reason textarea
    });
});

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

document.addEventListener("DOMContentLoaded", function () {
    function formatDate(dateString) {
        const options = { weekday: "long", month: "long", day: "numeric", year: "numeric" };
        return new Date(dateString).toLocaleDateString("en-US", options);
    }

    function updateSelectedDate(inputId, spanId) {
        const input = document.getElementById(inputId);
        const span = document.getElementById(spanId);

        input.addEventListener("change", function () {
            if (this.value) {
                span.textContent = "" + formatDate(this.value);
            } else {
                span.textContent = "";
            }
        });
    }

    updateSelectedDate("from_date", "selected-from");
    updateSelectedDate("to_date", "selected-to");
});

document.addEventListener("DOMContentLoaded", function () {
    fetch('/get-admins/')
        .then(response => response.json())
        .then(data => {
            let select = document.getElementById("notify");
            data.admins.forEach(admin => {
                let option = document.createElement("option");
                option.value = admin.id;
                option.textContent = admin.name;
                select.appendChild(option);
            });
        })
        .catch(error => console.error("Error fetching admins:", error));
});