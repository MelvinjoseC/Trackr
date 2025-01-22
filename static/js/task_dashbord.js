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
        if (index === dayIndex - 1) { // Adjust for Monday start
            day.classList.add('active');
        } else {
            day.classList.remove('active');
        }
    });
}

setInterval(updateClock, 1000);
updateClock();

document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', function () {
        document.querySelector('.tab.active').classList.remove('active');
        this.classList.add('active');

        // Handle the content switching logic here
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

// Get the input and display elements
const dateInput = document.getElementById("date-input");
const selectedDate = document.getElementById("selected-date");

// Function to format the date
function formatDate(dateString) {
    const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", options);
}

// Set the initial value of the date input to today's date
const today = new Date().toISOString().split("T")[0]; // Format: YYYY-MM-DD
dateInput.value = today;
selectedDate.textContent = formatDate(today);

// Update the displayed date when the user changes the date
dateInput.addEventListener("change", (event) => {
    selectedDate.textContent = formatDate(event.target.value);
});

document.addEventListener("DOMContentLoaded", () => {
    const timeElements = document.querySelectorAll(".time-display");
    timeElements.forEach((element) => {
        const decimalTime = parseFloat(element.dataset.time);
        if (!isNaN(decimalTime)) {
            const hours = Math.floor(decimalTime);
            const minutes = Math.round((decimalTime - hours) * 60);
            element.textContent = `${hours}hr ${minutes}min`;
        } else {
            element.textContent = "Not Available";
        }
    });
});


// CREATE TASK

document.addEventListener("DOMContentLoaded", function () {
    // Find the button with the ID "openPopupButton2"
    const button = document.getElementById("openPopupButton2");

    button.addEventListener("click", function (e) {
        e.preventDefault(); // Prevent any default behavior (if needed)

        // Create a modal container
        const modalContainer = document.createElement('div');
        modalContainer.id = 'popupModal';
        modalContainer.style.position = 'fixed';
        modalContainer.style.top = '50%';
        modalContainer.style.left = '50%';
        modalContainer.style.transform = 'translate(-50%, -50%)';
        modalContainer.style.width = '800px';
        modalContainer.style.height = '600px';
        modalContainer.style.backgroundColor = 'white';
        modalContainer.style.padding = '30px';
        modalContainer.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.1)';
        modalContainer.style.zIndex = '1000';
        modalContainer.style.overflowY = 'auto';
        modalContainer.style.borderRadius = '10px';
        modalContainer.style.display = 'none'; // Hide initially

        // Create a close button for the modal
        const closeButton = document.createElement('button');
        closeButton.innerText = 'Close';
        closeButton.style.position = 'absolute';
        closeButton.style.top = '10px';
        closeButton.style.right = '10px';
        closeButton.style.backgroundColor = '#dc3545';
        closeButton.style.color = 'white';
        closeButton.style.border = 'none';
        closeButton.style.borderRadius = '5px';
        closeButton.style.cursor = 'pointer';
        closeButton.addEventListener('click', function() {
            modalContainer.style.display = 'none'; // Hide the modal
        });

        // Add the content inside the modal
        const modalContent = document.createElement('div');
        modalContent.innerHTML = `
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f4f9ff;
                    margin: 0;
                    padding: 20px;
                }
                .container {
                    background-color: white;
                    padding: 30px;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                    max-width: 600px;
                    margin: 0 auto;
                }
                .form-group {
                    margin-bottom: 15px;
                }
                input[type="text"], input[type="date"], input[type="time"] {
                    width: 100%;
                    padding: 10px;
                    margin-top: 5px;
                    border-radius: 5px;
                    border: 1px solid #ddd;
                }
                button {
                    padding: 10px 15px;
                    background-color: #007bff;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                }
                button:hover {
                    background-color: #0056b3;
                }
            </style>
            <h2>CREATE Task</h2>
            <form>
                <div class="form-group">
                    <label for="taskTitle">Title:</label>
                    <input type="text" id="taskTitle" placeholder="Enter task title">
                </div>

                <div class="form-group">
                    <label for="id_project">Project</label>
                    <input type="text" id="Project" placeholder="Enter task Project">
                </div>
                <div class="form-group">
                    <label for="id_scope">Scope</label>
                    <input type="text" id="Project" placeholder="Enter task Scope">
                </div>
                <div class="form-group">
                    <label for="id_priority">Priority</label>
                    <input type="text" id="Project" placeholder="Enter task Priority">
                </div>
                <div class="form-group">
                    <label for="id_assigned_to">Assigned To</label>
                    <input type="text" id="Project" placeholder="Enter task Assigned">
                </div>
                <div class="form-group">
                    <label for="id_checker">Checker</label>
                    <input type="text" id="Project" placeholder="Enter task Checker">
                </div>
                <div class="form-group">
                    <label for="id_qc_3_checker">QC-3 Checker</label>
                    <input type="text" id="Project" placeholder="Enter task QC-3 Checker">
                </div>
                <div class="form-group">
                    <label for="id_group">Group</label>
                    <input type="text" id="Project" placeholder="Enter task Group">
                </div>
                <div class="form-group">
                    <label for="id_category">Category</label>
                    <input type="text" id="Project" placeholder="Enter task Category">
                </div>
                <div class="form-group">
                    <label for="id_start_date">Start Date</label>
                    <input type="date" id="taskDate">
                </div>
                <div class="form-group">
                    <label for="id_end_date">End Date</label>
                    <input type="date" id="taskDate">
                </div>
                <div class="form-group">
                    <label for="id_verification_status">Verification Status</label>
                    <input type="text" id="Project" placeholder="Enter task Verification Status">
                </div>
                <div class="form-group">
                    <label for="id_task_status">Task Status</label>
                    <input type="text" id="Project" placeholder="Enter task Task Status">
                </div>

                <div class="form-group">
                    <button type="submit">Save Task</button>
                </div>
            </form>
        `;

        // Append the close button and modal content to the modal container
        modalContainer.appendChild(closeButton);
        modalContainer.appendChild(modalContent);

        // Append modal to the body
        document.body.appendChild(modalContainer);

        // Show the modal
        modalContainer.style.display = 'block';
    });
});


