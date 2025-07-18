document.addEventListener("DOMContentLoaded", function () {
    const projectSelect = document.getElementById("project-select");
    const categorySelect = document.getElementById("category-select");
    const calendar = document.getElementById("calendar12");
    const totalTimeDisplay = document.getElementById("total-time");
    const monthYear = document.getElementById("currentMonth");
    const totalPhaseTimeDisplay = document.getElementById("total-phase-time");
    const totalTimeDisplayContainer = document.getElementById("total-time-display");
    const totalPhaseTimeContainer = document.getElementById("total-phase-time-display");
    const rightSidebar = document.getElementById("right-sidebar"); // Sidebar container for task details
    const taskBenchmarkTimeDisplay = document.getElementById("task-benchmark-time");  // Add new element reference


    let current = new Date();

    // Function to load projects in the dropdown and fetch data from the backend
    function loadProjects() {
        fetch("/attendance/monthly-project-analysis/")
            .then(response => response.json())
            .then(data => {
                const uniqueProjects = new Set();

                // Populate project dropdown with unique projects
                data.projects.forEach(project => {
                    uniqueProjects.add(project.projects);
                });

                uniqueProjects.forEach(projectName => {
                    const option = document.createElement("option");
                    option.value = projectName;
                    option.textContent = projectName;
                    projectSelect.appendChild(option);
                });
            })
            .catch(error => {
                console.error("Error fetching project data:", error);
            });
    }

    // Function to fetch task details and display them in the right sidebar
    function loadTaskDetails(date) {
        fetch(`/attendance/get-task-details-for-sidebar/?date=${date}`)
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    rightSidebar.innerHTML = `<div> ${data.error}</div>`;
                    return;
                }

                if (data.tasks.length === 0) {
                    rightSidebar.innerHTML = "<div>No tasks found for this date</div>";
                    return;
                }

                // Populate the right sidebar with task details
                rightSidebar.innerHTML = data.tasks.map(task => `
                    <h3>${task.title}</h3>
                    <p><strong>Project:</strong> ${task.projects}</p>
                    <p><strong>Scope:</strong> ${task.scope}</p>
                    <p><strong>Category:</strong> ${task.category}</p>
                    <p><strong>Time:</strong> ${task.time} hrs</p>
                    <p><strong>Comments:</strong> ${task.comments}</p>
                    <p><strong>Assigned:</strong> ${task.assigned}</p>
                    <p><strong>Task Benchmark:</strong> ${task.task_benchmark}</p>
                    
                    <hr>
                `).join("");
            })
            .catch(error => {
                console.error("Error fetching task details:", error);
                rightSidebar.innerHTML = "<div>Error loading task data.</div>";
            });
    }

    // Function to update the calendar with project data (with default display before selecting project)
    function updateCalendar(projectName = '', category = '') {
        calendar.innerHTML = "";
        const currentMonth = current.getMonth();
        const currentYear = current.getFullYear();

        // Fetch all project data, without filtering by project or category initially
        fetch(`/attendance/monthly-project-analysis/?project_name=${projectName}&category=${category}`)
        .then(response => response.json())
        .then(data => {
            let totalTime = 0;
            let totalPhaseTime = 0;
            let totalBenchmarkTime = 0;  // Initialize a variable to store the total task benchmark time
            const datesWithTime = {}; // Store total work time for each date
            const projectBenchmarkSum = {}; // Object to store the sum of benchmark time per project
            const processedTitles = {}; // Track task titles processed for each project

            // Iterate through the project data
            data.projects.forEach(project => {
                const projectDate = new Date(project.date1);
                const projectMonth = projectDate.getMonth();
                const projectYear = projectDate.getFullYear();

                const time = parseFloat(project.time) || 0;
                const taskBenchmark = parseFloat(project.task_benchmark) || 0;  // Get the task benchmark value
                const taskTitle = project.projects + project.category + project.title;  // Unique identifier for the task title (combining project, category, and title)

                // Initialize project entry in projectBenchmarkSum if not already initialized
                if (!projectBenchmarkSum[project.projects]) {
                    projectBenchmarkSum[project.projects] = 0;  // Initialize benchmark sum for this project
                }

                // Initialize processedTitles entry for the project if not already initialized
                if (!processedTitles[project.projects]) {
                    processedTitles[project.projects] = new Set();  // Initialize set to track processed task titles for this project
                }

                // Only consider tasks for the selected project and category, but do not filter by month for task benchmarks
                if (project.projects === projectName || projectName === '') {  // Show all if no project selected
                    if (!category || project.category === category) {
                        // Sum task benchmark time for the project (no need to check for duplicate titles)
                        if (!processedTitles[project.projects].has(taskTitle)) {
                            projectBenchmarkSum[project.projects] += taskBenchmark;  // Add the task benchmark for this project
                            processedTitles[project.projects].add(taskTitle);  // Mark the task title as processed
                        }

                        // Add task time to the corresponding date (this still respects the month filter for the time display)
                        const dateStr = projectDate.toLocaleDateString("en-CA"); // Format the date to match YYYY-MM-DD
                        if (projectMonth === currentMonth && projectYear === currentYear) {
                            if (!datesWithTime[dateStr]) {
                                datesWithTime[dateStr] = 0;
                            }
                            datesWithTime[dateStr] += time;  // Sum the time for the day cell

                            totalTime += time;  // Sum the total time for the current month

                            if (category && project.category === category) {
                                totalPhaseTime += time;  // Sum the phase time for the selected category
                            }
                        }
                    }
                }
            });

            // Sum all task benchmarks for the selected project (in case there were multiple tasks)
            totalBenchmarkTime = Object.values(projectBenchmarkSum).reduce((sum, benchmark) => sum + benchmark, 0);

            // Display the total time for the selected month
            totalTimeDisplay.textContent = `${totalTime.toFixed(2)} hrs`;  // Format to 2 decimal places
            totalPhaseTimeDisplay.textContent = `${totalPhaseTime.toFixed(2)} hrs`;
            taskBenchmarkTimeDisplay.textContent = `${totalBenchmarkTime.toFixed(2)} hrs`;  // Display total benchmark time for the project

            // Show or hide the total time displays
            totalTimeDisplayContainer.style.display = category ? 'none' : 'block';
            totalPhaseTimeContainer.style.display = category ? 'block' : 'none';

            const year = currentYear;
            const month = currentMonth;
            const firstDay = new Date(year, month, 1);
            const lastDay = new Date(year, month + 1, 0);
            const startDay = firstDay.getDay();

            // Get the total number of days in the current month
            const totalDays = lastDay.getDate();

            // Calculate the total number of cells needed for the grid
            const totalCells = 42;  // 7 columns * 6 rows = 42 cells
            const remainingCells = totalCells - (startDay + totalDays);

            // Clear the calendar before updating
            calendar.innerHTML = '';

            // Add empty cells before the first day of the month
            for (let i = 0; i < startDay; i++) {
                const empty = document.createElement("div");
                empty.className = "day-cell empty-cell1"; // Add empty cell styling if needed
                calendar.appendChild(empty);
            }

            // Add actual days in the calendar
            for (let day = 1; day <= totalDays; day++) {
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const div = document.createElement("div");
                div.className = "day-cell";
                div.innerHTML = `<div>${day}</div>`;

                // Add total work time for the day if available
                if (datesWithTime[dateStr]) {
                    div.innerHTML += `<div>${datesWithTime[dateStr].toFixed(2)} hrs</div>`;
                }

                // Add event listener for clicking the day
                div.addEventListener("click", () => loadTaskDetails(dateStr)); // Pass the date to loadTaskDetails

                calendar.appendChild(div);
            }

            // Add empty cells after the last day of the month to complete the 42 cells
            for (let i = 0; i < remainingCells; i++) {
                const empty = document.createElement("div");
                empty.className = "day-cell empty-cell1"; // Add empty cell styling if needed
                calendar.appendChild(empty);
            }

        })
        .catch(error => {
            console.error("Error fetching project data:", error);
            calendar.innerHTML = "<div>Error loading data.</div>";
        });






    }

    // Function to update the category dropdown based on selected project
    function updateCategoryDropdown(projectName) {
        categorySelect.innerHTML = '<option value="">-- Select Category --</option>';

        fetch(`/attendance/project-categories/?project_name=${projectName}`)
            .then(response => response.json())
            .then(data => {
                const uniqueCategories = new Set();
                data.categories.forEach(category => {
                    uniqueCategories.add(category);
                });

                uniqueCategories.forEach(category => {
                    const option = document.createElement("option");
                    option.value = category;
                    option.textContent = category;
                    categorySelect.appendChild(option);
                });
            })
            .catch(error => {
                console.error("Error fetching categories:", error);
            });

        categorySelect.style.display = 'block';
    }

    // Function to update the month and year display
    function updateMonthYear() {
        const month = current.toLocaleString('default', { month: 'long' });
        const year = current.getFullYear();
        monthYear.textContent = `${month} ${year}`;
    }

    // Handle Previous Month Navigation
    document.getElementById("prev-months").onclick = () => {
        current.setMonth(current.getMonth() - 1);
        updateMonthYear();
        updateCalendar(projectSelect.value, categorySelect.value);
    };

    // Handle Next Month Navigation
    document.getElementById("next-months").onclick = () => {
        current.setMonth(current.getMonth() + 1);
        updateMonthYear();
        updateCalendar(projectSelect.value, categorySelect.value);
    };

    // When a project is selected, update the category dropdown and calendar
    projectSelect.addEventListener("change", function () {
        const selectedProject = projectSelect.value;
        if (selectedProject) {
            updateCategoryDropdown(selectedProject);
            updateCalendar(selectedProject);
        } else {
            calendar.innerHTML = "<div>No project selected</div>";
            totalTimeDisplay.textContent = '0 hrs';
            totalPhaseTimeDisplay.textContent = '0 hrs';
            totalTimeDisplayContainer.style.display = 'block';
            totalPhaseTimeContainer.style.display = 'none';
        }
    });

    // When a category is selected, update the calendar to show the time worked for the selected category
    categorySelect.addEventListener("change", function () {
        const selectedProject = projectSelect.value;
        const selectedCategory = categorySelect.value;
        if (selectedProject && selectedCategory) {
            updateCalendar(selectedProject, selectedCategory);
        }
    });

    // Initial load (before project and scope are selected)
    loadProjects();
    updateMonthYear();
    updateCalendar();  // Initial call with no project or category selected
});


document.addEventListener("DOMContentLoaded", function () {
    const formContainer = document.getElementById("project-form-container");
    const analysisContainer = document.getElementById("monthlyprojectanalysis");
    const toggleButton = document.getElementById("toggle-btn2");
    const backButton = document.getElementById("go-back-btn");
  
    // When "Monthly Project Analysis" button is clicked
    toggleButton.addEventListener("click", function () {
      // Hide the project form container and show the project analysis container
      formContainer.style.display = "none"; // Hide project form
      analysisContainer.style.display = "block"; // Show project analysis
      toggleButton.style.display = "none"; // Hide the button once analysis is open
    });
  
    // When "Go Back" button is clicked
    backButton.addEventListener("click", function () {
      // Show the project form container and hide the project analysis container
      formContainer.style.display = "block"; // Show project form
      analysisContainer.style.display = "none"; // Hide project analysis
      toggleButton.style.display = "inline-block"; // Show the button again when you go back
    });
});
