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
        team: document.getElementById("teamcreatetask").value,
        title: document.getElementById("taskTitlecreatetask").value,
        list: document.getElementById("id_listcreatetask").value,
        project: document.getElementById("id_projectcreatetask").value,
        scope: document.getElementById("id_scopecreatetask").value,
        priority: document.getElementById("id_prioritycreatetask").value,
        task_benchmark: document.getElementById("benchmarkcreatetask").value, 
        assigned_to: document.getElementById("assignedTocreatetask").value,
        checker: document.getElementById("checkercreatetask").value,
        qc_3_checker: document.getElementById("qcCheckercreatetask").value,
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

    document.getElementById('current-time1').textContent = time;
    document.getElementById('current-date1').textContent = date;

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

    const filteredTasks = tasks.filter(task => task.assigned === currentUserName);
    
    if (filteredTasks.length > 0) {
        filteredTasks.forEach(task => {
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
                                <p class="task-meta">
                                    DWG NO: ${task.d_no ? task.d_no : 'NULL'} ,  Rev No: ${task.rev ? task.rev : 'NULL'}
                                </p>
                                <p class="project-type">${task.projects ? task.projects : 'No Project Assigned'}</p>
                            </div>
                        </div>
                        <div class="button-set">
                            <button class="comment_button" data-id="${task.id}">Edit</button>
                            <button class="delete_button" data-id="${task.id}">Delete</button>
                        </div>
                    </div>
                </div>
            `;

            timesheetContent.appendChild(taskRow);
        });

        totalTimeElement = document.createElement("div");
        totalTimeElement.classList.add("bottom_row");
        totalTimeElement.innerHTML = `
            <div id="calendar_view">
                <button id="p_calendar">Switch to Calendar View</button>
            </div>
        `;
        timesheetContent.appendChild(totalTimeElement);
        
        } else {
            const noDataMessage = document.createElement("p");
            noDataMessage.textContent = "No Data Found For Selected Date";
            noDataMessage.id = "no_data_text";
            timesheetContent.appendChild(noDataMessage);
        }
        
        // Ensure the "Switch to Calendar View" button is always created
        let switchToCalendarBtn = document.getElementById("p_calendar");
        if (!switchToCalendarBtn) {
            switchToCalendarBtn = document.createElement("button");
            switchToCalendarBtn.id = "p_calendar";
            switchToCalendarBtn.textContent = "Switch to Calendar View";
        
            const bottomRow = document.createElement("div");
            bottomRow.classList.add("bottom_row");
            bottomRow.appendChild(switchToCalendarBtn);
        
            timesheetContent.appendChild(bottomRow);
        }
        
        // Ensure calendar is inside timesheetContent
        if (calendarContainer && !timesheetContent.contains(calendarContainer)) {
            timesheetContent.appendChild(calendarContainer);
        }
        
        // Add event listener to "Switch to Calendar View" button
        switchToCalendarBtn.addEventListener("click", function () {
            // Hide the "No Data Found" message if it exists
            let noDataMessage = document.getElementById("no_data_text");
            if (noDataMessage) {
                noDataMessage.style.display = "none";
            }
        
            toggleTaskInfo();
            updateSwitchText(this);
        });
        
}

// Function to hide task-info and show calendar inside the timesheet container
function toggleTaskInfo() {
    let calendarContainer = document.getElementById("calendarContainer"); // Re-fetch here

    if (!calendarContainer) {
        console.error("Error: Calendar container not found at execution time.");
        return;
    }

    const isCalendarVisible = calendarContainer.style.display === "block";

    if (isCalendarVisible) {
        document.querySelectorAll(".task-info").forEach(taskInfo => taskInfo.style.display = "block");
        calendarContainer.style.display = "none";
    } else {
        document.querySelectorAll(".task-info").forEach(taskInfo => taskInfo.style.display = "none");

        let timesheetContent = document.getElementById("timesheetContent");
        if (timesheetContent && !timesheetContent.contains(calendarContainer)) {
            timesheetContent.appendChild(calendarContainer);
        }

        calendarContainer.style.display = "block";
        fetchAndDisplayCalendarTimesheet(currentYear, currentMonth + 1);
    }
}

// Function to update switch button text dynamically
function updateSwitchText(element) {
    const calendarContainer = document.getElementById("calendarContainer");

    if (!calendarContainer) {
        console.error("Error: Calendar container not found in updateSwitchText.");
        return;
    }

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
    // const toggleButton = document.getElementById("toggleViewButton");
    // if (toggleButton) {
    //     toggleButton.addEventListener("click", function () {
    //         toggleTaskInfo();
    //         updateSwitchText(this);
    //     });
    // } else {
    //     console.error("Error: Toggle button not found.");
    // }
});


document.getElementById("submitTimesheetButton").addEventListener("click", submitTimesheet);

function submitTimesheet() {
    const selectedTask = document.getElementById("TaskSelect").value;

    // Get team from global data for the selected task
    const matchedTask = golbalfetchdata.tasks.find(task => task.title === selectedTask);
    const team = matchedTask ? matchedTask.team || "" : "";

    const formData = {
        date1: document.getElementById("date1").value,
        list: document.getElementById("projectListSelect").value,
        project_type: document.getElementById("projectTypeSelect").value,
        scope: document.getElementById("scopeSelect").value,
        task: selectedTask,
        phase: document.getElementById("phaseSelect").value,
        phase_status: document.getElementById("phaseStatusSelect").value,
        time: document.getElementById("time").value,
        comments: document.getElementById("comments").value,
        team: team // Added here
    };

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

// -------------------------------------
// FOR MANUAL TIMESHEETS
// -------------------------------------

var globalselectedtitil_for_edit_task;

document.getElementById("manual_timesheet").addEventListener("click", function() {
    document.getElementById("timesheetpopup").style.display = "flex";

    var projectListSelect = document.getElementById("projectListSelect");
    var projectTypeSelect = document.getElementById("projectTypeSelect");
    var scopeSelect = document.getElementById("scopeSelect");
    var TaskSelect = document.getElementById("TaskSelect");
    var phaseSelect = document.getElementById("phaseSelect");

    projectListSelect.innerHTML = "<option value=''>Select List</option>";
    projectTypeSelect.innerHTML = "<option value=''>Select Project</option>";
    scopeSelect.innerHTML = "<option value=''>Select Scope</option>";
    TaskSelect.innerHTML = "<option value=''>Select Task</option>";
    phaseSelect.innerHTML = "<option value=''>Select Phase</option>";

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

    projectListSelect.addEventListener("change", function() {
        var selectedList = projectListSelect.value;

        projectTypeSelect.innerHTML = "<option value=''>Select Project</option>";
        scopeSelect.innerHTML = "<option value=''>Select Scope</option>";
        TaskSelect.innerHTML = "<option value=''>Select Task</option>";
        phaseSelect.innerHTML = "<option value=''>Select Phase</option>";

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

    projectTypeSelect.addEventListener("change", function() {
        var selectedProject = projectTypeSelect.value;

        scopeSelect.innerHTML = "<option value=''>Select Scope</option>";
        TaskSelect.innerHTML = "<option value=''>Select Task</option>";
        phaseSelect.innerHTML = "<option value=''>Select Phase</option>";

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

    scopeSelect.addEventListener("change", function() {
        var selectedScope = scopeSelect.value;

        TaskSelect.innerHTML = "<option value=''>Select Task</option>";
        phaseSelect.innerHTML = "<option value=''>Select Phase</option>";

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

    TaskSelect.addEventListener("change", function() {
        var selectedTask = TaskSelect.value;

        phaseSelect.innerHTML = "<option value=''>Select Phase</option>";

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

function populateDropdowns(tasks) {
    let selectedProject = "";
    let selectedList = "";

    function populateDropdown(dropdownId, field, filterTasks = tasks) {
        const dropdown = document.getElementById(dropdownId);
        
        if (dropdown) {
            dropdown.innerHTML = '<option value="">Select</option>';
            const uniqueOptions = new Set();

            filterTasks.forEach(task => {
                const value = task[field];
                if (value && !uniqueOptions.has(value)) {
                    uniqueOptions.add(value);
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

    document.getElementById("id_listcreatetask").addEventListener("change", function() {
        selectedList = this.value;
        const filteredProjects = tasks.filter(task => task.list === selectedList);
        populateDropdown("id_projectcreatetask", "projects", filteredProjects);
        handleDependentDropdowns();
    });

    document.getElementById("id_projectcreatetask").addEventListener("change", function() {
        selectedProject = this.value;
        handleDependentDropdowns();
    });

    // 👇 Add this to populate team dropdown
    populateDropdown("teamcreatetask", "team");

    populateDropdown("id_listcreatetask", "list");
    populateDropdown("id_projectcreatetask", "projects");
}

// === TEAM LOCK FEATURE ===
document.addEventListener("DOMContentLoaded", function () {
    const teamDropdown = document.getElementById("teamcreatetask");
    const lockBtn = document.getElementById("lockTeamBtn");

    const lockedTeam = localStorage.getItem("locked_team");

    function applyLockedTeam() {
        if (!lockedTeam) return;

        const optionExists = Array.from(teamDropdown.options).some(option => option.value === lockedTeam);

        if (!optionExists) {
            const newOption = document.createElement("option");
            newOption.value = lockedTeam;
            newOption.textContent = lockedTeam;
            teamDropdown.appendChild(newOption);
        }

        teamDropdown.value = lockedTeam;
        teamDropdown.disabled = true;
        lockBtn.textContent = "🔓 Unlock";
    }

    applyLockedTeam(); // Call on page load

    lockBtn.addEventListener("click", function (event) {
        event.preventDefault();

        if (teamDropdown.disabled) {
            teamDropdown.disabled = false;
            lockBtn.textContent = "🔒 Lock";
            localStorage.removeItem("locked_team");
        } else {
            const selectedTeam = teamDropdown.value;
            if (selectedTeam) {
                teamDropdown.disabled = true;
                lockBtn.textContent = "🔓 Unlock";
                localStorage.setItem("locked_team", selectedTeam);
            } else {
                alert("Please select a team before locking.");
            }
        }
    });
});


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



let golbalfetchdata;
let currentUserName;

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

            // Check if the current user is an admin or MD
            const isAdminOrMd = golbalfetchdata.employee_details.some(
                employee => employee.name === currentUserName && (employee.authentication === 'admin' || employee.authentication === 'MD')
            );

            // Show/hide buttons based on admin or MD status
            if (isAdminOrMd) {
                document.getElementById('savetask_creatask').style.display = 'block';
                document.getElementById('project-button').style.display = 'flex';
                document.getElementById('aproover_creattask').style.display = 'none';
                document.getElementById('notifications').style.display = 'none';
            } else {
                document.getElementById('savetask_creatask').style.display = 'none';
                document.getElementById('aproover_creattask').style.display = 'flex';
                document.getElementById('project-button').style.display = 'none';
                document.getElementById('notifications').style.display = 'flex';
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
    e.preventDefault(); // Prevent form submission

    // Get the task form data
    const taskData = {
        team: document.getElementById("teamcreatetask") ? document.getElementById("teamcreatetask").value : "",
        list: document.getElementById("id_listcreatetask") ? document.getElementById("id_listcreatetask").value : "",
        project: document.getElementById("id_projectcreatetask") ? document.getElementById("id_projectcreatetask").value : "",
        rev_no: document.getElementById("id_revnocreatetask") ? document.getElementById("id_revnocreatetask").value : "",
        d_no: document.getElementById("id_dnocreatetask") ? document.getElementById("id_dnocreatetask").value : "",
        task_benchmark: document.getElementById("benchmarkcreatetask") ? document.getElementById("benchmarkcreatetask").value : "",  // Correct field name
        start_date: document.getElementById("startDatecreatetask") ? document.getElementById("startDatecreatetask").value : "",
        end_date: document.getElementById("endDatecreatetask") ? document.getElementById("endDatecreatetask").value : "",
    };

    const fileInput = document.getElementById("fileInput");
    const file = fileInput ? fileInput.files[0] : null; // Get the file selected by the user

    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const data = e.target.result;
            const workbook = XLSX.read(data, { type: 'binary' });

            // Get the first sheet of the Excel file
            const sheet = workbook.Sheets[workbook.SheetNames[0]];

            // Convert the sheet to JSON format
            const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

            // Extract relevant columns from the Excel file starting from line 41 (index 40)
            const excelData = [];
            for (let index = 40; index < jsonData.length; index++) {  // Start from line 41 (index 40)
                const row = jsonData[index];

                // If the row is empty (all columns are empty), stop the loop
                if (row.every(cell => cell === "" || cell === null)) {
                    break;  // Stop if the row is empty
                }

                // Only include rows with valid data
                excelData.push({
                    title: row[1],  // Column B: TASKS (mapped to 'title')
                    projects: row[2],  // Column C: SCOPE (mapped to 'projects')
                    scope: row[3],  // Column D: PARENT DELIVERABLE (mapped to 'scope')
                    task_benchmark: row[5]  // Column F: ESTIMATED TIME (mapped to 'task_benchmark')
                });
            }

            // Send the data to the backend (form data + excel data)
            fetch("/api/create-task/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ taskData: taskData, tasks: excelData })
            })
            .then((response) => response.json())
            .then((data) => {
                console.log("Task Created:", data);
                alert("Task created successfully!");
            })
            .catch((error) => {
                console.error("Error creating task:", error);
                alert("Error creating task. Check console for details.");
            });
        };

        reader.readAsBinaryString(file);
    } else {
        console.error("No file selected!");
        alert("Please select a file to upload.");
    }
});


// Updated Notification Function
// function sendAdminNotification(message) {
//     const adminData = {
//         message: message,
//         recipient: "varshith@fusie-engineers.com",
//     };

//     fetch("/api/send-notification/", {
//         method: "POST",
//         headers: {
//             "Content-Type": "application/json",
//             "X-CSRFToken": getCookie("csrftoken"),
//         },
//         body: JSON.stringify(adminData),
//     })
//         .then((response) => {
//             if (!response.ok) throw new Error("Error sending notification to admin.");
//             return response.json();
//         })
//         .then((data) => {
//             console.log("Admin notification sent:", data);
//         })
//         .catch((error) => {
//             console.error("Error sending notification:", error);
//         });
// }


// Handle "Save" button for updating a task
document.getElementById("savetask_updatetask").addEventListener("click", function (e) {
    e.preventDefault(); // Prevent default behavior (if inside a form)

    const taskData = {
        title: document.getElementById("taskTitle3").value,
        list: document.getElementById("id_listedittask").value,
        project: document.getElementById("id_projectedittask").value,
        scope: document.getElementById("id_scopeedittask").value,
        priority: document.getElementById("id_priorityedittask").value,
        assigned_to: document.getElementById("id_assigned_toedittask").value,
        checker: document.getElementById("id_checkeredittask").value,
        qc_3_checker: document.getElementById("id_qc_3_checkeredittask").value,
        category: document.getElementById("id_categoryedittask").value,
        start_date: document.getElementById("id_start_dateedittask").value,
        end_date: document.getElementById("id_end_dateedittask").value,
        verification_status: document.getElementById("id_verification_statusedittask").value,
        task_status: document.getElementById("id_task_statusedittask").value,
        rev_no: document.getElementById("id_revnoedittask").value,
        d_no: document.getElementById("id_dnoedittask").value,
        task_benchmark: document.getElementById("id_benchmarkedittask").value,
        globalselectedtitil_for_edit_task_backend: globalselectedtitil_for_edit_task
    };

    fetch(`/api/edit-task/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCookies("csrftoken"),  // Ensure CSRF token is passed here
        },
        body: JSON.stringify(taskData),
    })
    .then((response) => response.json())
    .then((data) => {
        console.log("Task Edited:", data);
        alert("Task updated successfully!");
        console.log("Sending benchmark:", taskData.task_benchmark);

    })
    .catch((error) => {
        console.error("Error editing task:", error);
        alert("Error editing task. Check console for details.");
    });
});


