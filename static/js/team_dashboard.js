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
                        },
                        {
                            label: 'Total Worktime',
                            data: totalWorktime,
                            backgroundColor: '#00B0F0',
                            borderColor: '#00B0F0',
                            borderWidth: 2,
                            borderRadius: 10,
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
                            },
                            {
                                label: 'Total Worktime',
                                data: totalWorktime,
                                backgroundColor: '#00B0F0',
                                borderColor: '#00B0F0',
                                borderWidth: 2,
                                borderRadius: 10,
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
    window.loadTasks = function() {
        const team = teamSelect.value;
        const project = projectSelect.value;
        if (!team || !project) return;

        fetch(`/get-task-data/${team}/${project}/`) // Fetch task data based on team and project
            .then(response => response.json())
            .then(data => {
                const approvedHours = data.approvedHours.map(value => value || 0);
                const totalWorktime = data.totalWorktime.map(value => value || 0);
                const tasks = data.tasks;

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
                            },
                            {
                                label: 'Total Worktime',
                                data: totalWorktime,
                                backgroundColor: '#00B0F0',
                                borderColor: '#00B0F0',
                                borderWidth: 2,
                                borderRadius: 10,
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
            })
            .catch(error => {
                console.error("Failed to fetch task data:", error);
            });
    };
});
