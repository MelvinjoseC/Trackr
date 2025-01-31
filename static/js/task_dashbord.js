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

function handleButtonClick(event) {
    event.preventDefault();  // Prevent form submission or default behavior

    const selectedDate = document.getElementById('date-input').value; // Get the selected date from the input
    console.log("Selected Date:", selectedDate);

    // Normalize selectedDate
    const selectedFormattedDate = new Date(selectedDate).toISOString().split('T')[0]; // Format to YYYY-MM-DD

    // Filter tasks based on the selected date
    const filteredTasks = golbalfetchdata.tasks.filter(task => {
        const taskDate = task.start;

        // Normalize taskDate
        const formattedTaskDate = taskDate ? new Date(taskDate).toISOString().split('T')[0] : null;

        console.log("Task Date:", formattedTaskDate);

        // Check if the task's start_date matches the selected date (both strings in YYYY-MM-DD format)
        return formattedTaskDate && formattedTaskDate === selectedFormattedDate;
    });

    // Show tasks when the button is clicked
    if (filteredTasks.length > 0) {
        populateTimesheet(filteredTasks);
    } else {
        populateTimesheet([]); // No tasks found for the selected date
    }
}


// Function to populate the timesheet with tasks
function populateTimesheet(tasks) {
    const timesheetContent = document.getElementById("timesheetContent");
    timesheetContent.innerHTML = "";  // Clear any existing content

    if (tasks.length > 0) {
        tasks.forEach(task => {
            const taskRow = document.createElement("div");
            taskRow.classList.add("timesheet-row");

            taskRow.innerHTML = `
                <div class="task-info">
                    <h4 class="task-type">${task.scope}</h4> <!-- Scope -->
                    <p class="task-name">${task.title}</p> <!-- Title -->
                    <p class="task-meta">${task.projects ? task.projects : 'No Project Assigned'}, ${task.d_no ? 'REV NO: ' + task.d_no : 'No Rev No'}</p> <!-- Projects and Assigned -->
                </div>
                <div class="task-time">
                    <p>
                        ${task.start ? new Date(task.start).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Not Available'} <!-- Start date -->
                    </p>
                </div>
                <div class="task-actions">
                    <i class="fas fa-comment-alt"></i>
                    <i class="fas fa-trash"></i>
                </div>
            `;
            
            timesheetContent.appendChild(taskRow); // Append the task row to the content
        });
    } else {
        const noDataMessage = document.createElement("p");
        noDataMessage.textContent = "No Data Found";
        timesheetContent.appendChild(noDataMessage);
    }
}




var globalselectedtitil_for_edit_task

// Add event listener to the button
document.getElementById("date_in_daily_timesheet").addEventListener("click", handleButtonClick);

setInterval(updateClock, 1000);
updateClock();
// Fetch and display tasks when the page loads

// Function to populate dropdowns
function populateDropdowns(tasks) {
    let selectedProject = "";
    let selectedList = "";

    // Helper function to populate a dropdown with unique options
    function populateDropdown(dropdownId, field, filterTasks = tasks) {
        const dropdown = document.getElementById(dropdownId);
        
        if (dropdown) {
            // Clear existing options and add a default option
            dropdown.innerHTML = '<option value="">Select</option>';

            // Track unique values using a Set
            const uniqueOptions = new Set();

            // Populate the dropdown based on the filtered tasks
            filterTasks.forEach(task => {
                const value = task[field];
                if (value && !uniqueOptions.has(value)) {
                    uniqueOptions.add(value);  // Add value to the Set

                    const option = document.createElement("option");
                    option.value = value;
                    option.textContent = value;
                    dropdown.appendChild(option);
                }
            });
        } else {
            console.error(`Dropdown with ID '${dropdownId}' not found.`);
        }
    }

    // Filter and populate dependent dropdowns dynamically
    function handleDependentDropdowns() {
        const filteredTasks = tasks.filter(task =>
            (!selectedList || task.list === selectedList)
        );

        populateDropdown("id_scope", "scope", filteredTasks);
        populateDropdown("id_priority", "priority", filteredTasks);
        populateDropdown("id_category", "category", filteredTasks);
        populateDropdown("id_verification_status", "verification_status", filteredTasks);
        populateDropdown("id_task_status", "task_status", filteredTasks);
    }

    // Handle change event for list dropdown to filter projects
    document.getElementById("id_list").addEventListener("change", function() {
        selectedList = this.value;

        // Filter projects based on the selected list
        const filteredProjects = tasks.filter(task => task.list === selectedList);
        populateDropdown("id_project", "projects", filteredProjects);

        handleDependentDropdowns();  // Refresh dependent dropdowns
    });

    // Handle change events for project dropdown
    document.getElementById("id_project").addEventListener("change", function() {
        selectedProject = this.value;
        handleDependentDropdowns();  // Refresh dependent dropdowns
    });

    // Initially populate list and project dropdowns
    populateDropdown("id_list", "list");
    populateDropdown("id_project", "projects");
}


