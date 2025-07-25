document.getElementById("closePopupButton_creattask").addEventListener("click", function () {
    document.getElementById("taskModalPopup").style.display = "none";
});

document.getElementById('up-arrow').addEventListener('click', function() {
    document.getElementById('scrollable-list').scrollBy({
        top: -50,
        behavior: 'smooth'
    });
});

document.getElementById('down-arrow').addEventListener('click', function() {
    document.getElementById('scrollable-list').scrollBy({
        top: 50,
        behavior: 'smooth'
    });
});

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('left-arrow').addEventListener('click', function() {
        document.querySelector('.tasks').scrollBy({
            left: -300,
            behavior: 'smooth'
        });
    });

    document.getElementById('right-arrow').addEventListener('click', function() {
        document.querySelector('.tasks').scrollBy({
            left: 300,
            behavior: 'smooth'
        });
    });
});

const sidebarLinks = document.querySelectorAll('.sidebar-link');
sidebarLinks.forEach(link => {
    link.addEventListener('click', function () {
        sidebarLinks.forEach(l => l.classList.remove('active'));
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
       setTimeout(() => {
        if (data.tasks && data.tasks.length > 0) {
            populateDropdowns(data.tasks);
            populateDropdowns_updatetask(data.tasks);
        }
    }, 300); // small delay to ensure modal content is rendered
    
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


// document.getElementById("submitTimesheetButton").addEventListener("click", submitTimesheet);

// function submitTimesheet() {
//     const selectedTask = document.getElementById("TaskSelect").value;

//     // Get team from global data for the selected task
//     const matchedTask = golbalfetchdata.tasks.find(task => task.title === selectedTask);
//     const team = matchedTask ? matchedTask.team || "" : "";

//     const formData = {
//         date1: document.getElementById("date1").value,
//         list: document.getElementById("projectListSelect").value,
//         project_type: document.getElementById("projectTypeSelect").value,
//         scope: document.getElementById("scopeSelect").value,
//         task: selectedTask,
//         phase: document.getElementById("phaseSelect").value,
//         phase_status: document.getElementById("phaseStatusSelect").value,
//         time: document.getElementById("time").value,
//         comments: document.getElementById("comments").value,
//         team: team // Added here
//     };

//     // Validate form data
//     if (!formData.date1 || !formData.list || !formData.project_type || 
//         !formData.scope || !formData.task || !formData.phase || 
//         !formData.time || !formData.comments) {
//         alert("Please fill in all fields before submitting.");
//         return;
//     }

//     console.log("Form Data Sent to Backend:", formData);

//     // Sending the data to the backend via POST request
//     fetch("/api/submit_timesheet/", {
//         method: "POST",
//         headers: {
//             "Content-Type": "application/json",
//         },
//         body: JSON.stringify(formData),
//     })
//     .then(response => {
//         if (!response.ok) {
//             throw new Error(`HTTP error! status: ${response.status}`);
//         }
//         return response.json();
//     })
//     .then(data => {
//         if (data.message) {
//             alert(data.message);
//             console.log("Success:", data);
//         } else {
//             console.error("Error:", data.error);
//         }
//     })
//     .catch(error => {
//         console.error("Error submitting timesheet:", error);
//     });
// }

// -------------------------------------
// FOR MANUAL TIMESHEETS
// -------------------------------------

document.getElementById("manual_timesheet").addEventListener("click", function () {
    document.getElementById("timesheetpopup").style.display = "flex";
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

            // Always show Save Task and Project Tracker buttons
            const saveBtn = document.getElementById('savetask_creatask');
            const projectBtn = document.getElementById('project-button');

            if (saveBtn) saveBtn.style.display = 'block';
            if (projectBtn) projectBtn.style.display = 'flex';

            // Always hide approver and notifications
            const approverBtn = document.getElementById('aproover_creattask');
            const notificationBtn = document.getElementById('notifications');

            if (approverBtn) approverBtn.style.display = 'none';
            if (notificationBtn) notificationBtn.style.display = 'none';

            // Populate dropdowns
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

        // Repopulate dropdowns every time modal opens
        if (golbalfetchdata && golbalfetchdata.tasks && golbalfetchdata.tasks.length > 0) {
            populateDropdowns_updatetask(golbalfetchdata.tasks);

            // Optionally, trigger the first dropdown's change event to cascade
            const initialProjectDropdown = document.getElementById("id_projectedittask");
            if (initialProjectDropdown && initialProjectDropdown.options.length > 1) {
                initialProjectDropdown.selectedIndex = 1;  // Select first project (skip "Select")
                initialProjectDropdown.dispatchEvent(new Event("change"));
            }
        } else {
            console.error("No tasks data found for Edit Task dropdowns.");
        }
    });
});



function populateDropdowns_updatetask(tasks) {
    let selectedProject = "";
    let selectedScope = "";

    function populateDropdown(id, field, filterTasks = tasks) {
        const dropdown = document.getElementById(id);
        if (!dropdown) return;
        dropdown.innerHTML = '<option value="">Select</option>';
        const unique = new Set();
        filterTasks.forEach(task => {
            const val = task[field];
            if (val && !unique.has(val)) {
                unique.add(val);
                const option = document.createElement("option");
                option.value = val;
                option.textContent = val;
                dropdown.appendChild(option);
            }
        });
    }

    function populateFormFields(task) {
        if (!task) return;
        document.getElementById("id_projectedittask").value = task.projects || "";
        document.getElementById("id_scopeedittask").value = task.scope || "";
        document.getElementById("taskTitle3").value = task.title || "";
        document.getElementById("id_dnoedittask").value = task.d_no || "";
        document.getElementById("id_categoryedittask").value = task.category || "";
        document.getElementById("id_start_dateedittask").value = task.start_date || "";
        document.getElementById("id_end_dateedittask").value = task.end_date || "";
        document.getElementById("id_benchmarkedittask").value = task.task_benchmark || "";
    }

    document.getElementById("id_projectedittask").addEventListener("change", function () {
        selectedProject = this.value;
        const filtered = tasks.filter(task => task.projects === selectedProject);
        populateDropdown("id_scopeedittask", "scope", filtered);
        document.getElementById("id_scopeedittask").dispatchEvent(new Event("change")); // Auto trigger next
    });

    document.getElementById("id_scopeedittask").addEventListener("change", function () {
        selectedScope = this.value;
        const filtered = tasks.filter(task => task.projects === selectedProject && task.scope === selectedScope);
        populateDropdown("taskTitleedittask", "title", filtered);

        // Populate category dropdown based on selected project and scope
        populateDropdown("id_categoryedittask", "category", filtered);
    });

    document.getElementById("taskTitleedittask").addEventListener("change", function () {
        const title = this.value;
        globalselectedtitil_for_edit_task = title;

        // Filter and populate rev options
        const matchingTasks = tasks.filter(t => t.title === title && t.projects === selectedProject && t.scope === selectedScope);
        const revDropdown = document.getElementById("id_revnoedittask");
        if (revDropdown) {
            revDropdown.innerHTML = '<option value="">Select</option>';
            const uniqueRevs = new Set();
            matchingTasks.forEach(task => {
                if (task.rev && !uniqueRevs.has(task.rev)) {
                    uniqueRevs.add(task.rev);
                    const option = document.createElement("option");
                    option.value = task.rev;
                    option.textContent = task.rev;
                    revDropdown.appendChild(option);
                }
            });
        }

        // Populate category dropdown based on selected project, scope, and title
        populateDropdown("id_categoryedittask", "category", matchingTasks);

        // Autofill form using first matching task
        if (matchingTasks.length > 0) {
            populateFormFields(matchingTasks[0]);
        }
    });


    document.getElementById("id_revnoedittask").addEventListener("change", function () {
        const rev = this.value;
        const task = tasks.find(t => t.rev === rev && t.title === globalselectedtitil_for_edit_task);
        populateFormFields(task);
    });


    // 🔧 Initialize Project Dropdown and trigger first change to populate rest
    populateDropdown("id_projectedittask", "projects");

    const initialProjectDropdown = document.getElementById("id_projectedittask");
    if (initialProjectDropdown.options.length > 1) {
        initialProjectDropdown.selectedIndex = 1;  // Select first project (skip "Select")
        initialProjectDropdown.dispatchEvent(new Event("change"));
    }
}


// Save/Update handler

document.getElementById("savetask_updatetask").addEventListener("click", function (e) {
    e.preventDefault();

    const taskData = {
        title: document.getElementById("taskTitle3").value,
        project: document.getElementById("id_projectedittask").value,
        scope: document.getElementById("id_scopeedittask").value,
        category: document.getElementById("id_categoryedittask").value,
        start_date: document.getElementById("id_start_dateedittask").value,
        end_date: document.getElementById("id_end_dateedittask").value,
        rev_no: document.getElementById("id_revnoedittask").value,
        d_no: document.getElementById("id_dnoedittask").value,
        task_benchmark: document.getElementById("id_benchmarkedittask").value,
        globalselectedtitil_for_edit_task_backend: globalselectedtitil_for_edit_task
    };

    fetch(`/api/edit-task/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCookies("csrftoken"),
        },
        body: JSON.stringify(taskData),
    })
        .then((res) => res.json())
        .then((data) => {
            console.log("✅ Task Updated:", data);
            alert("Task updated successfully!");
        })
        .catch((err) => {
            console.error("❌ Task update failed:", err);
            alert("Error updating task. Check console.");
        });
});



// manual timesheet

document.getElementById("closePopupButton_manualtimesheet").addEventListener("click", function () {
    document.getElementById("timesheetpopup").style.display = "none";
    location.reload(); // This will refresh the page
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

let previewedExcelData = []; // Global to share between both parts

// Handle Excel file change (Preview in table)
document.getElementById("fileInput").addEventListener("change", function (event) {
    const file = event.target.files[0];
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const data = e.target.result;
            const workbook = XLSX.read(data, { type: 'binary' });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

            previewedExcelData = jsonData; // Save for later POST use
            populateTable(jsonData);       // Show preview
        };
        reader.readAsBinaryString(file);
    }
});

// Show Excel data in a table
function populateTable(data) {
    const table = document.getElementById("dataTable");
    const tableHeader = table.querySelector("thead tr");
    const tableBody = table.querySelector("tbody");

    tableHeader.innerHTML = "";
    tableBody.innerHTML = "";

    const headers = ['TASKS', 'PROJECT', 'SCOPE', 'CATEGORY', 'TASK BENCHMARK', 'D. NO','REV','START','END','MAILNO','REF NO'];
    
    headers.forEach(header => {
        const th = document.createElement("th");
        th.textContent = header;
        tableHeader.appendChild(th);
    });

    for (let i = 1; i < data.length; i++) {
        const row = data[i];
        const tr = document.createElement("tr");

        for (let j = 0; j < headers.length; j++) {
            const td = document.createElement("td");
            td.textContent = row[j] || '';
            tr.appendChild(td);
        }

        tableBody.appendChild(tr);
    }

    document.getElementById("excelDataTable").style.display = "block";
}

// Submit form and Excel data to backend
document.getElementById("savetask_creatask").addEventListener("click", function (e) {
    e.preventDefault();

    if (!previewedExcelData.length) {
        alert("Please upload and preview a valid Excel file first.");
        return;
    }

    // Process Excel rows starting from line 41 (index 40)
    const excelData = [];
    for (let index = 40; index < previewedExcelData.length; index++) {
        const row = previewedExcelData[index];
        if (row.every(cell => cell === "" || cell === null)) break;

        excelData.push({
            title: row[1],
            projects: row[2],
            scope: row[3],
            task_benchmark: row[5]
        });
    }

    fetch("/api/create-task/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ tasks: excelData })

    })
    .then(response => response.json())
    .then(data => {
        console.log("Task Created:", data);
        alert("Task created successfully!");
    })
    .catch(error => {
        console.error("Error creating task:", error);
        alert("Error creating task. Check console for details.");
    });
});


