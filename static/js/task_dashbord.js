// Function to initialize clock and highlight the current day
function updateClock() {
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const date = now.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

    document.getElementById('current-time').textContent = time;
    document.getElementById('current-date').textContent = date;

    // Highlight the current day
    const dayIndex = now.getDay(); // 0 = Sunday, 6 = Saturday
    const days = document.querySelectorAll('.day');
    days.forEach((day, index) => {
        if (index === dayIndex - 1) {
            day.classList.add('active');
        } else {
            day.classList.remove('active');
        }
    });
}

setInterval(updateClock, 1000);
updateClock();

// Fetch and display tasks when the page loads

// Function to populate dropdowns
function populateDropdowns(tasks) {
    // Dropdown IDs and their pairs
    const dropdownPairs = [
        { primary: "id_project", secondary: "id_project2", field: "projects" },
        { primary: "id_scope", secondary: "id_scope2", field: "scope" },
        { primary: "id_priority", secondary: "id_priority2", field: "priority" },
        { primary: "id_category", secondary: "id_category2", field: "category" },
        { primary: "id_verification_status", secondary: "id_verification_status2", field: "verification_status" },
        { primary: "id_task_status", secondary: "id_task_status2", field: "task_status" },
    ];

    dropdownPairs.forEach(pair => {
        const primaryDropdown = document.getElementById(pair.primary);
        const secondaryDropdown = document.getElementById(pair.secondary);

        if (primaryDropdown && secondaryDropdown) {
            // Clear existing options
            primaryDropdown.innerHTML = '<option value="">Select</option>';
            secondaryDropdown.innerHTML = '<option value="">Select</option>';

            // Populate dropdowns with task data
            tasks.forEach(task => {
                const value = task[pair.field];
                if (value) {
                    const option1 = document.createElement("option");
                    const option2 = document.createElement("option");

                    option1.value = value;
                    option1.textContent = value;

                    option2.value = value;
                    option2.textContent = value;

                    primaryDropdown.appendChild(option1);
                    secondaryDropdown.appendChild(option2);
                }
            });
        } else {
            console.error(`Dropdowns with IDs '${pair.primary}' or '${pair.secondary}' not found.`);
        }
    });
}




// Fetch data and populate dropdowns
document.addEventListener("DOMContentLoaded", () => {
    fetch("/api/task_dashboard/")
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("Fetched Tasks Data:", data);
            if (data.tasks && data.tasks.length > 0) {
                populateDropdowns(data.tasks);
            } else {
                console.error("No tasks data found in API response.");
            }
        })
        .catch(error => {
            console.error("Error fetching tasks:", error);
        });
});



// Handle tab switching for Running, Revisions, and Others
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', function () {
        document.querySelector('.tab.active').classList.remove('active');
        this.classList.add('active');

        // Switch content dynamically based on the tab
        const content = document.querySelector('.project-list');
        if (this.textContent === 'Running') {
            content.innerHTML = `
                <div class="project-item">RORO Bridge <span>DEME</span></div>
                <div class="project-item">PANAMA Chock Support <span>Value Maritime</span></div>
                <div class="project-item">JB-119 Boatlanding <span>CADELER</span></div>`;
        } else if (this.textContent === 'Revisions') {
            content.innerHTML = `<div class="project-item">Project X <span>Review</span></div>`;
        } else {
            content.innerHTML = `<div class="project-item">Project Y <span>Upcoming</span></div>`;
        }
    });
});

// Handle date input and update selected date
const dateInput = document.getElementById("date-input");
const selectedDate = document.getElementById("selected-date");

function formatDate(dateString) {
    const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", options);
}

dateInput.value = new Date().toISOString().split("T")[0];
selectedDate.textContent = formatDate(dateInput.value);

dateInput.addEventListener("change", event => {
    selectedDate.textContent = formatDate(event.target.value);
});

document.addEventListener("DOMContentLoaded", function () {
    const button = document.getElementById("openPopupButton2");

    button.addEventListener("click", function (e) {
        e.preventDefault(); // Prevent any default behavior (if needed)

        // Get the modal container
        const modal = document.getElementById('taskModalPopup');
        modal.style.display = 'block'; // Show the modal

        // Get the close button and add event listener
        const closeButton = document.getElementById('closeModal');
        closeButton.addEventListener('click', function () {
            modal.style.display = 'none'; // Hide the modal when clicked
        });
    });
});


document.addEventListener("DOMContentLoaded", function () {
    // Get the button and modal elements
    const button = document.getElementById("openPopupButton");

    button.addEventListener("click", function (e) {
        e.preventDefault(); // Prevent any default behavior (if needed)

        // Get the modal container
        const modal = document.getElementById('popupModal');
        modal.style.display = 'block'; // Show the modal

        // Get the close button and add event listener
        const closeButton = document.getElementById('closePopupButton');
        closeButton.addEventListener('click', function () {
            modal.style.display = 'none'; // Hide the modal when clicked
        });
    });
});

// Create reusable modal for creating and editing tasks

document.getElementById("createTaskForm").addEventListener("submit", function (e) {
    e.preventDefault(); // Prevent the page from reloading

    // Collect form data
    const taskData = {
        title: document.getElementById("taskTitle2").value,
        project: document.getElementById("id_project").value,
        scope: document.getElementById("id_scope").value,
        priority: document.getElementById("id_priority").value,
        assigned_to: document.getElementById("assignedTo").value,
        checker: document.getElementById("checker").value,
        qc_3_checker: document.getElementById("qcChecker").value,
        group: document.getElementById("group").value,
        category: document.getElementById("id_category").value,
        start_date: document.getElementById("startDate").value,
        end_date: document.getElementById("endDate").value,
        verification_status: document.getElementById("id_verification_status").value,
        task_status: document.getElementById("id_task_status").value,
    };
    console.log("Task Created taskData:", taskData); // Log the response
    // Send the data to the backend
    fetch("/api/create-task/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(taskData),
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json().then((data) => ({
                status: response.status,
                body: data
            }));
            
        })
        .then((data) => {
            console.log("Task Created:", data); // Log the response
            alert("Task created successfully!"); // Optional success notification
        })
        .catch((error) => {
            console.error("Error creating task:", error);
            alert("Error creating task. Check console for details.");
        });
});


document.getElementById("editTaskForm").addEventListener("submit", function (e) {
    e.preventDefault(); // Prevent form from reloading the page

    // Collect form data
    const taskData = {
        title: document.getElementById("taskTitle").value,
        project: document.getElementById("id_project2").value,
        scope: document.getElementById("id_scope2").value,
        priority: document.getElementById("id_priority2").value,
        assigned_to: document.getElementById("id_assigned_to2").value,
        checker: document.getElementById("id_checker2").value,
        qc_3_checker: document.getElementById("id_qc_3_checker2").value,
        group: document.getElementById("id_group2").value,
        category: document.getElementById("id_category2").value,
        start_date: document.getElementById("id_start_date2").value,
        end_date: document.getElementById("id_end_date2").value,
        verification_status: document.getElementById("id_verification_status2").value,
        task_status: document.getElementById("id_task_status2").value,
    };

    fetch(`/api/edit-task/${taskId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(taskData),
    })
        .then((response) => response.json())
        .then((data) => {
            console.log("Task Edited:", data); // Logs the response JSON
        })
        .catch((error) => console.error("Error editing task:", error));
    
});