function populateDropdowns_updatetask(tasks) {
    let selectedProject = "";
    let selectedList = "";

    // Helper function to populate a dropdown with unique options
    function populateDropdown_updatetask(dropdownId, field, filterTasks = tasks) {
        const dropdown = document.getElementById(dropdownId);

        if (dropdown) {
            // Clear existing options and add a default option
            dropdown.innerHTML = '<option value="">Select</option>';

            // Track unique values using a Set
            const uniqueOptions = new Set();

            // Populate the dropdown based on the filtered tasks
            filterTasks.forEach(task => {
                const value = task[field];
                if (value && !uniqueOptions.has(value)) {
                    uniqueOptions.add(value);  // Add value to the Set

                    const option = document.createElement("option");
                    option.value = value;
                    option.textContent = value;
                    dropdown.appendChild(option);
                }
            });
        } else {
            console.error(`Dropdown with ID '${dropdownId}' not found.`);
        }
    }



    // Populate form fields based on selected task data
    function populateFormFields(selectedTask) {
        if (selectedTask) {
            document.getElementById("taskTitle3").value = selectedTask.title || "";
            document.getElementById("id_dno2").value = selectedTask.d_no || "";
            document.getElementById("id_priority2").value = selectedTask.priority || "";
            document.getElementById("id_assigned_to2").value = selectedTask.assigned_to || "";
            document.getElementById("id_checker2").value = selectedTask.checker || "";
            document.getElementById("id_qc_3_checker2").value = selectedTask.qc_3_checker || "";
            document.getElementById("id_group2").value = selectedTask.group || "";
            document.getElementById("id_category2").value = selectedTask.category || "";
            document.getElementById("id_start_date2").value = selectedTask.start_date || "";
            document.getElementById("id_end_date2").value = selectedTask.end_date || "";
            document.getElementById("id_verification_status2").value = selectedTask.verification_status || "";
            document.getElementById("id_task_status2").value = selectedTask.task_status || "";
        }
    }

    // Filter and populate dependent dropdowns dynamically
    function handleDependentDropdowns_updatetask() {
        const filteredTasks = tasks.filter(task => (!selectedList || task.list === selectedList));

        populateDropdown_updatetask("id_scope2", "scope", filteredTasks);
        populateDropdown_updatetask("taskTitle2", "title", filteredTasks);
        populateDropdown_updatetask("id_revno2", "rev", filteredTasks);
        populateDropdown_updatetask("id_priority2", "priority", filteredTasks);
        populateDropdown_updatetask("id_category2", "category", filteredTasks);
        populateDropdown_updatetask("id_verification_status2", "verification_status", filteredTasks);
        populateDropdown_updatetask("id_task_status2", "task_status", filteredTasks);
    }

    // Event listener to populate form when title is selected
    document.getElementById("taskTitle2").addEventListener("change", function () {
        const selectedTitle = this.value;
        const selectedTask = tasks.find(task => task.title === selectedTitle);
        globalselectedtitil_for_edit_task =selectedTitle;
        console.log("globalselectedtitil_for_edit_task:",globalselectedtitil_for_edit_task);
        populateFormFields(selectedTask);
    });

    // Event listener to populate form when REV NO is selected
    document.getElementById("id_revno2").addEventListener("change", function () {
        const selectedRevNo = this.value;
        const selectedTask = tasks.find(task => task.rev_no === selectedRevNo);
        populateFormFields(selectedTask);
    });

    // Event listener for Category
    document.getElementById("id_category2").addEventListener("change", function () {
        const selectedCategory = this.value.trim();
        const selectedTask = tasks.find(task => task.category.trim() === selectedCategory);
            populateFormFields(selectedTask);
    });

    // Handle change event for list dropdown to filter projects
    document.getElementById("id_list2").addEventListener("change", function () {
        selectedList = this.value;

        // Filter projects based on the selected list
        const filteredProjects = tasks.filter(task => task.list === selectedList);
        populateDropdown_updatetask("id_project2", "projects", filteredProjects);

        handleDependentDropdowns_updatetask();  // Refresh dependent dropdowns
    });

    // Handle change events for project dropdown
    document.getElementById("id_project2").addEventListener("change", function () {
        selectedProject = this.value;
        handleDependentDropdowns_updatetask();  // Refresh dependent dropdowns
    });

    // Initially populate list and project dropdowns
    populateDropdown_updatetask("id_list2", "list");
    populateDropdown_updatetask("id_project2", "projects");
}



