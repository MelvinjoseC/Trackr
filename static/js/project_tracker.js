// Function to open the Create Project Popup
function openCreateProjectPopup() {
    const createProjectModal = document.getElementById("createProjectModal");
    if (createProjectModal) {
        createProjectModal.style.display = "flex";
    } else {
        console.error("createProjectModal element not found.");
    }
}

// Function to close the Create Project Popup
function closeCreateProjectPopup() {
    const createProjectModal = document.getElementById("createProjectModal");
    if (createProjectModal) {
        createProjectModal.style.display = "none";
    } else {
        console.error("createProjectModal element not found.");
    }
}


// Function to submit the project form (you can modify this as needed)
function submitProjectForm() {
    alert("Project submitted successfully!");
}

// Ensure JavaScript runs only after DOM is fully loaded
document.addEventListener("DOMContentLoaded", function () {
    let submitButton = document.querySelector(".submit-btn");

    if (submitButton) {
        submitButton.addEventListener("click", function (event) {
            event.preventDefault();

            // Get form inputs
            let projectName = document.getElementById("projectName").value.trim();
            let startDate = document.getElementById("startDate").value;
            let endDate = document.getElementById("endDate").value;
            let scope = document.getElementById("scope").value.trim();
            let category = document.getElementById("category").value.trim();
            let benchmark = document.getElementById("Benchmark").value.trim();

            // Ensure fields are filled
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
                    document.getElementById("projectForm").reset(); // Clear the form
                    closeCreateProjectPopup();
                    location.reload();
                } else {
                    alert("Error: " + (data.error || "Unknown error"));
                }
            })
            .catch(error => {
                console.error("Submission Error:", error);
            })
            .finally(() => {
                submitButton.disabled = false;
                submitButton.textContent = "Submit";
            });
        });
    }
});

// Updated function to handle task action with name and d_no
function handleTaskAction(action, projectName, taskDno) {
  fetch("/task-action/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": getCSRFToken(),
    },
    credentials: "include",
    body: JSON.stringify({
      action: action,
      task_data: {
        name: projectName,   // ProjectTacker.name to find project
        d_no: taskDno        // unique task identifier within to_aproove JSON
      }
    }),
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      alert(data.message);
      location.reload();
    } else {
      alert('Error: ' + data.message);
    }
  })
  .catch(err => alert('Request failed: ' + err));
}

function getCSRFToken() {
  const name = 'csrftoken';
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    cookie = cookie.trim();
    if (cookie.startsWith(name + '=')) {
      return decodeURIComponent(cookie.substring(name.length + 1));
    }
  }
  return '';
}