// EDIT ALL TASK

document.addEventListener("DOMContentLoaded", function () {
    // Find the button with the ID "openPopupButton3"
    const button = document.getElementById("openPopupButton3");

    button.addEventListener("click", function (e) {
        e.preventDefault(); // Prevent any default behavior (if needed)

        // Create a modal container
        const modalContainer = document.createElement('div');
        modalContainer.id = 'popupModal';
        modalContainer.style.position = 'fixed';
        modalContainer.style.top = '50%';
        modalContainer.style.left = '50%';
        modalContainer.style.transform = 'translate(-50%, -50%)';
        modalContainer.style.width = '800px';
        modalContainer.style.height = '600px';
        modalContainer.style.backgroundColor = 'white';
        modalContainer.style.padding = '30px';
        modalContainer.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.1)';
        modalContainer.style.zIndex = '1000';
        modalContainer.style.overflowY = 'auto';
        modalContainer.style.borderRadius = '10px';
        modalContainer.style.display = 'none'; // Hide initially

        // Create a close button for the modal
        const closeButton = document.createElement('button');
        closeButton.innerText = 'Close';
        closeButton.style.position = 'absolute';
        closeButton.style.top = '10px';
        closeButton.style.right = '10px';
        closeButton.style.backgroundColor = '#dc3545';
        closeButton.style.color = 'white';
        closeButton.style.border = 'none';
        closeButton.style.borderRadius = '5px';
        closeButton.style.cursor = 'pointer';
        closeButton.addEventListener('click', function () {
            modalContainer.style.display = 'none'; // Hide the modal
        });

        // Add the content inside the modal
        const modalContent = document.createElement('div');
        modalContent.innerHTML = `
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f4f9ff;
                    margin: 0;
                    padding: 20px;
                }
                .container {
                    background-color: white;
                    padding: 30px;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                    max-width: 600px;
                    margin: 0 auto;
                }
                .form-group {
                    margin-bottom: 15px;
                }
                input[type="text"], input[type="date"], input[type="time"] {
                    width: 100%;
                    padding: 10px;
                    margin-top: 5px;
                    border-radius: 5px;
                    border: 1px solid #ddd;
                }
                button {
                    padding: 10px 15px;
                    background-color: #007bff;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                }
                button:hover {
                    background-color: #0056b3;
                }
            </style>
            <h2>Edit Task</h2>
            <form id="editTaskForm">
                <div class="form-group">
                    <label for="taskTitle">Title:</label>
                    <input type="text" id="taskTitle" placeholder="Enter task title">
                </div>

                <div class="form-group">
                    <label for="id_project">Project</label>
                    <input type="text" id="id_project" placeholder="Enter task Project">
                </div>
                <div class="form-group">
                    <label for="id_scope">Scope</label>
                    <input type="text" id="id_scope" placeholder="Enter task Scope">
                </div>
                <div class="form-group">
                    <label for="id_priority">Priority</label>
                    <input type="text" id="id_priority" placeholder="Enter task Priority">
                </div>
                <div class="form-group">
                    <label for="id_assigned_to">Assigned To</label>
                    <input type="text" id="id_assigned_to" placeholder="Enter task Assigned">
                </div>
                <div class="form-group">
                    <label for="id_checker">Checker</label>
                    <input type="text" id="id_checker" placeholder="Enter task Checker">
                </div>
                <div class="form-group">
                    <label for="id_qc_3_checker">QC-3 Checker</label>
                    <input type="text" id="id_qc_3_checker" placeholder="Enter task QC-3 Checker">
                </div>
                <div class="form-group">
                    <label for="id_group">Group</label>
                    <input type="text" id="id_group" placeholder="Enter task Group">
                </div>
                <div class="form-group">
                    <label for="id_category">Category</label>
                    <input type="text" id="id_category" placeholder="Enter task Category">
                </div>
                <div class="form-group">
                    <label for="id_start_date">Start Date</label>
                    <input type="date" id="id_start_date">
                </div>
                <div class="form-group">
                    <label for="id_end_date">End Date</label>
                    <input type="date" id="id_end_date">
                </div>
                <div class="form-group">
                    <label for="id_verification_status">Verification Status</label>
                    <input type="text" id="id_verification_status" placeholder="Enter task Verification Status">
                </div>
                <div class="form-group">
                    <label for="id_task_status">Task Status</label>
                    <input type="text" id="id_task_status" placeholder="Enter task Task Status">
                </div>

                <div class="form-group">
                    <button type="submit">Update Task</button>
                </div>
            </form>
        `;

        // Append the close button and modal content to the modal container
        modalContainer.appendChild(closeButton);
        modalContainer.appendChild(modalContent);

        // Append modal to the body
        document.body.appendChild(modalContainer);

        // Show the modal
        modalContainer.style.display = 'block';

        // Fetch and populate task data for editing
        const taskData = {
            title: "Sample Task Title",
            project: "Sample Project",
            scope: "Sample Scope",
            priority: "High",
            assignedTo: "John Doe",
            checker: "Jane Doe",
            qc3Checker: "Checker Name",
            group: "Development",
            category: "Bug Fix",
            startDate: "2025-01-22",
            endDate: "2025-01-25",
            verificationStatus: "Pending",
            taskStatus: "In Progress"
        };

        document.getElementById("taskTitle").value = taskData.title;
        document.getElementById("id_project").value = taskData.project;
        document.getElementById("id_scope").value = taskData.scope;
        document.getElementById("id_priority").value = taskData.priority;
        document.getElementById("id_assigned_to").value = taskData.assignedTo;
        document.getElementById("id_checker").value = taskData.checker;
        document.getElementById("id_qc_3_checker").value = taskData.qc3Checker;
        document.getElementById("id_group").value = taskData.group;
        document.getElementById("id_category").value = taskData.category;
        document.getElementById("id_start_date").value = taskData.startDate;
        document.getElementById("id_end_date").value = taskData.endDate;
        document.getElementById("id_verification_status").value = taskData.verificationStatus;
        document.getElementById("id_task_status").value = taskData.taskStatus;
    });
});
