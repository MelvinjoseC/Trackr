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


// SAVING LEAVE APPLICATION
document.addEventListener("DOMContentLoaded", function () {
    let requestLeaveButton = document.querySelector(".submit-leave-btn");

    if (requestLeaveButton) {
        requestLeaveButton.addEventListener("click", function (event) {
            event.preventDefault();

            // ✅ Get form values
            let startDate = document.getElementById("from_date")?.value.trim() || "";
            let endDate = document.getElementById("to_date")?.value.trim() || "";
            let leaveType = document.getElementById("leave-type")?.value.trim() || "";
            let reason = document.getElementById("reason")?.value.trim() || "";
            let approverSelect = document.getElementById("notify");
            let approver = approverSelect.options[approverSelect.selectedIndex].text.trim();

            // ✅ Ensure fields are filled
            if (!startDate || !endDate || !leaveType || !reason || !approver) {
                alert("All fields are required!");
                return;
            }

            let formData = new FormData();
            formData.append("from_date", startDate);
            formData.append("to_date", endDate);
            formData.append("leave-type", leaveType);
            formData.append("reason", reason);
            formData.append("approver", approver);

            requestLeaveButton.disabled = true;
            requestLeaveButton.textContent = "Submitting...";

            fetch("/apply-leave/", {
                method: "POST",
                body: formData,
                headers: { "X-CSRFToken": getCsrfToken() }
            })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    alert(data.error);
                } else {
                    alert(data.message);

                    // ✅ Fix: Check if form exists before resetting
                    let leaveForm = document.getElementById("leave-form");
                    if (leaveForm) {
                        leaveForm.reset();
                    }

                 
                }
            })
            .catch(error => {
                console.error("Error:", error);
                alert("Something went wrong. Please try again.");
            })
            .finally(() => {
                requestLeaveButton.disabled = false;
                requestLeaveButton.textContent = "Request Leave";
            });
        });
    }
});

// ✅ Function to get CSRF token from cookies
function getCsrfToken() {
    let cookieValue = null;
    let cookies = document.cookie ? document.cookie.split("; ") : [];

    for (let cookie of cookies) {
        let [key, value] = cookie.split("=");
        if (key === "csrftoken") {
            return decodeURIComponent(value);
        }
    }
    return cookieValue;
}


// HOLIDAYS
document.addEventListener("DOMContentLoaded", function () {
    fetch("/get-holidays/")
        .then(response => response.json())
        .then(data => {
            let holidayContainer = document.getElementById("holiday-container");
            holidayContainer.innerHTML = ""; // Clear existing rows

            if (data.holidays.length === 0) {
                holidayContainer.innerHTML = "<div class='holiday-row'><span class='holiday-name'>No upcoming holidays</span></div>";
                return;
            }

            data.holidays.forEach(holiday => {
                let statusClass = holiday.status === "past" ? "past-holiday" : "upcoming-holiday";

                let holidayRow = `<div class="holiday-row ${statusClass}">
                    <span class="holiday-name">${holiday.name}</span>
                    <span class="holiday-date">${formatDate(holiday.date)}</span>
                </div>`;
                holidayContainer.innerHTML += holidayRow;
            });
        })
        .catch(error => console.error("Error fetching holidays:", error));
});

