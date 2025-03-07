function openCreateProjectPopup() {
    document.getElementById("createProjectModal").style.display = "flex";
}

function closeCreateProjectPopup() {
    document.getElementById("createProjectModal").style.display = "none";
}

// ✅ Ensure JavaScript runs only after DOM is fully loaded
document.addEventListener("DOMContentLoaded", function () {
    let submitButton = document.querySelector(".submit-btn");

    if (submitButton) {
        submitButton.addEventListener("click", function (event) {
            event.preventDefault();

            // ✅ Get form inputs
            let projectName = document.getElementById("projectName").value.trim();
            let startDate = document.getElementById("startDate").value;
            let endDate = document.getElementById("endDate").value;
            let scope = document.getElementById("scope").value.trim();
            let category = document.getElementById("category").value.trim();
            let benchmark = document.getElementById("Benchmark").value.trim();

            // ✅ Ensure fields are filled
            if (!projectName || !startDate || !endDate || !scope || !category || !benchmark) {
                alert("All fields are required!");
                return;
            }

            let formData = new FormData();
            formData.append("projectName", projectName);
            formData.append("startDate", startDate);
            formData.append("endDate", endDate);
            formData.append("scope", scope);
            formData.append("category", category);
            formData.append("Benchmark", benchmark);

            submitButton.disabled = true;
            submitButton.textContent = "Submitting...";

            fetch("/create-project/", {
                method: "POST",
                body: formData,
                headers: { "X-CSRFToken": getCsrfToken() }
            })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => { throw err; });
                }
                return response.json();
            })
            .then(data => {
                if (data.message) {
                    alert(data.message);
                    document.getElementById("projectForm").reset(); // ✅ Clear the form
                    closeCreateProjectPopup();
                    location.reload();
                } else {
                    alert("Error: " + (data.error || "Unknown error"));
                }
            })
            .catch(error => {
                console.error("Submission Error:", error);
                alert("An error occurred. Please check your internet connection or try again.");
            })
            .finally(() => {
                submitButton.disabled = false;
                submitButton.textContent = "Submit";
            });
        });
    }
});

// ✅ Fix `handleTaskAction` function
function handleTaskAction(action, projectName) {
    fetch('/task_action/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCsrfToken()
        },
        body: JSON.stringify({
            task_data: { name: projectName },
            action: action
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert(`Task has been ${action}ed.`);
            location.reload();
        } else {
            alert('Error: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

// ✅ Fix CSRF Token Retrieval
function getCsrfToken() {
    let cookieValue = null;
    let cookies = document.cookie ? document.cookie.split('; ') : [];

    for (let cookie of cookies) {
        let [key, value] = cookie.split('=');
        if (key === 'csrftoken') {
            return decodeURIComponent(value);
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

