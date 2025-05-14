document.addEventListener("DOMContentLoaded", function() {
    const ctx = document.getElementById('teamBarChart').getContext('2d');
    const teamSelect = document.getElementById('teamSelect');
    const projectSelect = document.getElementById('projectSelect');

    let chartInstance;

    if (!ctx) {
        console.error("Canvas not found!");
        return;
    }

    // Fetch data and initialize the chart with all teams
    fetch('/get-team-chart-data/')
        .then(response => response.json())
        .then(data => {
            const teams = data.teams;
            const approvedHours = data.approvedHours.map(value => value || 0);
            const totalWorktime = data.totalWorktime.map(value => value || 0);

            // Populate Team dropdown
            teams.forEach(team => {
                const option = document.createElement("option");
                option.value = team;
                option.textContent = team;
                teamSelect.appendChild(option);
            });

            // Initialize the chart with all teams
            chartInstance = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: teams,
                    datasets: [
                        {
                            label: 'Approved Project Hours',
                            data: approvedHours,
                            backgroundColor: '#F04693',
                            borderColor: '#F04693',
                            borderWidth: 2,
                            borderRadius: 10,
                            color: '#000000',
                        },
                        {
                            label: 'Total Worktime',
                            data: totalWorktime,
                            backgroundColor: '#00B0F0',
                            borderColor: '#00B0F0',
                            borderWidth: 2,
                            borderRadius: 10,
                            color: '#000000',
                        }
                    ]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Hours'
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'Teams'
                            }
                        }
                    }
                }
            });
        })
        .catch(error => {
            console.error("Failed to fetch chart data:", error);
        });

    // Function to load projects based on selected team
    window.loadProjects = function() {
        const team = teamSelect.value;
        if (!team) return;

        fetch(`/get-projects/${team}/`)  // Fetch projects based on selected team
            .then(response => response.json())
            .then(data => {
                // Clear previous project options
                projectSelect.innerHTML = '<option value="">Select Project</option>';

                // Populate the project dropdown
                data.projects.forEach(project => {
                    const option = document.createElement("option");
                    option.value = project;
                    option.textContent = project;
                    projectSelect.appendChild(option);
                });

                projectSelect.disabled = false;
                loadProjectData(data.projects[0]);  // Optionally load the data for the first project
            })
            .catch(error => {
                console.error("Failed to fetch projects:", error);
            });
    };

    // Function to load the project data and display it on the graph
    window.loadProjectData = function(project) {
        const team = teamSelect.value;
        if (!team || !project) return;

        fetch(`/get-project-data/${team}/${project}/`) // Fetch project data based on team and project
            .then(response => response.json())
            .then(data => {
                const approvedHours = data.approvedHours.map(value => value || 0);
                const totalWorktime = data.totalWorktime.map(value => value || 0);
                const projects = data.projects;

                // Destroy the previous chart before creating a new one
                if (chartInstance) {
                    chartInstance.destroy();
                }

                // Create a new chart with project data
                chartInstance = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: projects,
                        datasets: [
                            {
                                label: 'Approved Project Hours',
                                data: approvedHours,
                                backgroundColor: '#F04693',
                                borderColor: '#F04693',
                                borderWidth: 2,
                                borderRadius: 10,
                                color: '#000000',
                            },
                            {
                                label: 'Total Worktime',
                                data: totalWorktime,
                                backgroundColor: '#00B0F0',
                                borderColor: '#00B0F0',
                                borderWidth: 2,
                                borderRadius: 10,
                                color: '#000000',
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        scales: {
                            y: {
                                beginAtZero: true,
                                title: {
                                    display: true,
                                    text: 'Hours'
                                }
                            },
                            x: {
                                title: {
                                    display: true,
                                    text: 'Projects'
                                }
                            }
                        }
                    }
                });
            })
            .catch(error => {
                console.error("Failed to fetch project data:", error);
            });
    };

