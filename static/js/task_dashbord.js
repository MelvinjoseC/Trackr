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

    // Fetch tasks data from the API
    fetch("/api/task_dashboard/")
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json(); // Parse the JSON response
    })
    .then(data => {
        console.log("Fetched Tasks Data:", data); // Log the full response

        if (data.success && Array.isArray(data.tasks)) {
            populateProjectDropdown(data.tasks); // Pass the tasks array
        } else {
            console.error("Tasks data is not in the expected format:", data);
        }
    })
    .catch(error => {
        console.error("Error fetching tasks:", error);
    });

// Function to populate the dropdown with task projects
function populateProjectDropdown(tasks) {
    const projectDropdown = document.getElementById("id_project"); // Select the dropdown
    const projectDropdown2 = document.getElementById("id_project2"); 
    // Clear existing options
    projectDropdown.innerHTML = '<option value="">Select Project</option>';
    projectDropdown2.innerHTML = '<option value="">Select Project</option>';

    // Loop through the tasks array
    tasks.forEach(task => {
        const option1 = document.createElement("option");
        option1.value = task.project; // Use project as the value
        option1.textContent = task.project; // Display the project name
        projectDropdown.appendChild(option1); // Add the option to the first dropdown

        const option2 = document.createElement("option");
        option2.value = task.project; // Use project as the value
        option2.textContent = task.project; // Display the project name
        projectDropdown2.appendChild(option2); // Add the option to the second dropdown
    });
}



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
        const closeButton = document.getElementById('closeModal');
        closeButton.addEventListener('click', function () {
            modal.style.display = 'none'; // Hide the modal when clicked
        });
    });
});

// Create reusable modal for creating and editing tasks

