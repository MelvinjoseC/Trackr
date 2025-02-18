document.addEventListener("DOMContentLoaded", function () {
    const attendanceButton = document.getElementById("attendance-button");
    const taskButton = document.getElementById("task-button");
    const leaveButton = document.getElementById("leave-button");

    // Function to set active button
    function setActiveButton(activeButton) {
        taskButton.classList.remove("active");
        leaveButton.classList.remove("active");
        attendanceButton.classList.remove("active");

        activeButton.classList.add("active");

        taskButton.querySelector("img").src = taskButton.getAttribute("data-default-img");
        leaveButton.querySelector("img").src = leaveButton.getAttribute("data-default-img");
        attendanceButton.querySelector("img").src = attendanceButton.getAttribute("data-default-img");

        activeButton.querySelector("img").src = activeButton.getAttribute("data-active-img");
    }

    // Restore active button from URL parameters
    function restoreActiveButtonFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const activeTab = urlParams.get("activeTab");

        if (activeTab === "attendance") {
            setActiveButton(attendanceButton);
        } else if (activeTab === "task") {
            setActiveButton(taskButton);
        } else if (activeTab === "leave") {
            setActiveButton(leaveButton);
        }
    }

    restoreActiveButtonFromURL();

    // Open new window for Attendance
    if (attendanceButton) {
        attendanceButton.addEventListener("click", function (e) {
            e.preventDefault();

            setActiveButton(attendanceButton);
            let url = attendanceButton.getAttribute("href");

            if (!url) {
                console.error("Attendance button does not have a valid URL.");
                return;
            }

            url += (url.includes("?") ? "&" : "?") + "activeTab=attendance";

            const width = window.screen.width;
            const height = window.screen.height;

            const newWindow = window.open(
                url,
                "_blank",
                `width=${width},height=${height},top=0,left=0,resizable=yes`
            );

            if (!newWindow) {
                alert("Please allow pop-ups for this website to view the attendance window.");
            }
        });
    }

    // Minimize (close) the current tab when Task Tracker or Leave Tracker is clicked
    function minimizeWindow() {
        window.open('', '_self').close(); // Close the current tab
    }

    taskButton.addEventListener("click", function () {
        setActiveButton(taskButton);
        minimizeWindow();
    });

    leaveButton.addEventListener("click", function () {
        setActiveButton(leaveButton);
        minimizeWindow();
    });
});






document.addEventListener('DOMContentLoaded', function () {
    function updateClock() {
        const now = new Date();

        // Format the date as "Wed, 12 Feb 2025"
        const dateOptions = { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' };
        const formattedDate = now.toLocaleDateString('en-GB', dateOptions);

        // Format the time as "02:31 PM"
        const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: true };
        const formattedTime = now.toLocaleTimeString('en-US', timeOptions);

        document.getElementById('current-date').textContent = formattedDate;
        document.getElementById('current-time').textContent = formattedTime;

        setTimeout(updateClock, 1000);
    }

    updateClock();
});

document.addEventListener('DOMContentLoaded', function () {
    function highlightCurrentDay() {
        const now = new Date();
        const currentDayIndex = now.getDay(); // 0 = Sunday, 6 = Saturday
        const days = document.querySelectorAll('.day');

        days.forEach(day => {
            if (parseInt(day.getAttribute('data-day')) === currentDayIndex) {
                day.classList.add('active');
            } else {
                day.classList.remove('active');
            }
        });
    }

    highlightCurrentDay();
});

document.addEventListener('DOMContentLoaded', function () {
    const timesheetContent = document.getElementById('timesheetContent');
    const currentMonthHeader = document.getElementById('currentMonth');
    const prevMonthBtn = document.getElementById('prevMonth');
    const nextMonthBtn = document.getElementById('nextMonth');

    let currentDate = new Date(); // Auto-load current month

    function generateCalendar(date) {
        timesheetContent.innerHTML = ""; // Clear previous month

        const year = date.getFullYear();
        const month = date.getMonth();
        currentMonthHeader.textContent = `${date.toLocaleString('default', { month: 'long' }).toUpperCase()} ${year}`;


        const firstDay = new Date(year, month, 1).getDay(); // Get the first weekday (0 = Sunday, 6 = Saturday)
        const daysInMonth = new Date(year, month + 1, 0).getDate(); // Get total days in the current month
        const totalCells = 42; // Always 6 rows (6 × 7 = 42)

        let dayCount = 0;

        // **Step 1: Fill Empty Blocks with Previous Month's Days**
        const prevMonthDays = new Date(year, month, 0).getDate(); // Get last day of previous month
        for (let i = firstDay - 1; i >= 0; i--) { // Fill backwards
            const prevBlock = document.createElement('div');
            prevBlock.classList.add('day-block', 'prev-month');
            prevBlock.innerHTML = `<span>${prevMonthDays - i}</span>`; // Get previous month's last few days
            timesheetContent.appendChild(prevBlock);
            dayCount++;
        }

        // **Step 2: Generate Current Month Days**
        for (let day = 1; day <= daysInMonth; day++) {
            const block = document.createElement('div');
            block.classList.add('day-block');
            block.innerHTML = `<span>${day}</span>`;

            // Highlight Today's Date
            const today = new Date();
            if (year === today.getFullYear() && month === today.getMonth() && day === today.getDate()) {
                block.classList.add('today');
            }

            timesheetContent.appendChild(block);
            dayCount++;
        }

        // **Step 3: Fill Next Month's Days to Complete 6 Rows**
        let nextMonthDay = 1;
        while (dayCount < totalCells) { // Ensure exactly 42 cells (6 rows × 7 columns)
            const nextBlock = document.createElement('div');
            nextBlock.classList.add('day-block', 'next-month');
            nextBlock.innerHTML = `<span>${nextMonthDay}</span>`;
            timesheetContent.appendChild(nextBlock);
            nextMonthDay++;
            dayCount++;
        }
    }

    // **Navigation Buttons**
    prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        generateCalendar(currentDate);
    });

    nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        generateCalendar(currentDate);
    });

    generateCalendar(currentDate); // **Initial Load**
});












