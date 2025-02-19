



document.getElementById('aproover_creattask').addEventListener('click', function () {
    const dropdownContainer = document.getElementById('dropdownContainer');

    // Toggle dropdown visibility
    if (dropdownContainer.style.display === 'none' || dropdownContainer.style.display === '') {
        dropdownContainer.style.display = 'block';  // Show
        populateDropdown();  // Populate list when shown
    } else {
        dropdownContainer.style.display = 'none';  // Hide
    }
});

// Function to populate dropdown list
function populateDropdown() {
    const dropdownContainer = document.getElementById('dropdownContainer');
    dropdownContainer.innerHTML = '';  // Clear previous options

    // Filter employee details for admins and populate the list
    golbalfetchdata.employee_details
        .filter(employee => employee.authentication === 'admin')
        .forEach(employee => {
            const option = document.createElement('div');
            option.textContent = employee.name;
            option.style.padding = '5px';
            option.style.cursor = 'pointer';

            // Select the name and display it on the button
            option.addEventListener('click', () => {
                document.getElementById('aproover_creattask').textContent = employee.name;
                dropdownContainer.style.display = 'none';  // Hide dropdown after selection
                
                // Show the alert modal
                showModal(employee.name);
            });

            dropdownContainer.appendChild(option);
        });
}

// Function to show the alert modal
// Function to show the alert modal and blur the background
function showModal(name) {
    document.getElementById('modalTitle').textContent = `Selected: ${name}`;
    document.getElementById('alertModal').style.display = 'block';

    // Blur both the main container and task modal popup
    document.querySelector('.main-container').classList.add('blur');
    document.getElementById('taskModalPopup').classList.add('blur');
}

// Function to close the modal and remove the blur effect
function closeModal() {
    document.getElementById('alertModal').style.display = 'none';

    // Remove blur effect
    document.querySelector('.main-container').classList.remove('blur');
    document.getElementById('taskModalPopup').classList.remove('blur');
}

// Close the modal when clicking the close button or OK button
document.getElementById('closeModal').addEventListener('click', closeModal);
document.getElementById('okButton').addEventListener('click', closeModal);