// ✅ Helper function to format date properly (YYYY-MM-DD → Day DD/MM/YYYY)
function formatDate(dateStr) {
    let dateObj = new Date(dateStr);
    let options = { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' };
    return dateObj.toLocaleDateString("en-GB", options);  // Example: Monday 17/06/2025
}


//REQUESTS

document.addEventListener("DOMContentLoaded", function () {
    fetch("/api/leave-applications/")  // Fetch leave applications
        .then(response => response.json())
        .then(data => {
            const leaveContainer = document.getElementById("leave-container"); // Ensure this container exists in your HTML
            
            data.forEach(leave => {
                const leaveRow = document.createElement("div");
                leaveRow.classList.add("leave-row");

                // Check if status is "Pending" for enabling the edit button
                const isEditable = leave.status.toLowerCase() === "pending";
                const editButtonHTML = isEditable 
                    ? `<button class="action-btn edit-btn" data-id="${leave.id}" data-start="${leave.start_date}" data-end="${leave.end_date}" data-reason="${leave.reason}" data-type="${leave.leave_type}" data-status="${leave.status}">
                        <img src="/static/images/blue_edit_button.png">
                       </button>`
                    : `<button class="action-btn edit-btn disabled" disabled>
                        <img src="/static/images/blue_edit_button_disabled.png">
                       </button>`; // Disabled edit button

                leaveRow.innerHTML = `
                    <div class="leave-cell">
                        <div class="leave-date">${formatDate(leave.start_date)} - ${formatDate(leave.end_date)}</div>
                        <div class="leave-duration">${calculateDays(leave.start_date, leave.end_date)} days</div>
                    </div>
                    <div class="leave-cell">
                        <div class="leave-form ${formatLeaveType(leave.leave_type)}">${leave.leave_type.toUpperCase()}</div>
                    </div>
                    <div class="leave-cell">
                        <div class="leave-label">Leave Type</div>
                        <div class="leave-value">${leave.leave_type}</div>
                    </div>
                    <div class="leave-cell">
                        <div class="leave-label">Requested On</div>
                        <div class="leave-value">${formatDate(leave.created_at)}</div>
                    </div>
                    <div class="leave-cell">
                        <div class="leave-label">Status</div>
                        <div class="leave-approval ${formatStatus(leave.status)}">${leave.status}</div>
                    </div>
                    <div class="leave-cell">
                        <div class="leave-label">Approved By</div>
                        <div class="leave-value">${leave.approver}</div>
                    </div>
                    <div class="leave-cell actions">
                        <button class="action-btn comment-btn"><img src="/static/images/comment_button.png"></button>
                        ${editButtonHTML} <!-- Only enabled if status is "Pending" -->
                        <button class="action-btn delete-btn" data-id="${leave.id}"><img src="/static/images/delete_button.png"></button>
                    </div>
                `;

                leaveContainer.appendChild(leaveRow);
            });

            // Attach event listeners for Edit and Delete buttons
            document.querySelectorAll(".edit-btn:not(.disabled)").forEach(button => {
                button.addEventListener("click", function () {
                    const leaveId = this.getAttribute("data-id");
                    const startDate = this.getAttribute("data-start");
                    const endDate = this.getAttribute("data-end");
                    const reason = this.getAttribute("data-reason");
                    const leaveType = this.getAttribute("data-type");

                    openEditModal(leaveId, startDate, endDate, reason, leaveType);
                });
            });

            document.querySelectorAll(".delete-btn").forEach(button => {
                button.addEventListener("click", function () {
                    const leaveId = this.getAttribute("data-id");
                    deleteLeave(leaveId);
                });
            });
        })
        .catch(error => console.error("Error fetching leave applications:", error));
});

// Function to open the Edit Modal
function openEditModal(leaveId, startDate, endDate, reason, leaveType) {
    document.getElementById("edit-leave-id").value = leaveId;
    document.getElementById("edit-start-date").value = startDate;
    document.getElementById("edit-end-date").value = endDate;
    document.getElementById("edit-reason").value = reason;
    document.getElementById("edit-leave-type").value = leaveType;

    document.getElementById("edit-modal").style.display = "block"; // Show modal
}

// Function to update leave application
async function updateLeavedata() {
    const leaveId = document.getElementById("edit-leave-id").value;
    const startDate = document.getElementById("edit-start-date").value;
    const endDate = document.getElementById("edit-end-date").value;
    const reason = document.getElementById("edit-reason").value;
    const leaveType = document.getElementById("edit-leave-type").value;

    // Get CSRF token from cookies
    function getCSRFToken() {
        return document.cookie.split('; ').find(row => row.startsWith('csrftoken'))?.split('=')[1];
    }

    try {
        const response = await fetch(`/leave/edit/${leaveId}/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "X-CSRFToken": getCSRFToken(),  // Add CSRF token
            },
            body: new URLSearchParams({
                start_date: startDate,
                end_date: endDate,
                reason: reason,
                leave_type: leaveType
            }),
        });

        const data = await response.json();
        if (response.ok) {
            alert("Leave updated successfully!");
            document.getElementById("edit-modal").style.display = "none"; // Hide modal
            location.reload(); // Refresh page to reflect changes
        } else {
            alert("Error: " + data.error);
        }
    } catch (error) {
        alert("Network error! Please try again.");
    }
}


// Function to delete leave application
async function deleteLeave(leaveId) {
    if (!confirm("Are you sure you want to delete this leave?")) {
        return;
    }

    // Function to get CSRF token from cookies
    function getCSRFToken() {
        return document.cookie.split('; ').find(row => row.startsWith('csrftoken'))?.split('=')[1];
    }

    try {
        const response = await fetch(`/leave/delete/${leaveId}/`, {
            method: "POST", // Using POST instead of DELETE
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCSRFToken(),  // Add CSRF Token
            },
        });

        const data = await response.json();

        if (response.ok) {
            alert("✅ Leave application deleted successfully!");
            location.reload();
        } else {
            alert("❌ " + data.error); // Show error in popup
        }
    } catch (error) {
        alert("⚠️ Network error! Please try again.");
    }
}




// Function to close the modal
function closeModals() {
    document.getElementById("edit-modal").style.display = "none";
}



// Helper function to calculate total leave days
function calculateDays(start, end) {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate - startDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
}

// Helper function to apply CSS classes for status
function formatStatus(status) {
    return status.toLowerCase() === "pending" ? "pending" : status.toLowerCase();
}

// Helper function to format leave type for CSS classes
function formatLeaveType(type) {
    return type.toLowerCase().replace(/\s+/g, "-");
}



//APPROVAL 
document.addEventListener("DOMContentLoaded", function () {
    const leaveContainer = document.getElementById("leave-container");
    const approvalButton = document.getElementById("approvals-btn");

    // Get the username from global_user_data (exposed in Django template)
    const currentUsername = "{{ global_user_data.name }}"; // Use Django template syntax

    // Fetch the list of admins from the database
    fetch("/get-admins/")  // Ensure this matches your Django API URL
        .then(response => response.json())
        .then(data => {
            if (!data.admins || !Array.isArray(data.admins)) {
                console.error("Invalid admin data:", data);
                return;
            }

            // Check if the logged-in username exists in the admin list
            const isAdmin = data.admins.some(admin => admin.name === currentUsername);

            if (isAdmin) {
                approvalButton.style.display = "block"; // Show button if user is admin
            }
        })
        .catch(error => console.error("Error fetching admins:", error));

        approvalButton.addEventListener("click", function () {
            loadApprovals();
        });
    
        function loadApprovals() {
            fetch("/api/leave-approvals/")
                .then(response => response.json())
                .then(data => {
                    const approvalContainer = document.getElementById("approval-container");
        
                    if (!approvalContainer) {
                        console.error("❌ Missing approval list container!");
                        return;
                    }
        
                    approvalContainer.innerHTML = ""; // ✅ Clear old approvals before adding new ones
        
                    data.forEach(leave => {
                        const leaveRow = document.createElement("div");
                        leaveRow.classList.add("leave-row");
        
                        leaveRow.innerHTML = `
                            <div class="leave-cell">
                                <div class="leave-date">(${formatDate(leave.start_date)} - ${formatDate(leave.end_date)})</div>
                            </div>
                            <div class="leave-cell">
                                <div class="leave-label">User</div>
                                <div class="leave-value">${leave.username}</div>
                            </div>
                            <div class="leave-cell">
                                <div class="leave-label">Reason</div>
                                <div class="leave-value">${leave.reason}</div>
                            </div>
                            <div class="leave-cell">
                                <div class="leave-label">Type</div>
                                <div class="leave-value">${leave.leave_type}</div>
                            </div>
                            <div class="leave-cell">
                                <button class="approve-btn" data-id="${leave.id}" data-status="Approved">Approve</button>
                                <button class="reject-btn" data-id="${leave.id}" data-status="Rejected">Reject</button>
                            </div>
                        `;
        
                        approvalContainer.appendChild(leaveRow);
                    });
        
                    // ✅ Attach event listeners to buttons
                    document.querySelectorAll(".approve-btn, .reject-btn").forEach(button => {
                        button.addEventListener("click", updateLeaveStatus);
                    });
        
                })
                .catch(error => console.error("❌ Error fetching approvals:", error));
        }
        
        
        
        function updateLeaveStatus(event) {
            const leaveId = event.target.getAttribute("data-id");
            const newStatus = event.target.getAttribute("data-status");        
           console.log("Leave ID:", leaveId, "New Status:", newStatus);  // Debugging
        
            if (!leaveId || !newStatus) {
                console.error("Invalid leave ID or status.");
                return;
            }
        
            console.log("CSRF Token:", getCsrfToken());  // ✅ Now logs the actual token value
            console.log("Leave ID:", leaveId);
            console.log("New Status:", newStatus);
            
            fetch('/api/update-leave-status/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken':getCsrfToken(),  // Include the CSRF token
                },
                body: JSON.stringify({ id: leaveId, status: newStatus }),
            })
            .then(response => response.json())
            .then(data => {
                console.log('Server Response:', data);
                if (data.message) {
                    alert(data.message);
                    loadApprovals();  // Refresh or update the UI as needed
                } else if (data.error) {
                    alert(`Error: ${data.error}`);
                }
            })
            .catch(error => console.error('Error updating status:', error));        
}    

    
});


document.addEventListener("DOMContentLoaded", function () {
    fetch('/api/check-admin-status/', {
        method: 'GET',
        credentials: 'include', // ✅ Ensures authentication session is sent
    })
    .then(response => response.json())
    .then(data => {
        console.log("🔍 API Response:", data); // ✅ Debugging: Check API response

        const approvalButton = document.getElementById("approvals-btn");

        if (data.is_admin) {
            console.log("✅ User is admin, showing button");
            approvalButton.style.display = "block";  // ✅ Show button for admins
        } else {
            console.log("❌ User is NOT admin, hiding button");
            approvalButton.style.display = "none";   // ❌ Hide button for non-admins
        }
    })
    .catch(error => console.error("❌ Error fetching admin status:", error));
});


// ✅ Now define toggleButton AFTER loadApprovals
function toggleButton() {
    const button = document.getElementById("approvals-btn");
    const leaveContainer = document.getElementById("leave-container");
    const approvalContainer = document.getElementById("approval-container");

    if (!button || !leaveContainer || !approvalContainer) {
        console.error("❌ Missing required elements in HTML!");
        return;
    }

    if (leaveContainer.style.display === "block" || leaveContainer.style.display === "") {
        // ✅ First click → Show approvals, hide leave history
        button.innerText = "VIEW HISTORY";
        leaveContainer.style.display = "none";
        approvalContainer.style.display = "block";
        
    } else {
        // ✅ Second click → Show leave history, hide approvals
        button.innerText = "APPROVALS";
        leaveContainer.style.display = "block";
        approvalContainer.style.display = "none";
    }
}

