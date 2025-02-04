document.getElementById('up-arrow').addEventListener('click', function() {
    document.getElementById('scrollable-list').scrollBy({
        top: -50, // Adjust the scroll amount as needed
        behavior: 'smooth'
    });
});

document.getElementById('down-arrow').addEventListener('click', function() {
    document.getElementById('scrollable-list').scrollBy({
        top: 50, // Adjust the scroll amount as needed
        behavior: 'smooth'
    });
});

function updateClock() {
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Format the date as "Fri, 31 Jan 2025"
    const date = now.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

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

function updateGreeting() {
    const now = new Date();
    const hour = now.getHours();
    let greeting = "Welcome";

    if (hour >= 5 && hour < 12) {
        greeting = "Good Morning";
    } else if (hour >= 12 && hour < 18) {
        greeting = "Good Afternoon";
    } else {
        greeting = "Good Evening";
    }

    // Only update the greeting part, leave the name intact
    document.getElementById('dynamic-greeting').textContent = greeting;
}

// Call the function to update the greeting
updateGreeting();

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


document.getElementById("manual_timesheet").addEventListener("click", function() {
  document.getElementById("timesheetpopup").style.display = "flex";

    // Reference to select elements
    var projectListSelect = document.getElementById("projectListSelect");
    var projectTypeSelect = document.getElementById("projectTypeSelect");
    var scopeSelect = document.getElementById("scopeSelect");

    // Clear previous options to avoid duplicates
    projectListSelect.innerHTML = "";
    projectTypeSelect.innerHTML = "";
    scopeSelect.innerHTML = "";

    // Loop through tasks and add options dynamically
    if (golbalfetchdata && golbalfetchdata.tasks) {
        golbalfetchdata.tasks.forEach(task => {
            // Adding project as an option
            var projectOption = document.createElement("option");
            projectOption.text = task.projects || "No Project Assigned";  // Fallback if project is missing
            projectListSelect.add(projectOption);

            // Adding project type (using project as type for now)
            var projectTypeOption = document.createElement("option");
            projectTypeOption.text = task.projects || "No Project Type";
            projectTypeSelect.add(projectTypeOption);

            // Adding scope as an option
            var scopeOption = document.createElement("option");
            scopeOption.text = task.scope || "No Scope Assigned";
            scopeSelect.add(scopeOption);
        });
    } else {
        console.error("Error: golbalfetchdata or tasks array is undefined.");
    }

    // Show the popup (if hidden)
   
});


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

        populateDropdown("id_scopecreatetask", "scope", filteredTasks);
        populateDropdown("id_prioritycreatetask", "priority", filteredTasks);
        populateDropdown("id_categorycreatetask", "category", filteredTasks);
        populateDropdown("id_verification_statuscreatetask", "verification_status", filteredTasks);
        populateDropdown("id_task_statuscreatetask", "task_status", filteredTasks);
    }

    // Handle change event for list dropdown to filter projects
    document.getElementById("id_listcreatetask").addEventListener("change", function() {
        selectedList = this.value;

        // Filter projects based on the selected list
        const filteredProjects = tasks.filter(task => task.list === selectedList);
        populateDropdown("id_projectcreatetask", "projects", filteredProjects);

        handleDependentDropdowns();  // Refresh dependent dropdowns
    });

    // Handle change events for project dropdown
    document.getElementById("id_projectcreatetask").addEventListener("change", function() {
        selectedProject = this.value;
        handleDependentDropdowns();  // Refresh dependent dropdowns
    });

    // Initially populate list and project dropdowns
    populateDropdown("id_listcreatetask", "list");
    populateDropdown("id_projectcreatetask", "projects");
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
            document.getElementById("id_dnoedittask").value = selectedTask.d_no || "";
            document.getElementById("id_priorityedittask").value = selectedTask.priority || "";
            document.getElementById("id_assigned_toedittask").value = selectedTask.assigned || "";
            document.getElementById("id_checkeredittask").value = selectedTask.checker || "";
            document.getElementById("id_qc_3_checkeredittask").value = selectedTask.qc_3_checker || "";
            document.getElementById("id_groupedittask").value = selectedTask.group || "";
            document.getElementById("id_categoryedittask").value = selectedTask.category || "";
            document.getElementById("id_start_dateedittask").value = selectedTask.start_date || "";
            document.getElementById("id_end_dateedittask").value = selectedTask.end_date || "";
            document.getElementById("id_verification_statusedittask").value = selectedTask.verification_status || "";
            document.getElementById("id_task_statusedittask").value = selectedTask.task_status || "";
        }
    }

    // Filter and populate dependent dropdowns dynamically
    function handleDependentDropdowns_updatetask() {
        const filteredTasks = tasks.filter(task => (!selectedList || task.list === selectedList));

        populateDropdown_updatetask("id_scopeedittask", "scope", filteredTasks);
        populateDropdown_updatetask("taskTitleedittask", "title", filteredTasks);
        populateDropdown_updatetask("id_revnoedittask", "rev", filteredTasks);
        populateDropdown_updatetask("id_priorityedittask", "priority", filteredTasks);
        populateDropdown_updatetask("id_categoryedittask", "category", filteredTasks);
        populateDropdown_updatetask("id_verification_statusedittask", "verification_status", filteredTasks);
        populateDropdown_updatetask("id_task_statusedittask", "task_status", filteredTasks);
    }

    // Event listener to populate form when title is selected
    document.getElementById("taskTitleedittask").addEventListener("change", function () {
        const selectedTitle = this.value;
        const selectedTask = tasks.find(task => task.title === selectedTitle);
        globalselectedtitil_for_edit_task =selectedTitle;
        console.log("globalselectedtitil_for_edit_task:",globalselectedtitil_for_edit_task);
        populateFormFields(selectedTask);
    });

    // Event listener to populate form when REV NO is selected
    document.getElementById("id_revnoedittask").addEventListener("change", function () {
        const selectedRevNo = this.value;
        const selectedTask = tasks.find(task => task.rev_no === selectedRevNo);
        populateFormFields(selectedTask);
    });

    // Event listener for Category
    document.getElementById("id_categoryedittask").addEventListener("change", function () {
        const selectedCategory = this.value.trim();
        const selectedTask = tasks.find(task => task.category.trim() === selectedCategory);
            populateFormFields(selectedTask);
    });

    // Handle change event for list dropdown to filter projects
    document.getElementById("id_listedittask").addEventListener("change", function () {
        selectedList = this.value;

        // Filter projects based on the selected list
        const filteredProjects = tasks.filter(task => task.list === selectedList);
        populateDropdown_updatetask("id_projectedittask", "projects", filteredProjects);

        handleDependentDropdowns_updatetask();  // Refresh dependent dropdowns
    });

    // Handle change events for project dropdown
    document.getElementById("id_projectedittask").addEventListener("change", function () {
        selectedProject = this.value;
        handleDependentDropdowns_updatetask();  // Refresh dependent dropdowns
    });

    // Initially populate list and project dropdowns
    populateDropdown_updatetask("id_listedittask", "list");
    populateDropdown_updatetask("id_projectedittask", "projects");
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
        title: document.getElementById("taskTitlecreatetask").value,
        list: document.getElementById("id_listcreatetask").value,
        project: document.getElementById("id_projectcreatetask").value,
        scope: document.getElementById("id_scopecreatetask").value,
        priority: document.getElementById("id_prioritycreatetask").value,
        assigned_to: document.getElementById("assignedTocreatetask").value,
        checker: document.getElementById("checkercreatetask").value,
        qc_3_checker: document.getElementById("qcCheckercreatetask").value,
        group: document.getElementById("groupcreatetask").value,
        category: document.getElementById("id_categorycreatetask").value,
        start_date: document.getElementById("startDatecreatetask").value,
        end_date: document.getElementById("endDatecreatetask").value,
        verification_status: document.getElementById("id_verification_statuscreatetask").value,
        task_status: document.getElementById("id_task_statuscreatetask").value,
        rev_no: document.getElementById("id_revnocreatetask").value,
        d_no: document.getElementById("id_dnocreatetask").value,
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
        list: document.getElementById("id_listedittask").value,
        project: document.getElementById("id_projectedittask").value,
        scope: document.getElementById("id_scopeedittask").value,
        priority: document.getElementById("id_priorityedittask").value,
        assigned_to: document.getElementById("id_assigned_toedittask").value,
        checker: document.getElementById("id_checkeredittask").value,
        qc_3_checker: document.getElementById("id_qc_3_checkeredittask").value,
        group: document.getElementById("id_groupedittask").value,
        category: document.getElementById("id_categoryedittask").value,
        start_date: document.getElementById("id_start_dateedittask").value,
        end_date: document.getElementById("id_end_dateedittask").value,
        verification_status: document.getElementById("id_verification_statusedittask").value,
        task_status: document.getElementById("id_task_statusedittask").value,
        rev_no: document.getElementById("id_revnoedittask").value,
        d_no: document.getElementById("id_dnoedittask").value,
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