// Ensure JavaScript runs only after DOM is fully loaded
document.addEventListener("DOMContentLoaded", function () {
    const submitButton1 = document.getElementById("submit1");

    if (submitButton1) {
        submitButton1.addEventListener("click", function (event) {
            event.preventDefault(); // Prevent the default form submission

            // Get form inputs
            let projectName = document.getElementById("projects").value.trim();
            let scope = document.getElementById("scope").value.trim();
            let category = document.getElementById("category").value.trim();
            let projectStatus = document.getElementById("project_status").value.trim();

            // Ensure fields are filled
            if (!projectName || !scope || !category || !projectStatus) {
                alert("All fields are required!");
                return;
            }

            let formData = new FormData();
            formData.append("projects", projectName);
            formData.append("scope", scope);
            formData.append("category", category);
            formData.append("project_status", projectStatus);

            submitButton1.disabled = true;
            submitButton1.textContent = "Submitting...";

            // Send the form data to the backend to update the project status
            fetch("/update_project_status/", {
                method: "POST",
                body: formData,
                headers: { "X-CSRFToken": getCsrfToken() }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert("Project status updated successfully!");
                    document.getElementById("updateStatusForm").reset(); // Clear the form
                    closeCreateProjectPopup(); // Close the popup
                    location.reload(); // Reload the page to see the changes
                } else {
                    alert("Error: " + (data.error || "Unknown error"));
                }
            })
            .catch(error => {
                console.error("Submission Error:", error);
            })
            .finally(() => {
                submitButton1.disabled = false;
                submitButton1.textContent = "Submit";
            });
        });
    }});
    document.addEventListener("DOMContentLoaded", function () {
        const submitButton1 = document.getElementById("submit_button1");
        const updateProjectStatusBtn = document.getElementById("UPDATE_PROJECTSTATUS");
        const updateFormContainer = document.getElementById("updateFormContainer");
        const formTitleBox = document.getElementById("updatecontainer"); // Corrected to match the form title box
        const goBackBtn = document.getElementById("goBackBtn");
    
        // Fetch project data (projects) from the backend
        fetch('/get-projects-data/')
            .then(response => response.json())
            .then(data => {
                // Populate the Project Name dropdown
                const projectSelect = document.getElementById("projects");
                data.projects.forEach(project => {
                    let option = document.createElement("option");
                    option.value = project;
                    option.textContent = project;
                    projectSelect.appendChild(option);
                });
            })
            .catch(error => {
                console.error("Error fetching project data:", error);
            });
    
        // Handle form submission when the "Update Status" button is clicked
        submitButton1.addEventListener("click", function (event) {
            event.preventDefault(); // Prevent the default form submission
    
            // Get selected project name and project status
            let projectName = document.getElementById("projects").value.trim();
            let projectStatus = document.getElementById("project_status").value.trim();
    
            // Ensure fields are filled
            if (!projectName || !projectStatus) {
                alert("Both Project Name and Status are required!");
                return;
            }
    
            let formData = new FormData();
            formData.append("projects", projectName);
            formData.append("project_status", projectStatus);
    
            submitButton1.disabled = true;
            submitButton1.textContent = "Submitting...";
    
            // Send the form data to the backend to update the project status
            fetch("/update_project_status/", {
                method: "POST",
                body: formData,
                headers: { "X-CSRFToken": getCsrfToken() }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert("Project status updated successfully!");
                    document.getElementById("updateStatusForm").reset(); // Clear the form
                    closeCreateProjectPopup(); // Close the popup
                    location.reload(); // Reload the page to see the changes
                } else {
                    alert("Error: " + (data.error || "Unknown error"));
                }
            })
            .catch(error => {
                console.error("Submission Error:", error);
                alert("An error occurred. Please check your internet connection or try again.");
            })
            .finally(() => {
                submitButton1.disabled = false;
                submitButton1.textContent = "Submit";
            });
        });
    
        // When the "PROJECT CLOSURE" button is clicked, hide the form title box and show the form inside the form-title-box
        updateProjectStatusBtn.addEventListener("click", function() {
            formTitleBox.style.display = "none"; // Hide the form title box
            updateFormContainer.style.display = "block"; // Show the form inside the form-title-box
        });
    
        // When the "Go Back" button is clicked, hide the form and show the form title box again
        goBackBtn.addEventListener("click", function() {
            formTitleBox.style.display = "block"; // Show the form title box
            updateFormContainer.style.display = "none"; // Hide the form
        });
    });
    
    // Function to get CSRF Token (for security in POST requests)
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
    

// // Calendar Rendering Code (unchanged from previous)
// document.addEventListener("DOMContentLoaded", function () {
//     const monthYear = document.getElementById("monthYear");
//     const calendarDates = document.getElementById("calendarDates");
//     const prevMonthBtn = document.getElementById("prevMonth");
//     const nextMonthBtn = document.getElementById("nextMonth");

//     let currentDate = new Date();

//     function renderCalendar() {
//         const today = new Date();
//         const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
//         const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
//         const firstDayOfWeek = firstDayOfMonth.getDay();
//         const lastDayOfWeek = lastDayOfMonth.getDay();
//         const prevMonthLastDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate();
        
//         monthYear.textContent = firstDayOfMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" });

//         calendarDates.innerHTML = "";

//         // Previous month days
//         for (let i = firstDayOfWeek; i > 0; i--) {
//             let dateEl = document.createElement("div");
//             dateEl.classList.add("date", "other-month");
//             dateEl.textContent = prevMonthLastDay - i + 1;
//             calendarDates.appendChild(dateEl);
//         }

//         // Current month days
//         for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
//             let dateEl = document.createElement("div");
//             dateEl.classList.add("date", "current-month");
//             dateEl.textContent = i;

//             // Set active class if it matches today's date
//             if (
//                 today.getDate() === i &&
//                 today.getMonth() === currentDate.getMonth() &&
//                 today.getFullYear() === currentDate.getFullYear()
//             ) {
//                 dateEl.classList.add("selected");
//             }

//             dateEl.addEventListener("click", function () {
//                 document.querySelectorAll(".date").forEach(el => el.classList.remove("selected"));
//                 dateEl.classList.add("selected");
//             });

//             calendarDates.appendChild(dateEl);
//         }

//         // Next month days
//         for (let i = 1; i < 7 - lastDayOfWeek; i++) {
//             let dateEl = document.createElement("div");
//             dateEl.classList.add("date", "other-month");
//             dateEl.textContent = i;
//             calendarDates.appendChild(dateEl);
//         }
//     }

//     prevMonthBtn.addEventListener("click", function () {
//         currentDate.setMonth(currentDate.getMonth() - 1);
//         renderCalendar();
//     });

//     nextMonthBtn.addEventListener("click", function () {
//         currentDate.setMonth(currentDate.getMonth() + 1);
//         renderCalendar();
//     });

//     renderCalendar();
// });
