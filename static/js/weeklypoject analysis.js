document.addEventListener("DOMContentLoaded", function () {
    const formContainer = document.getElementById("project-form-container");
    const weeklyprojectanalysisContainer = document.getElementById("weeklyproject-analysis");
    const toggleButton = document.getElementById("toggle-btnweekly");
    const backButton = document.getElementById("go-back-btnz");
  
    const departmentDropdown = document.getElementById("departmentDropdown");
    const projectDropdown = document.getElementById("projectDropdown");
    const categoryDropdown = document.getElementById("categoryDropdown");
    const weekDropdown = document.getElementById("weekDropdown");
    const projectDataContainer = document.getElementById("projectDataContainer");

    // When "Monthly Project Analysis" button is clicked
    toggleButton.addEventListener("click", function () {
      // Hide the project form container and show the project analysis container
      formContainer.style.display = "none"; // Hide project form
      weeklyprojectanalysisContainer.style.display = "block"; // Show project analysis
      toggleButton.style.display = "none"; // Hide the button once analysis is open

      // Fetch department data when the analysis is opened
      fetchDepartments();
    });

    // When "Go Back" button is clicked
    backButton.addEventListener("click", function () {
      // Show the project form container and hide the project analysis container
      formContainer.style.display = "block"; // Show project form
      weeklyprojectanalysisContainer.style.display = "none"; // Hide project analysis
      toggleButton.style.display = "inline-block"; // Show the button again when you go back
    });

    // Fetch departments from the backend
    function fetchDepartments() {
      fetch("/get_project_data/?department=&project_name=&category=&week_offset=0")
        .then(response => response.json())
        .then(data => {
          const departments = new Set(data.departments); // Using Set to store unique departments
          departmentDropdown.innerHTML = '<option value="">Select Department</option>'; // Clear previous options
          departments.forEach(department => {
            const option = document.createElement("option");
            option.value = department;
            option.textContent = department;
            departmentDropdown.appendChild(option);
          });
        })
        .catch(error => console.error('Error fetching departments:', error));
    }

    // Update projects based on selected department
    departmentDropdown.addEventListener("change", function () {
      const department = departmentDropdown.value;
      if (department) {
        updateProjects(department);
      }
    });

    // Fetch projects for the selected department
    function updateProjects(department) {
      projectDropdown.innerHTML = '<option value="">Select Project</option>'; // Reset project dropdown

      fetch(`/get_project_data/?department=${department}&week_offset=0`)
        .then(response => response.json())
        .then(data => {
          const projects = new Set(data.projects); // Using Set to store unique projects
          projects.forEach(project => {
            const option = document.createElement("option");
            option.value = project;
            option.textContent = project;
            projectDropdown.appendChild(option);
          });
        })
        .catch(error => console.error('Error fetching projects:', error));
    }

    // Update categories based on selected project
    projectDropdown.addEventListener("change", function () {
      const projectName = projectDropdown.value;
      if (projectName) {
        updateCategories(projectName);
      }
    });

    // Fetch categories for the selected project
    function updateCategories(projectName) {
      categoryDropdown.innerHTML = '<option value="">Select Category</option>'; // Reset category dropdown

      fetch(`/get_project_data/?project_name=${projectName}&week_offset=0`)
        .then(response => response.json())
        .then(data => {
          const categories = new Set(data.categories); // Using Set to store unique categories
          categories.forEach(category => {
            const option = document.createElement("option");
            option.value = category;
            option.textContent = category;
            categoryDropdown.appendChild(option);
          });
        })
        .catch(error => console.error('Error fetching categories:', error));
    }

    // Update the week dropdown
    function updateWeeks() {
      weekDropdown.innerHTML = ''; // Clear previous options

      fetch(`/get_project_data/?department=&project_name=&category=&week_offset=0`)
        .then(response => response.json())
        .then(data => {
          const weeks = data.weeks;
          weeks.forEach(week => {
            const option = document.createElement("option");
            option.value = week.value;
            option.textContent = week.label;
            weekDropdown.appendChild(option);
          });
        })
        .catch(error => console.error('Error fetching weeks:', error));
        
    }

    // Fetch project data based on selected filters
    function fetchProjectData() {
      const department = departmentDropdown.value;
      const projectName = projectDropdown.value;
      const category = categoryDropdown.value;
      const weekOffset = weekDropdown.value;

      const apiUrl = `/get_project_data/?department=${department}&project_name=${projectName}&category=${category}&week_offset=${weekOffset}`;

      fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
          projectDataContainer.innerHTML = ''; // Clear previous data

          data.project_data.forEach(item => {
            const projectItem = document.createElement('div');
            projectItem.classList.add('project-item');
            projectItem.innerHTML = `
              <p><strong>Project:</strong> ${item.projects}</p>
              <p><strong>Category:</strong> ${item.category}</p>
              <p><strong>Date:</strong> ${item.date1}</p>
              <p><strong>Time:</strong> ${item.time}</p>
            `;
            projectDataContainer.appendChild(projectItem);
          });
        })
        .catch(error => console.error('Error fetching project data:', error));
        console.log("API URL: ", apiUrl);
    }

    // Event listeners for dropdown changes
    document.getElementById('departmentDropdown').addEventListener('change', (event) => {
      const department = event.target.value;
      updateProjects(department);
      fetchProjectData(); // Fetch data after department selection
    });

    document.getElementById('projectDropdown').addEventListener('change', (event) => {
      const projectName = event.target.value;
      updateCategories(projectName);
      fetchProjectData(); // Fetch data after project selection
    });

    document.getElementById('categoryDropdown').addEventListener('change', fetchProjectData);
    document.getElementById('weekDropdown').addEventListener('change', fetchProjectData);

    // Initial population of the dropdowns
    updateWeeks(); // Populate the weeks dropdown

    // Fetch available departments on page load
    fetch('/get_project_data/?department=&project_name=&category=&week_offset=0')
      .then(response => response.json())
      .then(data => {
        const departmentDropdown = document.getElementById('departmentDropdown');
        const departments = new Set(data.departments); // Using Set to store unique departments
        departments.forEach(department => {
          const option = document.createElement('option');
          option.value = department;
          option.textContent = department;
          departmentDropdown.appendChild(option);
        });
      })
      .catch(error => console.error('Error fetching departments:', error));
});