document.getElementById("okButton").addEventListener("click", function (e) {
    e.preventDefault(); // Prevent default behavior (if inside a form)
    // Collect form data
    const taskData = {
        approver_name: document.getElementById('aproover_creattask').textContent,  // Selected approver name
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
    fetch("/aproove_task/", {
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

document.getElementById("closePopupButton_creattask").addEventListener("click", function () {
    document.getElementById("taskModalPopup").style.display = "none";
});


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

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('left-arrow').addEventListener('click', function() {
        document.querySelector('.tasks').scrollBy({
            left: -300, // Adjust the scroll amount as needed
            behavior: 'smooth'
        });
    });

    document.getElementById('right-arrow').addEventListener('click', function() {
        document.querySelector('.tasks').scrollBy({
            left: 300, // Adjust the scroll amount as needed
            behavior: 'smooth'
        });
    });
});

const sidebarLinks = document.querySelectorAll('.sidebar-link');

sidebarLinks.forEach(link => {
    link.addEventListener('click', function () {
        // Remove the active class from all links
        sidebarLinks.forEach(l => l.classList.remove('active'));
        
        // Add the active class to the clicked link
        this.classList.add('active');
    });
});




// Helper function to get CSRF token


document.addEventListener("DOMContentLoaded", function() {
    const buttons = document.querySelectorAll('.sidebar-link');
    buttons.forEach(button => {
        const img = button.querySelector('img');
        const defaultImg = button.getAttribute('data-default-img');
        const activeImg = button.getAttribute('data-active-img');

        button.addEventListener('click', function() {
            // Reset all buttons
            buttons.forEach(otherButton => {
                const otherImg = otherButton.querySelector('img');
                otherImg.src = otherButton.getAttribute('data-default-img');
            });

            // Activate the clicked button
            img.src = activeImg;
        });
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



document.getElementById("date_in_daily_timesheet").addEventListener("click", handleButtonClick);

function handleButtonClick(event) {
    event.preventDefault(); // Prevent form submission or default behavior

    const selectedDate = document.getElementById('date-input').value; // Get selected date
    console.log("Selected Date:", selectedDate);

    // Normalize selectedDate
    const selectedFormattedDate = new Date(selectedDate).toISOString().split('T')[0]; // Format YYYY-MM-DD

    // Filter tasks based on the selected date
    const filteredTasks = golbalfetchdata.tasks.filter(task => {
        const taskDate = task.date1;

        // Normalize taskDate
        const formattedTaskDate = taskDate ? new Date(taskDate).toISOString().split('T')[0] : null;

        console.log("Task Date:", formattedTaskDate);

        // Match task date with selected date
        return formattedTaskDate && formattedTaskDate === selectedFormattedDate;
    });

    // Show tasks when button is clicked
    if (filteredTasks.length > 0) {
        populateTimesheet(filteredTasks);
    } else {
        populateTimesheet([]); // No tasks found
    }
}

function formatTime(hoursDecimal) {
    const hours = Math.floor(hoursDecimal);
    const remainingMinutes = Math.round((hoursDecimal - hours) * 60);

    let result = "";
    if (hours > 0) result += `${hours} ${hours === 1 ? "Hour" : "Hours"}`;
    if (remainingMinutes > 0) result += `${hours > 0 ? " " : ""}${remainingMinutes} ${remainingMinutes === 1 ? "Minute" : "Minutes"}`;

    return result || "0 Minutes"; // Fallback for 0 minutes
}

// Function to populate the timesheet with tasks and display the total hours
function populateTimesheet(tasks) {
    const timesheetContent = document.getElementById("timesheetContent");
    const calendarContainer = document.getElementById("calendarContainer");
    timesheetContent.innerHTML = ""; // Clear any existing content

    // Ensure calendar is hidden when loading tasks
    if (calendarContainer) {
        calendarContainer.style.display = "none";
    }

    // Remove existing total time element if it exists
    let totalTimeElement = document.querySelector(".bottom_row");
    if (totalTimeElement) {
        totalTimeElement.remove();
    }

    let totalTime = 0; // Initialize total time accumulator

    if (tasks.length > 0) {
        tasks.forEach(task => {
            totalTime += parseFloat(task.time) || 0; // Sum the task time in decimal hours

            const taskRow = document.createElement("div");
            taskRow.classList.add("timesheet-row");

            taskRow.innerHTML = `
            <div class="task-info">
                <h4 class="task-type">${task.scope}</h4>
                <div class="task-details">
                    <div class="task-actions">
                        <div class="details-top">
                            <p class="task-name">${task.title}</p>
                            <p class="task-duration">${formatTime(parseFloat(task.time) || 0)}</p>
                        </div>
                        <div class="details-bottom">
                            <p class="task-meta">${task.projects ? task.projects : 'No Project Assigned'}, ${task.d_no ? 'REV NO: ' + task.d_no : 'No Rev No'}</p>
                            <p class="project-type">Internal Projects</p>
                        </div>
                    </div>
                    <div class="image-set">
                        <img class="comment_button" src="/static/images/comment_button.png">
                        <img class="delete_button" src="/static/images/delete_button.png">
                    </div>
                </div>
                <div id="total_time_container">
                    <span id="label_hours">TOTAL HOURS :</span>
                    <div id="value_hours">${formatTime(totalTime)}</div>
                </div>
            </div>
        `;

            timesheetContent.appendChild(taskRow);
        });

        // Create a new total time element
        totalTimeElement = document.createElement("div");
        totalTimeElement.innerHTML = `
            <div class="bottom_row">
                <div id="calendar_view">
                    <button id="p_calendar">Switch to Calendar View</button>
                </div>
                
            </div>
        `;
        timesheetContent.appendChild(totalTimeElement);

        // Ensure the calendar is placed inside the timesheet container correctly
        if (calendarContainer && !timesheetContent.contains(calendarContainer)) {
            timesheetContent.appendChild(calendarContainer);
        }

        // Add event listener to dynamically created "Switch to Calendar View" button
        document.getElementById("p_calendar").addEventListener("click", function () {
            toggleTaskInfo();
            updateSwitchText(this);
        });
    } else {
        const noDataMessage = document.createElement("p");
        noDataMessage.textContent = "No Data Found";
        noDataMessage.id = "no_data_text";
        timesheetContent.appendChild(noDataMessage);
    }
}

// Function to hide task-info and show calendar inside the timesheet container
function toggleTaskInfo() {
    const timesheetContent = document.getElementById("timesheetContent");
    const taskInfos = document.querySelectorAll(".task-info");
    const calendarContainer = document.getElementById("calendarContainer");

    if (!calendarContainer) {
        console.error("Error: Calendar container not found.");
        return;
    }

    // Check if the calendar is visible
    const isCalendarVisible = calendarContainer.style.display === "block";

    if (isCalendarVisible) {
        // Show task-info, hide calendar
        taskInfos.forEach(taskInfo => taskInfo.style.display = "block");
        calendarContainer.style.display = "none";
    } else {
        // Hide task-info, show calendar inside timesheet container and keep order
        taskInfos.forEach(taskInfo => taskInfo.style.display = "none");

        // Ensure calendar stays within timesheetContent in correct order
        if (!timesheetContent.contains(calendarContainer)) {
            timesheetContent.appendChild(calendarContainer);
        }
        calendarContainer.style.display = "block";
    }
}

// Function to update switch button text dynamically
function updateSwitchText(element) {
    const calendarContainer = document.getElementById("calendarContainer");
    const isCalendarVisible = calendarContainer.style.display === "block";

    element.textContent = isCalendarVisible ? "Switch to Timesheet View" : "Switch to Calendar View";
}

// Ensure calendar is hidden on page load
document.addEventListener("DOMContentLoaded", function () {
    const calendarContainer = document.getElementById("calendarContainer");
    if (calendarContainer) {
        calendarContainer.style.display = "none";
    }

    // Attach event listener for the "Switch to Calendar View" button
    const toggleButton = document.getElementById("toggleViewButton");
    if (toggleButton) {
        toggleButton.addEventListener("click", function () {
            toggleTaskInfo();
            updateSwitchText(this);
        });
    }
});




document.getElementById("submitTimesheetButton").addEventListener("click", submitTimesheet);

function submitTimesheet() {
    const formData = {
        date1: document.getElementById("date1").value,
        list: document.getElementById("projectListSelect").value,
        project_type: document.getElementById("projectTypeSelect").value,
        scope: document.getElementById("scopeSelect").value,
        task: document.getElementById("TaskSelect").value,
        phase: document.getElementById("phaseSelect").value,
        phase_status: document.getElementById("phaseStatusSelect").value,
        time: document.getElementById("time").value,
        comments: document.getElementById("comments").value
    };

    // Check for missing inputs
    if (!formData.date1 || !formData.list || !formData.project_type || 
        !formData.scope || !formData.task || !formData.phase || 
        !formData.time || !formData.comments) {
        alert("Please fill in all fields before submitting.");
        return;
    }

    console.log("Form Data Sent to Backend:", formData);

    fetch("/api/submit_timesheet/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.message) {
                alert(data.message);
                console.log("Success:", data);
            } else {
                console.error("Error:", data.error);
            }
        })
        .catch(error => {
            console.error("Error submitting timesheet:", error);
        });
}



// FOR MANUAL TIMESHEETS 

var globalselectedtitil_for_edit_task;

document.getElementById("manual_timesheet").addEventListener("click", function() {
    document.getElementById("timesheetpopup").style.display = "flex";

    // References to select elements
    var projectListSelect = document.getElementById("projectListSelect");
    var projectTypeSelect = document.getElementById("projectTypeSelect");
    var scopeSelect = document.getElementById("scopeSelect");
    var TaskSelect = document.getElementById("TaskSelect");
    var phaseSelect = document.getElementById("phaseSelect");

    // Clear all select inputs to avoid duplicate options
    projectListSelect.innerHTML = "<option value=''>Select List</option>";
    projectTypeSelect.innerHTML = "<option value=''>Select Project</option>";
    scopeSelect.innerHTML = "<option value=''>Select Scope</option>";
    TaskSelect.innerHTML = "<option value=''>Select Task</option>";
    phaseSelect.innerHTML = "<option value=''>Select Phase</option>";

    // Initial population of the first dropdown (list of projects)
    var listsSet = new Set();
    golbalfetchdata.tasks.forEach(task => {
        if (!listsSet.has(task.list)) {
            listsSet.add(task.list);
            var option = document.createElement("option");
            option.value = task.list;
            option.textContent = task.list || "No List Assigned";
            projectListSelect.appendChild(option);
        }
    });

    // Event listener for list selection
    projectListSelect.addEventListener("change", function() {
        var selectedList = projectListSelect.value;

        // Clear and reset the dependent dropdowns
        projectTypeSelect.innerHTML = "<option value=''>Select Project</option>";
        scopeSelect.innerHTML = "<option value=''>Select Scope</option>";
        TaskSelect.innerHTML = "<option value=''>Select Task</option>";
        phaseSelect.innerHTML = "<option value=''>Select Phase</option>";

        // Populate projects related to the selected list
        var projectSet = new Set();
        golbalfetchdata.tasks.forEach(task => {
            if (task.list === selectedList && !projectSet.has(task.projects)) {
                projectSet.add(task.projects);
                var option = document.createElement("option");
                option.value = task.projects;
                option.textContent = task.projects || "No Project Assigned";
                projectTypeSelect.appendChild(option);
            }
        });
    });

    // Event listener for project selection
    projectTypeSelect.addEventListener("change", function() {
        var selectedProject = projectTypeSelect.value;

        // Clear and reset dependent dropdowns
        scopeSelect.innerHTML = "<option value=''>Select Scope</option>";
        TaskSelect.innerHTML = "<option value=''>Select Task</option>";
        phaseSelect.innerHTML = "<option value=''>Select Phase</option>";

        // Populate scopes related to the selected project
        var scopeSet = new Set();
        golbalfetchdata.tasks.forEach(task => {
            if (task.projects === selectedProject && !scopeSet.has(task.scope)) {
                scopeSet.add(task.scope);
                var option = document.createElement("option");
                option.value = task.scope;
                option.textContent = task.scope || "No Scope Assigned";
                scopeSelect.appendChild(option);
            }
        });
    });

    // Event listener for scope selection
    scopeSelect.addEventListener("change", function() {
        var selectedScope = scopeSelect.value;

        // Clear and reset dependent dropdowns
        TaskSelect.innerHTML = "<option value=''>Select Task</option>";
        phaseSelect.innerHTML = "<option value=''>Select Phase</option>";

        // Populate tasks related to the selected scope
        var taskSet = new Set();
        golbalfetchdata.tasks.forEach(task => {
            if (task.scope === selectedScope && !taskSet.has(task.title)) {
                taskSet.add(task.title);
                var option = document.createElement("option");
                option.value = task.title;
                option.textContent = task.title || "No Task Assigned";
                TaskSelect.appendChild(option);
            }
        });
    });

    // Event listener for task selection
    TaskSelect.addEventListener("change", function() {
        var selectedTask = TaskSelect.value;

        // Clear and reset the phase dropdown
        phaseSelect.innerHTML = "<option value=''>Select Phase</option>";

        // Populate phases related to the selected task
        var phaseSet = new Set();
        golbalfetchdata.tasks.forEach(task => {
            if (task.title === selectedTask && !phaseSet.has(task.category)) {
                phaseSet.add(task.category);
                var option = document.createElement("option");
                option.value = task.category;
                option.textContent = task.category || "No Phase Assigned";
                phaseSelect.appendChild(option);
            }
        });
    });
});



// Add event listener to the button


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


    
    // Populate form fields based on selected task data

 

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
    function populateFormFields_creattask(selectedTask) {
        if (selectedTask) {
           
            document.getElementById("id_dnocreatetask").value = selectedTask.d_no || "";
            document.getElementById("id_prioritycreatetask").value = selectedTask.priority || "";
            document.getElementById("assignedTocreatetask").value = selectedTask.assigned || "";
            document.getElementById("checkercreatetask").value = selectedTask.checker || "";
            document.getElementById("qcCheckercreatetask").value = selectedTask.qc_3_checker || "";
            document.getElementById("groupcreatetask").value = selectedTask.group || "";
            document.getElementById("id_categorycreatetask").value = selectedTask.category || "";
            document.getElementById("startDatecreatetask").value = selectedTask.start_date || "";
            document.getElementById("endDatecreatetask").value = selectedTask.end_date || "";
            document.getElementById("id_verification_statuscreatetask").value = selectedTask.verification_status || "";
            document.getElementById("id_task_statuscreatetask").value = selectedTask.task_status || "";
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


    // Event listener to populate form when REV NO is selected
    document.getElementById("id_revnocreatetask").addEventListener("change", function () {
        const selectedRevNo = this.value;
        const selectedTask = tasks.find(task => task.rev_no === selectedRevNo);
        populateFormFields_creattask(selectedTask);
    });

    // Event listener for Category
    document.getElementById("id_categorycreatetask").addEventListener("change", function () {
        const selectedCategory = this.value.trim();
        const selectedTask = tasks.find(task => task.category.trim() === selectedCategory);
        populateFormFields_creattask(selectedTask);
    });



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
let currentUserName
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
            golbalfetchdata = data;

            currentUserName = document.getElementById('profile_name').textContent.trim();

            // Check if the current user is an admin
            const isAdmin = golbalfetchdata.employee_details.some(
                employee => employee.name === currentUserName && employee.authentication === 'admin'
            );

            // Show/hide buttons based on admin status
            if (isAdmin) {
                document.getElementById('savetask_creatask').style.display = 'block';
                document.getElementById('project-button').style.display = 'block';
                document.getElementById('aproover_creattask').style.display = 'none';
                document.getElementById('notifications').style.display = 'none';
            } else {
                document.getElementById('savetask_creatask').style.display = 'none';
                document.getElementById('aproover_creattask').style.display = 'block';
                document.getElementById('project-button').style.display = 'none';
                document.getElementById('notifications').style.display = 'block';
            }

            if (data.tasks && data.tasks.length > 0) {
                populateDropdowns(data.tasks);
                populateDropdowns_updatetask(data.tasks);
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

document.getElementById("savetask_creatask").addEventListener("click", function (e) {
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
            return response.json();
        })
        .then((data) => {
            console.log("Task Created:", data);
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




document.getElementById("closePopupButton_updatetask").addEventListener("click", function () {
    document.getElementById("popupModal").style.display = "none";
});
// Close the popup by hiding it
function closePopup() {
    document.getElementById("timesheetpopup").style.display = "none";
}

// Attach the close button to the `closePopup` function
document.getElementById("closePopupButton").addEventListener("click", closePopup);

// Optionally, close the popup when the user clicks outside of it
window.onclick = function(event) {
    const popup = document.getElementById("timesheetpopup");
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



// Listen for task selection change
document.getElementById("TaskSelect").addEventListener("change", function () {
    const selectedTask = this.value;

    // Find the selected task data in `golbalfetchdata.tasks`
    const taskData = golbalfetchdata.tasks.find(task => task.title === selectedTask);

    if (taskData) {
        // Update the task details table with selected task data
        document.getElementById("taskTitle").textContent = taskData.title || '-';
        document.getElementById("projectType").textContent = taskData.projects || '-';
        document.getElementById("taskScope").textContent = taskData.scope || '-';
        document.getElementById("taskCategory").textContent = taskData.category || '-';

        // Update and change priority color
        const priorityElement = document.getElementById("taskPriority");
        const priorityValue = taskData.priority || 'Medium';
        priorityElement.textContent = priorityValue;

        // Change text color based on priority value
        switch (priorityValue.toUpperCase()) {
            case 'HIGH':
                priorityElement.style.color = 'green';
                break;
            case 'MEDIUM':
                priorityElement.style.color = 'orange';
                break;
            case 'LOW':
                priorityElement.style.color = 'red';
                break;
            default:
                priorityElement.style.color = 'black';  // Default color if priority is unknown
        }
    } else {
        // Clear the task details if no valid task is found
        document.getElementById("taskTitle").textContent = '-';
        document.getElementById("projectType").textContent = '-';
        document.getElementById("taskScope").textContent = '-';
        document.getElementById("taskCategory").textContent = '-';

        const priorityElement = document.getElementById("taskPriority");
        priorityElement.textContent = '-';
        priorityElement.style.color = 'black';  // Reset to default
    }
});
// CALENDER CODE

// JavaScript code to fetch task details when a calendar day is clicked and show time in calendar cells
let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth();

document.addEventListener("DOMContentLoaded", function () {
    // Initial calendar display
    fetchAndDisplayCalendarTimesheet(currentYear, currentMonth + 1);
    updateMonthLabel();

    // Attach event listeners to navigation buttons
    document.getElementById("prevMonthBtn").addEventListener("click", () => changeMonth(-1));
    document.getElementById("nextMonthBtn").addEventListener("click", () => changeMonth(1));
});

function changeMonth(offset) {
    currentMonth += offset;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    } else if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    updateMonthLabel();
    fetchAndDisplayCalendarTimesheet(currentYear, currentMonth + 1);
}

function updateMonthLabel() {
    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    document.getElementById("currentMonthDisplay").textContent = `${monthNames[currentMonth]} ${currentYear}`;
}

function fetchAndDisplayCalendarTimesheet(year, month) {
    fetch(`/timesheet/get_all_times_by_month/?year=${year}&month=${month}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to fetch data: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.timesheet_entries) {
                populateCalendar(data.timesheet_entries, year, month);
            } else {
                document.getElementById("calendar").innerHTML = generateCalendarDays(year, month);
                console.error("No valid timesheet entries found.");
            }
        })
        .catch(error => {
            console.error("Error fetching timesheet data:", error);
        });
}

function populateCalendar(tasks, year, month) {
    const calendar = document.getElementById("calendar");
    calendar.innerHTML = generateCalendarDays(year, month);  // Generate calendar days for the selected month

    const dateMap = {};  // Map to store tasks and total time by date
    tasks.forEach(task => {
        if (!dateMap[task.date1]) {
            dateMap[task.date1] = { tasks: [], totalTime: 0 };
        }
        dateMap[task.date1].tasks.push(task);
        dateMap[task.date1].totalTime += parseFloat(task.time) || 0;
    });

    // Attach task info to calendar days and show total time
    Object.keys(dateMap).forEach(date => {
        const dayCell = document.getElementById(`day-${date}`);
        if (dayCell) {
            dayCell.classList.add("clickable-day");
            dayCell.innerHTML += `<p class="calendar-time-display">${formatTime(dateMap[date].totalTime)}</p>`;
            dayCell.addEventListener("click", () => displayTaskDetails(dateMap[date].tasks));
        }
    });
}

function displayTaskDetails(tasks) {
    const taskDetailsSection = document.querySelector(".task-placeholder");
    taskDetailsSection.innerHTML = "";  // Clear previous task details

    if (tasks.length > 0) {
        tasks.forEach(task => {
            const taskCard = document.createElement("div");
            taskCard.classList.add("task-detail-card");

            taskCard.innerHTML = `
                <h4>${task.title}</h4>
                <p><strong>Project:</strong> ${task.projects || 'N/A'}</p>
                <p><strong>Scope:</strong> ${task.scope}</p>
                <p><strong>Time Spent:</strong> ${formatTime(parseFloat(task.time) || 0)}</p>
                <p><strong>Comments:</strong> ${task.comments || 'No comments available'}</p>
                <hr>
            `;

            taskDetailsSection.appendChild(taskCard);
        });
    } else {
        taskDetailsSection.innerHTML = `<p>No tasks available for this date.</p>`;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const scrollBtn = document.querySelector(".scroll-right-btn");
    const taskSection = document.querySelector(".task-placeholder");

    scrollBtn.addEventListener("click", () => {
        taskSection.scrollBy({ top: 30, behavior: "smooth" }); // Scrolls down
    });
});


function generateCalendarDays(year, month) {
    const firstDayOfMonth = new Date(year, month - 1, 1).getDay();  // Get the starting day of the month
    const daysInMonth = new Date(year, month, 0).getDate();  // Total days in the month

    let calendarDaysHTML = "";

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
        calendarDaysHTML += `<div class="calendar-day empty-day"></div>`;
    }

    // Add actual days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const formattedDay = String(day).padStart(2, '0');
        const dateId = `day-${year}-${String(month).padStart(2, '0')}-${formattedDay}`;
        calendarDaysHTML += `<div id="${dateId}" class="calendar-day">${day}</div>`;
    }

    return calendarDaysHTML;
}

function formatTime(hoursDecimal) {
    const hours = Math.floor(hoursDecimal);
    const remainingMinutes = Math.round((hoursDecimal - hours) * 60);

    let result = "";
    if (hours > 0) result += `${hours} ${hours === 1 ? "Hour" : "Hours"}`;
    if (remainingMinutes > 0) result += `${hours > 0 ? " " : ""}${remainingMinutes} ${remainingMinutes === 1 ? "Minute" : "Minutes"}`;

    return result || "0 Minutes";
}