// ✅ Auto-open modal and load data when coming from a link
window.addEventListener("DOMContentLoaded", function () {
    const urlParams = new URLSearchParams(window.location.search);
    const editMode = urlParams.get("edit");
    const title = urlParams.get("title");
    const project = urlParams.get("project");
    const scope = urlParams.get("scope");

    if (editMode === "true" && title && project && scope) {
        // ✅ OPEN THE MODAL DIRECTLY
        const modal = document.getElementById("popupModal");
        if (modal) {
            modal.style.display = "flex";  // Show the popup manually
        }

        // ✅ WAIT A MOMENT TO LET THE FORM LOAD THEN FETCH AND POPULATE
        setTimeout(() => {
            fetch(`/api/get-task-edit/?title=${encodeURIComponent(title)}&project=${encodeURIComponent(project)}&scope=${encodeURIComponent(scope)}`)
                .then(response => response.json())
                .then((data) => {
                    if (data.error) {
                        alert("Task not found.");
                        return;
                    }

                    // Helper to set value and create <option> if missing
                    function setSelectValue(selectId, value) {
                        const select = document.getElementById(selectId);
                        if (!select) return;

                        // If option doesn't exist, create and append it
                        if (![...select.options].some(opt => opt.value === value)) {
                            const newOption = document.createElement("option");
                            newOption.value = value;
                            newOption.textContent = value;
                            newOption.selected = true;
                            select.appendChild(newOption);
                        }
                        select.value = value;
                    }

                    // Apply values
                    document.getElementById("taskTitle3").value = data.title || '';
                    document.getElementById("id_dnoedittask").value = data.d_no || '';
                    document.getElementById("id_assigned_toedittask").value = data.assigned_to || '';
                    document.getElementById("id_checkeredittask").value = data.checker || '';
                    document.getElementById("id_qc_3_checkeredittask").value = data.qc_3_checker || '';
                    document.getElementById("id_start_dateedittask").value = data.start_date || '';
                    document.getElementById("id_end_dateedittask").value = data.end_date || '';
                    document.getElementById("id_benchmarkedittask").value = data.task_benchmark || '';

                    // Dynamically ensure dropdowns are populated and selected
                    setSelectValue("id_listedittask", data.list || '');
                    setSelectValue("id_projectedittask", data.project || '');
                    setSelectValue("id_scopeedittask", data.scope || '');
                    setSelectValue("id_priorityedittask", data.priority || '');
                    setSelectValue("id_categoryedittask", data.category || '');
                    setSelectValue("id_verification_statusedittask", data.verification_status || '');
                    setSelectValue("id_task_statusedittask", data.task_status || '');
                    setSelectValue("id_revnoedittask", data.rev_no || '');
                    setSelectValue("taskTitleedittask", data.title || '');
                })
                .catch(err => {
                    console.error("Failed to load task data:", err);
                    alert("Failed to load task data.");
                });
        }, 300);
    }
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
            datasets: [{ data: [19, 12, 24, 15, 30], backgroundColor: ["#1E90FF", "#4682B4", "#5F9EA0", "#87CEFA", "#B0E0E6"] }]
        }
    });
}, 300);



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
                const filteredTasks = data.timesheet_entries.filter(task => task.assigned === currentUserName);
                populateCalendar(filteredTasks, year, month);
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

    const filteredTasks = tasks.filter(task => task.assigned === currentUserName);


    if (filteredTasks.length > 0) {
        filteredTasks.forEach(task => {
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


document.addEventListener("DOMContentLoaded", function () {
    const modalHTML = `
       <div id="updateTimesheetModal" class="modal" style="display:none;">
           <div class="modal-content">
               <span class="close">&times;</span>
               <h2>Update Timesheet</h2>
               <form id="updateTimesheetForm">
                   <input type="hidden" id="task_id">

                   <div class="form-group">
                       <label for="dateforupdatetimesheet">Select Date:</label>
                       <input type="date" id="dateforupdatetimesheet" name="date1" required>
                   </div>

                   <div class="form-group">
                       <label for="listforupdatetimesheet">Department:</label>
                       <select id="listforupdatetimesheet" name="list"></select>
                   </div>

                   <div class="form-group">
                       <label for="projectsforupdatetimesheet">Project Type:</label>
                       <select id="projectsforupdatetimesheet" name="projects"></select>
                   </div>

                   <div class="form-group">
                       <label for="scopeforupdatetimesheet">Scope:</label>
                       <select id="scopeforupdatetimesheet" name="scope"></select>
                   </div>

                   <div class="form-group">
                       <label for="titleforupdatetimesheet">Task:</label>
                       <select id="titleforupdatetimesheet" name="title"></select>
                   </div>

                   <div class="form-group">
                       <label for="categoryforupdatetimesheet">Phase:</label>
                       <select id="categoryforupdatetimesheet" name="category"></select>
                   </div>

                   <div class="form-group">
                       <label for="task_statusforupdatetimesheet">Phase Status:</label>
                       <select id="task_statusforupdatetimesheet" name="task_status">
                           <option value="Completed">Completed</option>
                           <option value="Pending">Pending</option>
                           <option value="In Progress">In Progress</option>
                       </select>
                   </div>

                   <div class="form-group">
                        <label for="timeforupdatetimesheet">Hours:</label>
                        <input type="number" id="timeforupdatetimesheet" name="time1" step="any" min="0" max="23" required>
                    </div>

                   <div class="form-group">
                       <label for="commentsforupdatetimesheet">Comments:</label>
                       <textarea id="commentsforupdatetimesheet" name="comments"></textarea>
                   </div>

                   <div class="form-group">
                       <button type="submit">Update Timesheet</button>
                   </div>
               </form>
           </div>
       </div>
    `;
    document.body.insertAdjacentHTML("beforeend", modalHTML);

    document.querySelector(".close").addEventListener("click", function () {
        document.getElementById("updateTimesheetModal").style.display = "none";
    });

    document.getElementById("updateTimesheetForm").addEventListener("submit", function (event) {
        event.preventDefault();
        updateTask();
    });

    document.getElementById("listforupdatetimesheet").addEventListener("change", filterProjects);
    document.getElementById("projectsforupdatetimesheet").addEventListener("change", filterScopes);
    document.getElementById("scopeforupdatetimesheet").addEventListener("change", filterTasks);
    document.getElementById("titleforupdatetimesheet").addEventListener("change", filterPhases);
});

// Store dropdown data globally
let dropdownData = {};

function openUpdateTimesheetModal(taskId) {
    document.getElementById("updateTimesheetModal").style.display = "flex";

    fetch(`/get_task_details/?task_id=${taskId}`)
        .then(response => response.json())
        .then(data => {
            console.log("Dropdown Data:", data.dropdowns);
            dropdownData = data.dropdowns;

            const task = data.task;

            // Set hidden field
            document.getElementById("task_id").value = task.id;

            // Set simple input fields
            document.getElementById("dateforupdatetimesheet").value = task.date1 || "";
            document.getElementById("timeforupdatetimesheet").value = task.time || "";
            document.getElementById("task_statusforupdatetimesheet").value = task.task_status || "";
            document.getElementById("commentsforupdatetimesheet").value = task.comments || "";

            // Populate dropdowns (cascade and select existing values)
            populateDropdown1("listforupdatetimesheet", dropdownData.list, task.list);

            // Set up delay to allow dropdown filtering to complete
            setTimeout(() => {
                populateDropdown1("projectsforupdatetimesheet", 
                    dropdownData.projects.filter(p => p.list === task.list).map(p => p.name),
                    task.projects
                );

                populateDropdown1("scopeforupdatetimesheet", 
                    dropdownData.scope.filter(s => s.project === task.projects).map(s => s.name),
                    task.scope
                );

                populateDropdown1("titleforupdatetimesheet", 
                    dropdownData.titles.filter(t => t.scope === task.scope).map(t => t.name),
                    task.title
                );

                populateDropdown1("categoryforupdatetimesheet", 
                    dropdownData.category.filter(c => c.task === task.title).map(c => c.name),
                    task.category
                );
            }, 100); // Delay to allow filters to cascade
        })
        .catch(error => {
            console.error("Error fetching task details:", error);
            alert("Failed to fetch task details. Please check the backend.");
        });
}


function populateDropdown1(selectId, options, selectedValue) {
    const selectElement = document.getElementById(selectId);
    selectElement.innerHTML = `<option value="">Select</option>`;

    if (!options || options.length === 0) {
        console.warn(`No valid options for ${selectId}`);
        return;
    }

    options.forEach(item => {
        const option = document.createElement("option");
        option.value = item;
        option.textContent = item;
        if (selectedValue && selectedValue === item) {
            option.selected = true;
        }
        selectElement.appendChild(option);
    });

    selectElement.dispatchEvent(new Event("change"));
}

// Filtering Functions
function filterProjects() {
    const selectedList = document.getElementById("listforupdatetimesheet").value;
    console.log("Selected Department:", selectedList);

    if (!selectedList) return;

    if (!dropdownData.projects || dropdownData.projects.length === 0) {
        console.warn("Projects array is empty in dropdownData!");
        return;
    }

    const filteredProjects = dropdownData.projects
        .filter(p => p.list === selectedList)
        .map(p => p.name);

    console.log("Filtered Projects:", filteredProjects);
    populateDropdown1("projectsforupdatetimesheet", filteredProjects, "");
    filterScopes();
}

function filterScopes() {
    const selectedProject = document.getElementById("projectsforupdatetimesheet").value;
    console.log("Selected Project Type:", selectedProject);

    if (!selectedProject) return;

    if (!dropdownData.scope || dropdownData.scope.length === 0) {
        console.warn("Scope array is empty in dropdownData!");
        return;
    }

    const filteredScopes = dropdownData.scope
        .filter(s => s.project === selectedProject)
        .map(s => s.name);

    console.log("Filtered Scopes:", filteredScopes);
    populateDropdown1("scopeforupdatetimesheet", filteredScopes, "");
    filterTasks();
}

function filterTasks() {
    const selectedScope = document.getElementById("scopeforupdatetimesheet").value;
    console.log("Selected Scope:", selectedScope);

    if (!selectedScope) return;

    if (!dropdownData.titles || dropdownData.titles.length === 0) {
        console.warn("Titles array is empty in dropdownData!");
        return;
    }

    const filteredTitles = dropdownData.titles
        .filter(t => t.scope === selectedScope)
        .map(t => t.name);

    console.log("Filtered Tasks:", filteredTitles);
    populateDropdown1("titleforupdatetimesheet", filteredTitles, "");
    filterPhases();
}

function filterPhases() {
    const selectedTask = document.getElementById("titleforupdatetimesheet").value;
    console.log("Selected Task:", selectedTask);

    if (!selectedTask) return;

    if (!dropdownData.category || dropdownData.category.length === 0) {
        console.warn("Category array is empty in dropdownData!");
        return;
    }

    const filteredCategories = dropdownData.category
        .filter(c => c.task === selectedTask)
        .map(c => c.name);

    console.log("Filtered Phases:", filteredCategories);
    populateDropdown1("categoryforupdatetimesheet", filteredCategories, "");
}

// Function to update a task entry
function updateTask() {
    const taskId = document.getElementById("task_id").value;
    let dateValue = document.getElementById("dateforupdatetimesheet").value.trim();

    // If dateValue is empty, set it to NULL instead of an empty string
    if (!dateValue) {
        dateValue = null;
    }

    fetch(`/update_task/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCSRFToken()
        },
        body: JSON.stringify({
            task_id: taskId,
            date1: dateValue,  // Make sure it's NULL or a valid date
            list: document.getElementById("listforupdatetimesheet").value,
            projects: document.getElementById("projectsforupdatetimesheet").value,
            scope: document.getElementById("scopeforupdatetimesheet").value,
            title: document.getElementById("titleforupdatetimesheet").value,
            category: document.getElementById("categoryforupdatetimesheet").value,
            task_status: document.getElementById("task_statusforupdatetimesheet").value,
            time: document.getElementById("timeforupdatetimesheet").value,
            comments: document.getElementById("commentsforupdatetimesheet").value,
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert("Error: " + data.error);
        } else {
            alert(data.message || "Timesheet updated successfully.");
            document.getElementById("updateTimesheetModal").style.display = "none";
            location.reload();
        }
    })
    .catch(error => console.error("Error updating timesheet:", error));
}


// Click event listener for opening the update modal
document.getElementById("timesheetContent").addEventListener("click", function(event) {
    if (event.target.classList.contains("comment_button")) {
        const taskId = event.target.dataset.id;  
        openUpdateTimesheetModal(taskId);
    } else if (event.target.classList.contains("delete_button")) {
        const taskId = event.target.dataset.id;
        deleteTask(taskId);
    }
});




// Function to delete a task entry (Unchanged as per request)
function deleteTask(taskId) {
    if (confirm("Are you sure you want to delete this task?")) {
        fetch(`/delete_task/?task_id=${taskId}`, {
            method: "GET",
            headers: {
                "X-CSRFToken": getCSRFToken()
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.message) {
                alert("Task deleted successfully!");
                location.reload();
            } else {
                alert("Error: " + data.error);
            }
        });
    }
}

// Function to get CSRF Token
function getCSRFToken() {
    let cookieValue = null;
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.startsWith("csrftoken=")) {
            cookieValue = cookie.substring("csrftoken=".length);
            break;
        }
    }
    return cookieValue;
}

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
function getCookies(name) {
    const cookieArr = document.cookie.split(";");

    for (let i = 0; i < cookieArr.length; i++) {
        const cookie = cookieArr[i].trim();
        if (cookie.startsWith(name + "=")) {
            return cookie.substring(name.length + 1);
        }
    }

    return "";
}

document.getElementById("fileInput").addEventListener("change", function(event) {
    const file = event.target.files[0];
    
    if (file) {
        // Create a FileReader to read the Excel file
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const data = e.target.result;
            const workbook = XLSX.read(data, { type: 'binary' });

            // Get the first sheet of the Excel file
            const sheet = workbook.Sheets[workbook.SheetNames[0]];

            // Convert the sheet to JSON format
            const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

            // Call the function to populate the table with row 40 data and onwards
            populateTable(jsonData);
        };

        reader.readAsBinaryString(file);
    }
});

function populateTable(data) {
    // Show the table and clear any previous data
    const table = document.getElementById("dataTable");
    const tableHeader = table.querySelector("thead tr");
    const tableBody = table.querySelector("tbody");

    // Clear existing data
    tableHeader.innerHTML = "";
    tableBody.innerHTML = "";

    // Populate the table header (for the relevant columns B, D, F)
    const headers = ['TASKS', 'PROJECT', 'PARENT DELIVERABLE', 'ESTIMATED TIME (Hrs)'];
    headers.forEach(header => {
        const th = document.createElement("th");
        th.textContent = header;
        tableHeader.appendChild(th);
    });

    // Loop through rows starting from row 40 (index 39 in 0-indexed array)
    for (let i = 40; i < data.length; i++) {
        const row = data[i];

        // Ensure the row has enough columns (check if it has at least 6 columns)
        if (row.length >= 6) {
            const tr = document.createElement("tr");

            // Only add columns B, D, F (index 1, 3, 5) to the table
            const relevantColumns = [row[1], row[2], row[3], row[5]]; // Column B (index 1), D (index 3), F (index 5)

            relevantColumns.forEach(cellData => {
                const td = document.createElement("td");
                td.textContent = cellData || ''; // Handle empty cells gracefully
                tr.appendChild(td);
            });

            tableBody.appendChild(tr);
        }
    }

    // Show the table after populating it
    document.getElementById("excelDataTable").style.display = "block";
}