// Function to load tasks based on selected project
window.loadTasks = function () {
    const team = teamSelect.value;
    const project = projectSelect.value;
    if (!team || !project) return;

    fetch(`/get-task-datas/${team}/${project}/`) // Fetch task data based on team and project
        .then(response => response.json())
        .then(data => {
            const approvedHours = data.approvedHours.map(value => value || 0);
            const totalWorktime = data.totalWorktime.map(value => value || 0);
            const tasks = data.tasks;
            const userWorktimes = data.userWorktimes;

            // Destroy the previous chart before creating a new one
            if (chartInstance) {
                chartInstance.destroy();
            }

            // Create a new chart with task data
            chartInstance = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: tasks,
                    datasets: [
                        {
                            label: 'Approved Project Hours',
                            data: approvedHours,
                            backgroundColor: '#F04693',
                            borderColor: '#F04693',
                            borderWidth: 2,
                            borderRadius: 10,
                            color: '#000000',
                        },
                        {
                            label: 'Total Worktime',
                            data: totalWorktime,
                            backgroundColor: '#00B0F0',
                            borderColor: '#00B0F0',
                            borderWidth: 2,
                            borderRadius: 10,
                            color: '#000000',
                        }
                    ]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Hours'
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'Tasks'
                            }
                        }
                    }
                }
            });

            // Call the function to render the table
            renderUserWorktimeTable(userWorktimes);
        })
        .catch(error => {
            console.error("Failed to fetch task data:", error);
        });
};

function renderUserWorktimeTable(userWorktimes) {
    const tableContainer = document.getElementById('user-worktime-table-container');
    tableContainer.innerHTML = ''; // Clear the previous table content

    if (!userWorktimes || Object.keys(userWorktimes).length === 0) {
        const message = document.createElement('p');
        message.textContent = "No worktime data available for the selected project.";
        message.style.color = "red";
        tableContainer.appendChild(message);
        return;
    }

    const table = document.createElement('table');
    table.classList.add('worktime-table');

    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    const headers = ['User Name', 'Total Worktime (Hours)'];

    headers.forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);

    const tbody = document.createElement('tbody');
    
    // Sort users by worktime in descending order
    const sortedUsers = Object.entries(userWorktimes)
        .sort(([, a], [, b]) => b - a);

    // Highlight the top performer and calculate the total worktime
    let totalWorktime = 0;

    sortedUsers.forEach(([username, worktime], index) => {
        const row = document.createElement('tr');

        const userCell = document.createElement('td');
        userCell.textContent = username;
        row.appendChild(userCell);

        const worktimeCell = document.createElement('td');
        worktimeCell.textContent = worktime;
        row.appendChild(worktimeCell);

        // Highlight the top performer
        if (index === 0) {
            row.style.backgroundColor = '#d4edda'; // Light green background
            row.style.fontWeight = 'bold';
        }

        tbody.appendChild(row);

        // Accumulate total worktime
        totalWorktime += parseFloat(worktime);
    });

    // Add the total worktime row at the bottom
    const totalRow = document.createElement('tr');
    const totalUserCell = document.createElement('td');
    totalUserCell.textContent = 'Total Project Worktime';
    totalUserCell.style.fontWeight = 'bold';

    const totalWorktimeCell = document.createElement('td');
    totalWorktimeCell.textContent = totalWorktime.toFixed(2); // Rounded to 2 decimal places
    totalWorktimeCell.style.fontWeight = 'bold';

    totalRow.appendChild(totalUserCell);
    totalRow.appendChild(totalWorktimeCell);

    // Apply a distinct style to the total row
    totalRow.style.backgroundColor = '#f8d7da'; // Light red background
    totalRow.style.fontWeight = 'bold';

    tbody.appendChild(totalRow);

    table.appendChild(thead);
    table.appendChild(tbody);

    tableContainer.appendChild(table);
}


});