let golbalfetchdata

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
                golbalfetchdata = data
                populateDropdowns(data.tasks);
                populateDropdowns_updatetask(data.tasks);
                console.log("Fetched Tasks Data:", data);
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

// CREATE TASKS OPEN AND CLOSE BUTTON

document.addEventListener("DOMContentLoaded", function () {
    const button = document.getElementById("openPopupButton2");

    button.addEventListener("click", function (e) {
        e.preventDefault(); // Prevent any default behavior (if needed)

        // Get the modal container
        const modal = document.getElementById('taskModalPopup');
        modal.style.display = 'block'; // Show the modal

        // Get the close button and add event listener
      
    });
});

// EDIT TASKS OPEN AND CLOSE BUTTON

document.addEventListener("DOMContentLoaded", function () {
    // Get the button and modal elements
    const button = document.getElementById("openPopupButton");

    button.addEventListener("click", function (e) {
        e.preventDefault(); // Prevent any default behavior (if needed)

        // Get the modal container
        const modal = document.getElementById('popupModal');
        modal.style.display = "flex"; // Show the modal

    });
});

// Create reusable modal for creating and editing tasks

document.getElementById("savetask_creattask").addEventListener("click", function (e) {
    e.preventDefault(); // Prevent default behavior (if inside a form)
    // Collect form data
    const taskData = {
        title: document.getElementById("taskTitle").value,
        list: document.getElementById("id_list").value,
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
        rev_no: document.getElementById("id_revno").value,
        d_no: document.getElementById("id_dno").value,
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


document.getElementById("savetask_updatetask").addEventListener("click", function (e) {
    e.preventDefault(); // Prevent default behavior (if inside a form)

    // Collect form data
    const taskData = {
        title: document.getElementById("taskTitle3").value,
        list: document.getElementById("id_list2").value,
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
        rev_no: document.getElementById("id_revno2").value,
        d_no: document.getElementById("id_dno2").value,
        globalselectedtitil_for_edit_task_backend : globalselectedtitil_for_edit_task
    };

    fetch(`/api/edit-task/`, {
        method: "POST",
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


// manual timesheet
document.getElementById("manual_timesheet").addEventListener("click", function () {
    document.getElementById("timesheetpopup").style.display = "flex";
});

document.getElementById("closePopupButton_manualtimesheet").addEventListener("click", function () {
    document.getElementById("timesheetpopup").style.display = "none";
});


document.getElementById("closePopupButton_creattask").addEventListener("click", function () {
    document.getElementById("taskModalPopup").style.display = "none";
});


document.getElementById("closePopupButton_updatetask").addEventListener("click", function () {
    document.getElementById("popupModal").style.display = "none";
});
// Close when clicking outside the popup
window.onclick = function(event) {
    let popup = document.getElementById("timesheetpopup");
    if (event.target === popup) {
        closePopup();
    }
};

function showTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.style.display = 'none');
    document.getElementById(tabId).style.display = 'block';
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
}

// Charts
setTimeout(() => {
    new Chart(document.getElementById("benchmarkChart"), {
        type: 'bar',
        data: {
            labels: ["Benchmark", "Total Task"],
            datasets: [{ data: [126, 100], backgroundColor: ["#4c8bf5", "#92b4f5"] }]
        }
    });

    new Chart(document.getElementById("timeChart"), {
        type: 'pie',
        data: {
            labels: ["Discussion", "Designing", "Calculating", "Modeling", "Checking"],
            datasets: [{ data: [19, 12, 24, 15, 30], backgroundColor: ["#98FB98", "#87CEFA", "#FFB6C1", "#FFD700", "#FFA07A"] }]
        }
    });
}, 500);