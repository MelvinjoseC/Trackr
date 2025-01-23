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
document.addEventListener("DOMContentLoaded", () => {
    fetch("/api/task_dashboard/") // Use the JSON API endpoint
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json(); // Parse the JSON response
        })
        .then(data => {
            console.log("Fetched Tasks Data:", data); // Log the tasks data to the console
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

// Create Task Modal
function openCreateTaskModal() {
    const modal = createTaskModal("CREATE Task", "Save Task");
    document.body.appendChild(modal);
    modal.style.display = "block";
}

// Edit Task Modal
function openEditTaskModal(taskData) {
    const modal = createTaskModal("EDIT Task", "Update Task", taskData);
    document.body.appendChild(modal);
    modal.style.display = "block";
}

// Create reusable modal for creating and editing tasks
function createTaskModal(title, buttonText, taskData = {}) {
    const modalContainer = document.createElement("div");
    modalContainer.className = "modal";
    modalContainer.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 800px;
        height: auto;
        background: #fff;
        z-index: 1000;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
    `;

 
    closeButton.innerText = "Close";
    closeButton.style.cssText = `
        position: absolute;
        top: 10px;
        right: 10px;
        background: #dc3545;
        color: #fff;
        border: none;
        border-radius: 5px;
        cursor: pointer;
    `;
    closeButton.addEventListener("click", () => modalContainer.remove());

    const modalContent = document.createElement("div");
    modalContent.innerHTML = `
        <h2>${title}</h2>
        <form id="taskForm">
            <div class="form-group">
                <label>Title:</label>
                <input type="text" id="taskTitle" value="${taskData.title || ''}" />
            </div>
            <div class="form-group">
                <label>Project:</label>
                <input type="text" id="taskProject" value="${taskData.project || ''}" />
            </div>
            <div class="form-group">
                <label>Scope:</label>
                <input type="text" id="taskScope" value="${taskData.scope || ''}" />
            </div>
            <div class="form-group">
                <label>Status:</label>
                <input type="text" id="taskStatus" value="${taskData.task_status || ''}" />
            </div>
            <div class="form-group">
                <button type="submit">${buttonText}</button>
            </div>
        </form>
    `;

    const form = modalContent.querySelector("#taskForm");
    form.addEventListener("submit", event => {
        event.preventDefault();
        const taskDetails = {
            title: document.getElementById("taskTitle").value,
            project: document.getElementById("taskProject").value,
            scope: document.getElementById("taskScope").value,
            task_status: document.getElementById("taskStatus").value,
        };
        console.log("Task Details Submitted:", taskDetails);
        modalContainer.remove();
    });

    modalContainer.appendChild(closeButton);
    modalContainer.appendChild(modalContent);
    return modalContainer;
}

// Attach button listeners for creating and editing tasks
document.getElementById("openPopupButton2").addEventListener("click", openCreateTaskModal);
document.getElementById("openPopupButton3").addEventListener("click", () => {
    const sampleTask = {
        title: "Sample Task",
        project: "Sample Project",
        scope: "Sample Scope",
        task_status: "In Progress",
    };
    openEditTaskModal(sampleTask);
});

