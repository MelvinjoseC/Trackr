document.addEventListener("DOMContentLoaded", function() {
    // const teamSelect = document.getElementById('teamSelect');
    const projectSelect = document.getElementById('projectSelect');
 
    let chartInstances = [];

    function chunkArray(array, size) {
        const result = [];
        for (let i = 0; i < array.length; i += size) {
            result.push(array.slice(i, i + size));
        }
        return result;
    }

    function destroyAllCharts() {
        chartInstances.forEach(chart => chart.destroy());
        chartInstances = [];
        const container = document.getElementById('teamBarChart');
        container.innerHTML = ''; // remove all canvases
    }

    function renderPaginatedCharts(labels, approved, worktime, xLabel) {
        destroyAllCharts();

        const labelChunks = chunkArray(labels, 10);
        const approvedChunks = chunkArray(approved, 10);
        const worktimeChunks = chunkArray(worktime, 10);

        const container = document.getElementById('teamBarChart');
        container.innerHTML = ''; // Ensure it's empty

        labelChunks.forEach((labelSet, index) => {
            const approvedSet = approvedChunks[index];
            const worktimeSet = worktimeChunks[index];

            // ✅ Pad with empty labels and 0s to ensure 10 bars per chart
            while (labelSet.length < 10) {
                labelSet.push('');
                approvedSet.push(0);
                worktimeSet.push(0);
            }

            const canvas = document.createElement('canvas');
            canvas.id = `chart-${index}`;
            canvas.style.marginBottom = "40px";
            container.appendChild(canvas);

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                console.error("Canvas context could not be found.");
                return;
            }

            const chart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labelSet,
                    datasets: [
                        {
                            label: 'APPROVED PROJECT HOURS',
                            data: approvedSet,
                            backgroundColor: '#87a7ffff',
                            borderColor: '#87a7ffff',
                            borderWidth: 2,
                            borderRadius: 10,
                        },
                        {
                            label: 'TOTAL WORKTIME',
                            data: worktimeSet,
                            backgroundColor: '#bfceffff',
                            borderColor: '#bfceffff',
                            borderWidth: 2,
                            borderRadius: 10,
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    hover: { mode: null },
                    plugins: {
                        legend: {
                            labels: {
                                color: '#000000', // Text color
                                font: {
                                    weight: 'bold', // Make it bold
                                    size: 16
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'HOURS',
                                color: '#000000',
                                font: {
                                    weight: 'bold',
                                    size: 16
                                }
                            },
                            ticks: {
                                color: '#000000',
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: xLabel,
                                color: '#000000',
                                font: {
                                    weight: 'bold',
                                    size: 16
                                }
                            },
                            ticks: {
                                color: '#000000',
                                callback: function (value) {
                                    const rawLabel = this.getLabelForValue(value);
                                    const label = typeof rawLabel === 'string' ? rawLabel : String(rawLabel || '');
                                    const chunkSize = 15;  // ⬅️ Max characters per line
                                    const chunks = [];

                                    for (let i = 0; i < label.length; i += chunkSize) {
                                        chunks.push(label.substring(i, i + chunkSize));
                                    }

                                    return chunks;
                                }

                            }
                        }

                    }
                }
            });

            chartInstances.push(chart);
        });
    }



    // Event listener to reload the page if the "Select Team" option is chosen
    projectSelect.addEventListener('change', function() {
        if (!projectSelect.value) {
            window.location.reload(); // Reload the page if "Select Team" is selected
        }
    });

 
    // Function to load projects based on selected team
    window.loadProjects = function () {
        fetch(`/get-projects/`)
            .then(response => response.json())
            .then(data => {
                const { projects, approvedHours, totalWorktime } = data;

                projectSelect.innerHTML = '<option value="">Select Project</option>';
                projects.forEach(project => {
                    const option = document.createElement("option");
                    option.value = project;
                    option.textContent = project;
                    projectSelect.appendChild(option);
                });

                // ✅ Apply Select2 enhancement
                $('#projectSelect').select2({
                    placeholder: "Select Project",
                    allowClear: true,
                    width: 'resolve'
                });

                projectSelect.disabled = false;

                // ✅ Render all projects into chart immediately
                renderPaginatedCharts(projects, approvedHours, totalWorktime, 'PROJECTS');
            })
            .catch(error => {
                console.error("Failed to fetch all projects:", error);
            });
    };


 
    // Function to load the project data and display it on the graph
    window.loadProjectData = function(project) {
        if (!project) return;
 
        fetch(`/get-project-data/${project}/`) // Fetch project data based on team and project
            .then(response => response.json())
            .then(data => {
                const approvedHours = data.approvedHours.map(value => value || 0);
                const totalWorktime = data.totalWorktime.map(value => value || 0);
                const projects = data.projects;
 
                // Destroy the previous chart before creating a new one
                destroyAllCharts();
 
                // Create a new chart with project data
                renderPaginatedCharts(projects, approvedHours, totalWorktime, 'PROJECTS');

            })
            .catch(error => {
                console.error("Failed to fetch project data:", error);
            });
    };
 
    // Function to load tasks based on selected project
    window.loadTasks = function () {
        const project = projectSelect.value;
        if (!project) return;

        fetch(`/get-task-datas/${project}/`)  // Adjust backend accordingly
            .then(response => response.json())
            .then(data => {
                const approvedHours = data.approvedHours.map(value => value || 0);
                const totalWorktime = data.totalWorktime.map(value => value || 0);
                const tasks = data.tasks;
                const userWorktimes = data.userWorktimes;
 
                // Destroy the previous chart before creating a new one
                destroyAllCharts();
 
                // Create a new chart with task data
                renderPaginatedCharts(tasks, approvedHours, totalWorktime, 'TASKS');

 
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
                 // Light green background
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
     // Light red background
        totalRow.style.fontWeight = 'bold';
 
        tbody.appendChild(totalRow);
 
        table.appendChild(thead);
        table.appendChild(tbody);
 
        tableContainer.appendChild(table);
    }

loadProjects();
});
