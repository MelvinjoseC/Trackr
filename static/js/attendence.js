document.addEventListener("DOMContentLoaded", function () {
    const attendanceButton = document.getElementById("attendance-button");

    if (attendanceButton) {
        attendanceButton.addEventListener("click", function (e) {
            e.preventDefault(); // Prevent default link behavior

            // Get the correct URL from the <a> tag
            const url = attendanceButton.getAttribute("href");

            if (!url) {
                console.error("Attendance button does not have a valid URL.");
                return;
            }

            // Get the actual screen width and height
            const width = window.screen.width; 
            const height = window.screen.height;

            // Open the Django view in a new window, using full screen size
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












