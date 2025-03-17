document.addEventListener("DOMContentLoaded", function () {
    const attendanceButton = document.getElementById("attendance-button");
    const taskButton = document.getElementById("task-button");
    const leaveButton = document.getElementById("leave-button");

    // Function to set active button
    function setActiveButton(activeButton) {
        if (!taskButton || !leaveButton || !attendanceButton) return;
    
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
        if (!taskButton || !leaveButton || !attendanceButton) return;
    
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

    // Open Attendance in the Same Tab
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
            window.location.href = url; // Open in the same tab
        });
    }

    // Open Task Tracker in the Same Tab
    if (taskButton) {
        taskButton.addEventListener("click", function (e) {
            e.preventDefault();
            setActiveButton(taskButton);

            let url = taskButton.getAttribute("href");
            if (!url) {
                console.error("Task button does not have a valid URL.");
                return;
            }

            url += (url.includes("?") ? "&" : "?") + "activeTab=task";
            window.location.href = url; // Open in the same tab
        });
    }

    // Open Leave Tracker in the Same Tab
    if (leaveButton) {
        leaveButton.addEventListener("click", function (e) {
            e.preventDefault();
            setActiveButton(leaveButton);

            let url = leaveButton.getAttribute("href");
            if (!url) {
                console.error("Leave button does not have a valid URL.");
                return;
            }

            url += (url.includes("?") ? "&" : "?") + "activeTab=leave";
            window.location.href = url; // Open in the same tab
        });
    }
});

/* ----------------- CLOCK FUNCTION ----------------- */
document.addEventListener("DOMContentLoaded", function () {
    function updateClock() {
        const now = new Date();
        const dateElement = document.getElementById("current-date");
        const timeElement = document.getElementById("current-time");
    
        if (!dateElement || !timeElement) return; // Avoid errors if elements don't exist
    
        const dateOptions = { weekday: "short", day: "2-digit", month: "short", year: "numeric" };
        dateElement.textContent = now.toLocaleDateString("en-GB", dateOptions);
    
        const timeOptions = { hour: "2-digit", minute: "2-digit", hour12: true };
        timeElement.textContent = now.toLocaleTimeString("en-US", timeOptions);
    
        setTimeout(updateClock, 1000);
    }
    

    updateClock();
});

/* ----------------- HIGHLIGHT CURRENT DAY ----------------- */
document.addEventListener("DOMContentLoaded", function () {
    function highlightCurrentDay() {
        const days = document.querySelectorAll(".day");
        if (!days.length) return;
    
        const now = new Date();
        const currentDayIndex = now.getDay(); // 0 = Sunday, 6 = Saturday
    
        days.forEach(day => {
            if (parseInt(day.getAttribute("data-day")) === currentDayIndex) {
                day.classList.add("active");
            } else {
                day.classList.remove("active");
            }
        });
    }
    
    highlightCurrentDay();
});

/* ----------------- TIMESHEET CALENDAR ----------------- */
document.addEventListener("DOMContentLoaded", function () {
    const timesheetContent = document.getElementById("timesheetContent");
    const currentMonthHeader = document.getElementById("currentMonth");
    const prevMonthBtn = document.getElementById("prevMonth");
    const nextMonthBtn = document.getElementById("nextMonth");

    if (!currentMonthHeader || !timesheetContent) {
        return;
    }

    let currentDate = new Date(); // Auto-load current month
    generateCalendar(currentDate);

    if (prevMonthBtn) {
        prevMonthBtn.addEventListener("click", function () {
            currentDate.setMonth(currentDate.getMonth() - 1);
            generateCalendar(currentDate);
        });
    }

    if (nextMonthBtn) {
        nextMonthBtn.addEventListener("click", function () {
            currentDate.setMonth(currentDate.getMonth() + 1);
            generateCalendar(currentDate);
        });
    }

    function generateCalendar(date) {
        timesheetContent.innerHTML = ""; // Clear previous month

        const year = date.getFullYear();
        const month = date.getMonth();
        currentMonthHeader.textContent = `${date.toLocaleString("default", { month: "long" }).toUpperCase()} ${year}`;

        // Ensure the calendar updates attendance summary as well
        fetchAttendanceSummary(`${year}-${String(month + 1).padStart(2, "0")}`);

        const firstDay = new Date(year, month, 1).getDay(); // First weekday of month (0 = Sunday, 6 = Saturday)
        const daysInMonth = new Date(year, month + 1, 0).getDate(); // Total days in month
        const totalCells = 42; // 6 rows (6 × 7 = 42)

        let dayCount = 0;

        // Step 1: Fill Empty Blocks with Previous Month's Days
        const prevMonthDays = new Date(year, month, 0).getDate();
        for (let i = firstDay - 1; i >= 0; i--) {
            const prevBlock = document.createElement("div");
            prevBlock.classList.add("day-block", "prev-month");
            prevBlock.innerHTML = `<span>${prevMonthDays - i}</span>`;
            timesheetContent.appendChild(prevBlock);
            dayCount++;
        }

        // Step 2: Generate Current Month Days
        for (let day = 1; day <= daysInMonth; day++) {
            const block = document.createElement("div");
            block.classList.add("day-block");
            block.dataset.date = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            block.innerHTML = `<span>${day}</span>`;

            // Highlight Today's Date
            const today = new Date();
            if (year === today.getFullYear() && month === today.getMonth() && day === today.getDate()) {
                block.classList.add("today");
            }

            timesheetContent.appendChild(block);
            dayCount++;
        }

        // Step 3: Fill Next Month's Days to Complete 6 Rows
        let nextMonthDay = 1;
        while (dayCount < totalCells) {
            const nextBlock = document.createElement("div");
            nextBlock.classList.add("day-block", "next-month");
            nextBlock.innerHTML = `<span>${nextMonthDay}</span>`;
            timesheetContent.appendChild(nextBlock);
            nextMonthDay++;
            dayCount++;
        }

        // Fetch and Populate Attendance Data
        fetchAttendanceData(year, month);
    }

    function fetchAttendanceData(year, month) {
        fetch(`/get_attendance/?year=${year}&month=${month + 1}`)
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    console.error("Error fetching attendance:", data.error);
                    return;
                }
    
                // Populate the calendar with the received data
                data.attendance.forEach(record => {
                    const formattedDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(new Date(record.date).getDate()).padStart(2, "0")}`;
                    const dayBlock = document.querySelector(`[data-date="${formattedDate}"]`);

                    if (dayBlock) {
                        dayBlock.innerHTML = `
                            <span class="day-number">${new Date(record.date).getDate()}</span>
                            <div class="attendance-details">
                                <strong>${record.worktime.toFixed(2)} hrs</strong>
                                <div>IN - ${record.punch_in}</div>
                                <div>OUT - ${record.punch_out}</div>
                                <div>BREAK - ${formatBreakTime(record.break_time)}</div>
                            </div>
                        `;
                    }
                });
            })
            .catch(error => console.error("Error fetching attendance:", error));
    }

    function formatBreakTime(seconds) {
        let hours = Math.floor(seconds / 3600);
        let minutes = Math.floor((seconds % 3600) / 60);
        return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
    }

    function fetchAttendanceSummary(selectedMonth) {
        let apiUrl = `/get_monthly_weekly_attendance/`;
        
        if (selectedMonth) {
            apiUrl += `?month=${selectedMonth}`;
        }

        fetch(apiUrl)
            .then(response => response.json())
            .then(summaryData => {
                if (summaryData.error) {
                    console.error("Error fetching summary data:", summaryData.error);
                    return;
                }

                // ✅ Ensure values are numbers and handle null values gracefully
                const totalMonthly = parseFloat(summaryData.total_monthly_hours) || 0.00;
                const expectedMonthly = parseFloat(summaryData.expected_monthly_hours) || 0.00;
                const totalWeekly = parseFloat(summaryData.total_weekly_hours) || 0.00;
                const expectedWeekly = parseFloat(summaryData.expected_weekly_hours) || 0.00;

                // ✅ Update UI dynamically
                document.getElementById("total-monthly-hours").innerText = `${totalMonthly.toFixed(2)}`;
                document.getElementById("expected-monthly-hours").innerText = `${expectedMonthly.toFixed(2)}`;
                document.getElementById("total-weekly-hours").innerText = `${totalWeekly.toFixed(2)}`;
                document.getElementById("expected-weekly-hours").innerText = `${expectedWeekly.toFixed(2)}`;
            })
            .catch(error => console.error("Error fetching summary data:", error));
    }

    generateCalendar(currentDate); // Initial Load
});





document.addEventListener("DOMContentLoaded", function () {
    const modal = document.getElementById("attendance-modal");
    const openModalBtn = document.getElementById("open-modal-btn");
    const closeModal = document.querySelector(".close");
    const cancelBtn = document.getElementById("cancel-btn");

    // ✅ Ensure modal is completely hidden on page load
    if (modal) {
        modal.style.display = "none";
    }

    // ✅ Function to show modal
    function showModal() {
        if (modal) {
            modal.style.display = "flex";
            document.body.classList.add("modal-open"); // Prevent scrolling when modal is open
        }
    }

    // ✅ Function to hide modal
    function hideModal() {
        if (modal) {
            modal.style.display = "none";
            document.body.classList.remove("modal-open");
        }
    }

    // ✅ Open modal when clicking the button
    if (openModalBtn) {
        openModalBtn.addEventListener("click", function () {
            showModal();
        });
    }

    // ✅ Close modal when clicking 'X' button
    if (closeModal) {
        closeModal.addEventListener("click", function () {
            hideModal();
        });
    }

    // ✅ Close modal when clicking 'Cancel' button
    if (cancelBtn) {
        cancelBtn.addEventListener("click", function () {
            hideModal();
        });
    }

    // ✅ Populate dropdowns for time selection
    function populateDropdown(selectElement, range) {
        if (!selectElement) return;
        selectElement.innerHTML = ""; // Clear existing options
        for (let i = 0; i < range; i++) {
            let option = document.createElement("option");
            option.value = i < 10 ? "0" + i : i;
            option.textContent = i < 10 ? "0" + i : i;
            selectElement.appendChild(option);
        }
    }

    populateDropdown(document.getElementById("punch-in-hour"), 24);
    populateDropdown(document.getElementById("punch-in-minute"), 60);
    populateDropdown(document.getElementById("punch-out-hour"), 24);
    populateDropdown(document.getElementById("punch-out-minute"), 60);
    populateDropdown(document.getElementById("break-hour"), 24);
    populateDropdown(document.getElementById("break-minute"), 60);

    // ✅ Calculate work hours
    function calculateWorkHours() {
        let punchInHour = parseInt(document.getElementById("punch-in-hour")?.value) || 0;
        let punchInMinute = parseInt(document.getElementById("punch-in-minute")?.value) || 0;
        let punchOutHour = parseInt(document.getElementById("punch-out-hour")?.value) || 0;
        let punchOutMinute = parseInt(document.getElementById("punch-out-minute")?.value) || 0;
        let breakHour = parseInt(document.getElementById("break-hour")?.value) || 0;
        let breakMinute = parseInt(document.getElementById("break-minute")?.value) || 0;

        let punchInTime = new Date(0, 0, 0, punchInHour, punchInMinute, 0);
        let punchOutTime = new Date(0, 0, 0, punchOutHour, punchOutMinute, 0);
        let breakTime = (breakHour * 60 + breakMinute) / 60; // Convert break time to hours

        if (punchOutTime < punchInTime) {
            punchOutTime.setDate(punchOutTime.getDate() + 1); // Handle overnight shifts
        }

        let workDuration = (punchOutTime - punchInTime) / (1000 * 60 * 60) - breakTime;
        let totalHoursElement = document.getElementById("total-hours");

        if (totalHoursElement) {
            totalHoursElement.innerText = Math.max(0, workDuration).toFixed(2);
        }
    }

    // ✅ Ensure calculation is triggered on dropdown change
    document.querySelectorAll("select").forEach(select => {
        select.addEventListener("change", calculateWorkHours);
    });

    // ✅ Check if the selected date is a holiday or a weekend (Saturday/Sunday)
function checkCompensation(date, callback) {
    console.log("📢 Checking compensation for date:", date);

    fetch(`/get_holidays/`)
        .then(response => response.json())
        .then(data => {

            let holidays = data.holidays || [];
            let isHoliday = holidays.some(holiday => new Date(holiday.date).toISOString().split("T")[0] === date);
            let selectedDate = new Date(date);
            if (isNaN(selectedDate)) {
                console.error("❌ Invalid date format:", date);
                callback(false);
                return;
            }

            let dayOfWeek = selectedDate.getDay(); // Sunday = 0, Saturday = 6
            let isWeekend = (dayOfWeek === 0 || dayOfWeek === 6); // Check if it's a weekend

            console.log("📢 Is Holiday:", isHoliday, "| Is Weekend:", isWeekend);

            callback(isHoliday || isWeekend); // Mark as compensated if holiday or weekend
        })
        .catch(error => {
            console.error("❌ Error checking holidays:", error);
            callback(false);
        });
}


    // ✅ Submit Attendance Data
    document.getElementById("submit-btn")?.addEventListener("click", function () {
        let attendanceDateElement = document.getElementById("attendance-date");
        if (!attendanceDateElement) {
            alert("Error: Attendance date is missing.");
            return;
        }
    
        let attendanceDate = attendanceDateElement.value;
    
        checkCompensation(attendanceDate, function (isCompensated) {
            let compensatedFlag = isCompensated ? 1 : 0; // ✅ Mark as compensated if holiday or weekend
    
            let punchInHour = document.getElementById("punch-in-hour")?.value || "00";
            let punchInMinute = document.getElementById("punch-in-minute")?.value || "00";
            let punchOutHour = document.getElementById("punch-out-hour")?.value || "00";
            let punchOutMinute = document.getElementById("punch-out-minute")?.value || "00";
            let breakHour = document.getElementById("break-hour")?.value || "00";
            let breakMinute = document.getElementById("break-minute")?.value || "00";
    
            let breakTimeInSeconds = (parseInt(breakHour) * 3600) + (parseInt(breakMinute) * 60);
    
            let formData = new FormData();
            formData.append("date", attendanceDate);
            formData.append("punch_in", `${punchInHour}:${punchInMinute}:00`);
            formData.append("punch_out", `${punchOutHour}:${punchOutMinute}:00`);
            formData.append("break_time", breakTimeInSeconds);
            formData.append("is_compensated", compensatedFlag);
    
            let csrfToken = getCSRFToken();
            if (!csrfToken) {
                alert("CSRF token missing!");
                return;
            }

    
            fetch("/attendance/", {
                method: "POST",
                body: formData,
                headers: { "X-CSRFToken": csrfToken },
            })
            .then(response => {
                console.log("📢 Response received:", response);
                return response.json(); // Parse JSON
            })
            alert("✅ Attendance submitted successfully!");
            
        });
    });
    
    

    // ✅ Function to fetch CSRF token from cookies
    function getCSRFToken() {
        return document.cookie.split("; ").find(row => row.startsWith("csrftoken="))?.split("=")[1] || "";
    }
});

// GET ATTENDANCE
document.addEventListener("DOMContentLoaded", function () {
    // ✅ Ensure the modal is hidden on page load
    document.getElementById("edit-attendance-modal").style.display = "none";

    // ✅ Open Edit Attendance Modal when the button is clicked
    document.getElementById("open-edit-modal-btn").addEventListener("click", function () {
        document.getElementById("edit-attendance-modal").style.display = "flex"; // Show modal
    });

    // ✅ Populate dropdowns for time selection
    function populateDropdown(selectElement, range) {
        if (!selectElement) return;
        selectElement.innerHTML = ""; // Clear existing options
        for (let i = 0; i < range; i++) {
            let option = document.createElement("option");
            option.value = i < 10 ? "0" + i : i;
            option.textContent = i < 10 ? "0" + i : i;
            selectElement.appendChild(option);
        }
    }

    // ✅ Populate dropdowns
    populateDropdown(document.getElementById("edit-punch-in-hour"), 24);
    populateDropdown(document.getElementById("edit-punch-in-minute"), 60);
    populateDropdown(document.getElementById("edit-punch-out-hour"), 24);
    populateDropdown(document.getElementById("edit-punch-out-minute"), 60);
    populateDropdown(document.getElementById("edit-break-hour"), 24);
    populateDropdown(document.getElementById("edit-break-minute"), 60);

    // ✅ Fetch Data When Date is Selected
    document.getElementById("edit-attendance-date").addEventListener("change", function () {
        let selectedDate = this.value; // Get selected date
        fetchAttendanceData(selectedDate);
    });

    function fetchAttendanceData(date) {
        fetch(`/get_attendance/?date=${date}`)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert(data.error);
                return;
            }

            // ✅ Populate form fields correctly
            document.getElementById("edit-punch-in-hour").value = data.punch_in.split(":")[0];
            document.getElementById("edit-punch-in-minute").value = data.punch_in.split(":")[1];
            document.getElementById("edit-punch-out-hour").value = data.punch_out.split(":")[0];
            document.getElementById("edit-punch-out-minute").value = data.punch_out.split(":")[1];
            document.getElementById("edit-break-hour").value = Math.floor(data.break_time / 3600);
            document.getElementById("edit-break-minute").value = (data.break_time % 3600) / 60;

            // ✅ Calculate Total Hours After Data is Loaded
            calculateWorkHours();
        })
    }

    // ✅ Auto-Calculate Total Hours on Time Change
    document.querySelectorAll("#edit-punch-in-hour, #edit-punch-in-minute, #edit-punch-out-hour, #edit-punch-out-minute, #edit-break-hour, #edit-break-minute")
        .forEach(input => input.addEventListener("change", calculateWorkHours));

    function calculateWorkHours() {
        let punchInHour = parseInt(document.getElementById("edit-punch-in-hour").value) || 0;
        let punchInMinute = parseInt(document.getElementById("edit-punch-in-minute").value) || 0;
        let punchOutHour = parseInt(document.getElementById("edit-punch-out-hour").value) || 0;
        let punchOutMinute = parseInt(document.getElementById("edit-punch-out-minute").value) || 0;
        let breakHour = parseInt(document.getElementById("edit-break-hour").value) || 0;
        let breakMinute = parseInt(document.getElementById("edit-break-minute").value) || 0;

        let punchInTime = new Date(0, 0, 0, punchInHour, punchInMinute, 0);
        let punchOutTime = new Date(0, 0, 0, punchOutHour, punchOutMinute, 0);
        let breakTime = new Date(0, 0, 0, breakHour, breakMinute, 0);

        if (punchOutTime < punchInTime) {
            punchOutTime.setDate(punchOutTime.getDate() + 1); // Handle overnight shifts
        }

        let workDuration = (punchOutTime - punchInTime) / (1000 * 60 * 60) - (breakTime.getHours() + breakTime.getMinutes() / 60);
        document.getElementById("edit-total-hours").innerText = Math.max(0, workDuration).toFixed(2);
    }

    // ✅ Close Modal when clicking "X"
    document.querySelector(".close-edit-modal").addEventListener("click", function () {
        document.getElementById("edit-attendance-modal").style.display = "none";
    });

    // ✅ Submit Edited Attendance Data
    document.getElementById("edit-submit-btn").addEventListener("click", function (event) {
        event.preventDefault(); // ✅ Prevents page reload
    
        let date = document.getElementById("edit-attendance-date").value;
        let punchInHour = document.getElementById("edit-punch-in-hour").value;
        let punchInMinute = document.getElementById("edit-punch-in-minute").value;
        let punchOutHour = document.getElementById("edit-punch-out-hour").value;
        let punchOutMinute = document.getElementById("edit-punch-out-minute").value;
        let breakHour = document.getElementById("edit-break-hour").value;
        let breakMinute = document.getElementById("edit-break-minute").value;
    
        if (!date || !punchInHour || !punchInMinute || !punchOutHour || !punchOutMinute || !breakHour || !breakMinute) {
            alert("⚠️ Please fill in all fields!"); // ✅ Show alert and stay on the same page
            return;
        }
    
        let punch_in = `${punchInHour}:${punchInMinute}:00`;
        let punch_out = `${punchOutHour}:${punchOutMinute}:00`;
        let break_time = (parseInt(breakHour) * 3600) + (parseInt(breakMinute) * 60); // Convert to total seconds
    
        let formData = new FormData();
        formData.append("date", date);
        formData.append("punch_in", punch_in);
        formData.append("punch_out", punch_out);
        formData.append("break_time", break_time);
    
        fetch("/edit_attendance/", {
            method: "POST",
            body: formData,
            headers: { "X-CSRFToken": getCSRFToken() }
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert(data.error); // ✅ Show error alert but **don't reload page**
            } else {
                alert("✅ Attendance updated successfully!");
                location.reload(); // ✅ Reload page only when update is successful
            }
        })
        .catch(error => {
            console.error("Submission Error:", error);
            alert("⚠️ An unexpected error occurred. Please try again."); // ✅ Prevents error redirection
        });
    });
    
    // ✅ Function to Get CSRF Token
    function getCSRFToken() {
        return document.cookie.split("; ").find(row => row.startsWith("csrftoken="))?.split("=")[1] || "";
    }
});  


// TOTAL HOURS

document.addEventListener("DOMContentLoaded", function () {
    function fetchAttendanceSummary() {
        fetch(`/get_monthly_weekly_attendance/`)
            .then(response => response.json())
            .then(summaryData => {
                if (summaryData.error) {
                    alert(summaryData.error);
                    return;
                }

                // ✅ Ensure values are numbers and handle null values gracefully
                const totalMonthly = parseFloat(summaryData.total_monthly_hours) || 0.00;
                const expectedMonthly = parseFloat(summaryData.expected_monthly_hours) || 0.00;
                const totalWeekly = parseFloat(summaryData.total_weekly_hours) || 0.00;
                const expectedWeekly = parseFloat(summaryData.expected_weekly_hours) || 0.00;

                // ✅ Display Total & Expected Monthly/Weekly Work Hours
                document.getElementById("total-monthly-hours").innerText = `${totalMonthly.toFixed(2)}`;
                document.getElementById("expected-monthly-hours").innerText = `${expectedMonthly.toFixed(2)}`;
                document.getElementById("total-weekly-hours").innerText = `${totalWeekly.toFixed(2)}`;
                document.getElementById("expected-weekly-hours").innerText = `${expectedWeekly.toFixed(2)}`;
            })
            .catch(error => console.error("Error fetching summary data:", error));
    }

    // ✅ Fetch and Display Monthly & Weekly Work Hours on Page Load
    fetchAttendanceSummary();
});



document.addEventListener("DOMContentLoaded", function () {
    function fetchLastWeekMetrics() {
        fetch(`/get_last_week_metrics/`)
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    console.error("Error fetching last week metrics:", data.error);
                    return;
                }

                // ✅ Update UI with last week's stats
                document.querySelector(".highlight-text1").innerText = data.average_hours_per_day;
                document.querySelector(".highlight-text2").innerText = `${data.on_time_percentage}%`;
            })
            .catch(error => console.error("Error fetching last week metrics:", error));
    }

    // ✅ Fetch and display last week's work stats on page load
    fetchLastWeekMetrics();
});


// ADMIN STATUS
