
// Download Excel using Python backend
document.addEventListener('DOMContentLoaded', function() {
    const downloadAllExcelBtn = document.getElementById('downloadAllExcel');
    if (downloadAllExcelBtn) {
        downloadAllExcelBtn.addEventListener('click', function() {
            window.location.href = '/export-excel/';
        });
    }
    const downloadSelectedExcelBtn = document.getElementById('downloadSelectedExcel');
    if (downloadSelectedExcelBtn) {
        downloadSelectedExcelBtn.addEventListener('click', function() {
            const projectDropdown = document.getElementById('projectDropdown');
            const selectedProject = projectDropdown.value;
            if (!selectedProject) return;
            // URL encode project name for safety
            const url = '/export-excel/?project=' + encodeURIComponent(selectedProject);
            window.location.href = url;
        });
    }
});
// Download only the selected project and its weeks as a single PDF
document.addEventListener('DOMContentLoaded', function() {
    const downloadSelectedBtn = document.getElementById('downloadSelectedPDF');
    if (!downloadSelectedBtn) return;
    downloadSelectedBtn.addEventListener('click', async function() {
        if (!window.jspdf || !window.jspdf.jsPDF) return;
        if (!window.html2canvas) return;
        const projectDropdown = document.getElementById('projectDropdown');
        const selectedProject = projectDropdown.value;
        if (!selectedProject) return;
        // Ensure the correct project is selected and view is updated
        projectDropdown.value = selectedProject;
        projectDropdown.dispatchEvent(new Event('change'));
        await new Promise(r => setTimeout(r, 500));
        const mainPage = document.getElementById('monthlyOverview');
        let pdf = null;
        if (mainPage) {
            await html2canvas(mainPage).then(canvas => {
                const imgData = canvas.toDataURL('image/png');
                pdf = new window.jspdf.jsPDF('p', 'pt', 'a4');
                const width = pdf.internal.pageSize.getWidth();
                const height = (canvas.height * width) / canvas.width;
                pdf.addImage(imgData, 'PNG', 0, 0, width, height);
            });
        }
        // Add each week as a new page in the same PDF
        const weekTabs = Array.from(document.querySelectorAll('.sheet-tabs li')).slice(1);
        for (const li of weekTabs) {
            li.click();
            await new Promise(r => setTimeout(r, 500));
            const tabId = li.getAttribute('data-tab');
            const weekDiv = document.getElementById(tabId);
            if (weekDiv && pdf) {
                await html2canvas(weekDiv).then(canvas => {
                    pdf.addPage();
                    const width = pdf.internal.pageSize.getWidth();
                    const height = (canvas.height * width) / canvas.width;
                    const imgData = canvas.toDataURL('image/png');
                    pdf.addImage(imgData, 'PNG', 0, 0, width, height);
                });
            }
        }
        if (pdf) {
            pdf.save(`${selectedProject}.pdf`);
        }
    });
});
// PDF Download logic
document.addEventListener('DOMContentLoaded', function() {
    const downloadBtn = document.getElementById('downloadAllPDFs');
    if (!downloadBtn) {
        return;
    }
    downloadBtn.addEventListener('click', async function() {
        if (!window.jspdf || !window.jspdf.jsPDF) return;
        if (!window.html2canvas) return;
        if (!window._trackerProjectData) return;
        const prevMonthRows = window._trackerProjectData;
        const uniqueProjects = [...new Set(prevMonthRows.map(row => row.projects).filter(Boolean))];
        for (const project of uniqueProjects) {
            document.getElementById('projectDropdown').value = project;
            document.getElementById('projectDropdown').dispatchEvent(new Event('change'));
            await new Promise(r => setTimeout(r, 500));
            const mainPage = document.getElementById('monthlyOverview');
            let pdf = null;
            if (mainPage) {
                await html2canvas(mainPage).then(canvas => {
                    const imgData = canvas.toDataURL('image/png');
                    pdf = new window.jspdf.jsPDF('p', 'pt', 'a4');
                    const width = pdf.internal.pageSize.getWidth();
                    const height = (canvas.height * width) / canvas.width;
                    pdf.addImage(imgData, 'PNG', 0, 0, width, height);
                });
            }
            // Add each week as a new page in the same PDF
            const weekTabs = Array.from(document.querySelectorAll('.sheet-tabs li')).slice(1);
            for (const li of weekTabs) {
                li.click();
                await new Promise(r => setTimeout(r, 500));
                const tabId = li.getAttribute('data-tab');
                const weekDiv = document.getElementById(tabId);
                if (weekDiv && pdf) {
                    await html2canvas(weekDiv).then(canvas => {
                        pdf.addPage();
                        const width = pdf.internal.pageSize.getWidth();
                        const height = (canvas.height * width) / canvas.width;
                        const imgData = canvas.toDataURL('image/png');
                        pdf.addImage(imgData, 'PNG', 0, 0, width, height);
                    });
                }
            }
            // Save only once after all pages are added
            if (pdf) {
                pdf.save(`${project}.pdf`);
            }
        }
        document.getElementById('projectDropdown').selectedIndex = 0;
        document.getElementById('projectDropdown').dispatchEvent(new Event('change'));
    });
});

document.addEventListener('DOMContentLoaded', function () {
    const sheetTabs = document.querySelector('.sheet-tabs');
    const projectDropdown = document.getElementById('projectDropdown');
    const monthlyOverview = document.getElementById('monthlyOverview');
    // Remove all week tabs and week content initially
    Array.from(sheetTabs.querySelectorAll('li')).forEach((li, idx) => { if (idx > 0) li.remove(); });
    Array.from(document.querySelectorAll('.tab-content')).forEach(el => el.remove());
    monthlyOverview.style.display = 'none';

    // Helper to create week tab and content
    function createWeekTab(weekLabel, weekId, weekContentHtml) {
        const li = document.createElement('li');
        li.setAttribute('data-tab', weekId);
        li.textContent = weekLabel;
        sheetTabs.appendChild(li);

        const div = document.createElement('div');
        div.className = 'tab-content';
        div.id = weekId;
        div.innerHTML = weekContentHtml;
        document.querySelector('.tabs-container').appendChild(div);
    }

    // Listen for AJAX data ready event
    document.addEventListener('trackerProjectDataReady', function(e) {
        const prevMonthRows = e.detail.prevMonthRows;
        window._trackerProjectData = prevMonthRows; // For PDF download logic
        const uniqueProjects = [...new Set(prevMonthRows.map(row => row.projects).filter(Boolean))];
        projectDropdown.innerHTML = '<option value="" disabled selected>Select Project</option>';
        uniqueProjects.forEach(project => {
            const opt = document.createElement('option');
            opt.value = project;
            opt.textContent = project;
            projectDropdown.appendChild(opt);
        });

        // On project select, show week tabs for that project, but keep monthlyOverview visible
        projectDropdown.addEventListener('change', function() {
            // Always reset to monthly overview when project is (re)selected
            Array.from(sheetTabs.querySelectorAll('li')).forEach((li, idx) => { if (idx > 0) li.remove(); });
            Array.from(document.querySelectorAll('.tab-content')).forEach(el => el.remove());
            monthlyOverview.style.display = 'block';
            // Hide all week content
            Array.from(document.querySelectorAll('.tab-content')).forEach(el => el.style.display = 'none');
            // Remove active state from all week tabs
            Array.from(sheetTabs.querySelectorAll('li')).forEach(t => t.classList.remove('active'));

            // Ensure Chart.js is loaded (add CDN if not present)
            if (!window.Chart) {
                const script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
                script.onload = () => {};
                document.head.appendChild(script);
            }

            const selectedProject = this.value;
            // Find all weeks for this project (group by week-of-month: 1-7, 8-14, ...)
            const projectRows = prevMonthRows.filter(row => row.projects === selectedProject);
            // Group by week-of-month
            const weekMap = {};
            projectRows.forEach(row => {
                if (row.date1) {
                    const d = new Date(row.date1);
                    const day = d.getDate();
                    // Week 1: 1-7, Week 2: 8-14, Week 3: 15-21, Week 4: 22-28, Week 5: 29-end
                    let weekNum = 1;
                    if (day >= 1 && day <= 7) weekNum = 1;
                    else if (day >= 8 && day <= 14) weekNum = 2;
                    else if (day >= 15 && day <= 21) weekNum = 3;
                    else if (day >= 22 && day <= 28) weekNum = 4;
                    else weekNum = 5;
                    if (!weekMap[weekNum]) weekMap[weekNum] = [];
                    weekMap[weekNum].push(row);
                }
            });
            // Only show week numbers 1-5
            const weekNums = Object.keys(weekMap)
                .map(Number)
                .filter(weekNum => weekNum >= 1 && weekNum <= 5)
                .sort((a, b) => a - b);
            weekNums.forEach((weekNum, idx) => {
                const weekLabel = `WEEK ${weekNum}`;
                const weekId = `sheet_week_${weekNum}`;
                // Add a canvas for the chart
                const chartCanvasId = `chart_${weekId}`;
                const weekContentHtml = `
<link rel="stylesheet" href="/static/css/report.css">
<div class="weekly-overview">
  <div class="overview-header">
    <div class="header-left">
      <table class="project-table">
        <tr>
        <td colspan="2"><strong>WEEKLY OVERVIEW WEEK ${weekNum}</strong></td>
        </tr>
        <tr><td><strong>PROJECT</strong></td><td><input type="text" value="${selectedProject}" readonly /></td></tr>
        <tr><td><strong>WEEK start date</strong></td><td><input type="text" value="${weekNum}" readonly /></td></tr>
        <tr><td><strong>WEEK end date</strong></td><td><input type="text" value="${weekNum}" readonly /></td></tr>
      </table>
    </div>
    <div class="header-right">
      <img src="/static/images/logo.png" alt="Logo" class="header-logo" />
    </div>
  </div>

  <table class="main-table weekly-sheet">
    <thead>
      <tr>
        <th>DWG NO</th>
        <th>SCOPE</th>
        <th>STATUS</th>
        <th>START DATE</th>
        <th>END DATE</th>
        <th>REVISION</th>
        <th>HOURS</th>
      </tr>
    </thead>
    <tbody>
    ${(weekMap[String(weekNum)] || []).slice(0, 6).map(row => `
        <tr>
       <td class="row-label">PROJECT PART:</td>
        <td>${row.scope || ''}</td>
        <td class="status-completed">COMPLETED</td>
        <td>${row.start || ''}</td>
        <td>${row.end || ''}</td>
        <td>${row.rev || ''}</td>
        <td>${row.time || ''}</td>
        </tr>
        <tr>
          <td>${row.d_no || ''}</td>
          <td colspan="6">${row.title || ''}</td>
        </tr>
        <tr>
        <td class="row-label">PHASE:</td>
        <td colspan="6">${row.category || ''}</td>
        </tr>
        <tr>
        <td class="row-label">DONE BY:</td>
        <td colspan="6">${row.assigned || ''}</td>
        </tr>
        <tr>
        <td class="row-label">DESCRIPTION OF WORK:</td>
        <td colspan="6" class="multiline-cell">${(row.comments || '').replace(/\n/g, '<br>')}</td>
        </tr>
        <tr class="group-separator"><td colspan="7"></td></tr>
    `).join('')}
    </tbody>

  </table>

  ${weekId === 'project-overview' ? `
  <canvas id="chart_${weekId}" width="400" height="120" style="margin-top: 16px;"></canvas>
` : ''}

</div>
`;

                createWeekTab(weekLabel, weekId, weekContentHtml);

                // Draw the chart after the tab is created
                setTimeout(() => {
                  if (!window.Chart) return; // Chart.js not loaded yet
                  const ctx = document.getElementById(chartCanvasId).getContext('2d');
                  const weekRows = weekMap[String(weekNum)] || [];
                  const labels = weekRows.map(row => row.scope || row.d_no || '');
                  const data = weekRows.map(row => Number(row.time) || 0);
                  new Chart(ctx, {
                    type: 'bar',
                    data: {
                      labels: labels,
                      datasets: [{
                        label: 'Hours',
                        data: data,
                        backgroundColor: 'rgba(54, 162, 235, 0.5)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 1
                      }]
                    },
                    options: {
                      responsive: false,
                      plugins: { legend: { display: false } },
                      scales: {
                        y: { beginAtZero: true }
                      }
                    }
                  });
                }, 300);
            });

            // --- Add PROJECT OVERVIEW tab/button at the end ---
            const overviewTabId = 'project_overview_tab';
            const overviewLi = document.createElement('li');
            overviewLi.setAttribute('data-tab', overviewTabId);
            overviewLi.textContent = 'PROJECT OVERVIEW';
            sheetTabs.appendChild(overviewLi);


            // --- Build summary table for all projects/tasks for the previous month ---
            // Group by PROJECT PART (list) and TASK (scope)
            const summaryMap = {};
            const selectedProjectRows = prevMonthRows.filter(row => row.projects === selectedProject);
            selectedProjectRows.forEach(row => {
            const projectPart = row.scope || '';
            const task = row.title || '';
                const approvedHours = row.task_benchmark || '';
                const key = projectPart + '||' + task;
                if (!summaryMap[key]) {
                    summaryMap[key] = {
                        projectPart,
                        task,
                        approvedHours, // fallback if available
                        hoursSpentThisMonth: 0,
                        hoursPrior: 0,
                        totalHoursToDate: 0,
                        totalHoursRemaining: 0,
                        extraHoursWorked: 0,
                        percentBudget: 0
                    };
                }
                // For this month, sum time
                summaryMap[key].hoursSpentThisMonth += Number(row.time) || 0;
                // If you have prior month data, you can add here (not available in prevMonthRows)
                // For now, hoursPrior = 0
                // For approved hours, try to get from row or leave as 0
                if (row.approved_hours_per_po) summaryMap[key].approvedHours = Number(row.approved_hours_per_po);
            });
            // Calculate totals and derived columns
            Object.values(summaryMap).forEach(item => {
                item.totalHoursToDate = item.hoursSpentThisMonth + item.hoursPrior;
                item.totalHoursRemaining = Math.max(0, item.approvedHours - item.totalHoursToDate);
                item.extraHoursWorked = Math.max(0, item.totalHoursToDate - item.approvedHours);
                item.percentBudget = item.approvedHours > 0 ? ((item.totalHoursToDate / item.approvedHours) * 100).toFixed(2) + '%' : '';
            });
            // Build summary table HTML with required columns
            const summaryTableHtml = `
                <table class="main-table">
                  <thead>
                    <tr>
                      <th>PROJECT PART</th>
                      <th>TASK</th>
                      <th>APPROVED HOURS PER PO</th>
                      <th>HOURS SPENT THIS MONTH</th>
                      <th>HOURS PRIOR TO THIS MONTH</th>
                      <th>TOTAL HOURS SPENT TO DATE</th>
                      <th>TOTAL HOURS REMAINING</th>
                      <th>EXTRA HOURS WORKED</th>
                      <th>% BUDGET PROGRESS</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${Object.values(summaryMap).map(item => `
                      <tr>
                        <td>${item.projectPart}</td>
                        <td>${item.task}</td>
                        <td>${item.approvedHours}</td>
                        <td>${item.hoursSpentThisMonth}</td>
                        <td>${item.hoursPrior}</td>
                        <td>${item.totalHoursToDate}</td>
                        <td>${item.totalHoursRemaining}</td>
                        <td>${item.extraHoursWorked}</td>
                        <td>${item.percentBudget}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
            `;
            // Bar chart: grouped bars for APPROVED HOURS PER PO and TOTAL HOURS SPENT TO DATE
            const summaryLabels = Object.values(summaryMap).map(item => `${item.task}\n${item.projectPart}`);
            const approvedData = Object.values(summaryMap).map(item => item.approvedHours);
            const spentData = Object.values(summaryMap).map(item => item.totalHoursToDate);
            const summaryChartId = 'project_overview_chart';
            const overviewContentHtml = `
    <div class="project-overview-section">
      <h2 style="margin-top:0">Project Overview (All Projects)</h2>
      ${summaryTableHtml}
      <canvas id="${summaryChartId}" width="900" height="260" style="margin-top:16px;"></canvas>
    </div>
`;
            createWeekTab('PROJECT OVERVIEW', overviewTabId, overviewContentHtml);

            // Draw the grouped bar chart after the tab is created
            setTimeout(() => {
                if (!window.Chart) return;
                const ctx = document.getElementById(summaryChartId).getContext('2d');
                new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: summaryLabels,
                        datasets: [
                            {
                                label: 'APPROVED HOURS PER PO',
                                data: approvedData,
                                backgroundColor: 'rgba(255, 99, 132, 0.7)',
                                borderColor: 'rgba(255, 99, 132, 1)',
                                borderWidth: 1
                            },
                            {
                                label: 'TOTAL HOURS SPENT TO DATE',
                                data: spentData,
                                backgroundColor: 'rgba(54, 162, 235, 0.7)',
                                borderColor: 'rgba(54, 162, 235, 1)',
                                borderWidth: 1
                            }
                        ]
                    },
                    options: {
                        responsive: false,
                        plugins: {
                            legend: { display: true },
                            title: {
                                display: true,
                                text: 'BUDGET OVERVIEW',
                                font: { size: 18, weight: 'bold' },
                                padding: { top: 10, bottom: 10 }
                            }
                        },
                        scales: {
                            x: {
                                title: { display: true, text: 'Tasks', font: { weight: 'bold' } },
                                stacked: false,
                                ticks: { font: { size: 12 } }
                            },
                            y: {
                                title: { display: true, text: 'Hours', font: { weight: 'bold' } },
                                beginAtZero: true,
                                stacked: false
                            }
                        }
                    }
                });
            }, 300);

            // Add click handlers for new week tabs and overview tab
            Array.from(sheetTabs.querySelectorAll('li')).forEach((li, idx) => {
                if (idx === 0) return; // skip project dropdown
                li.addEventListener('click', function() {
                    // Hide monthlyOverview when a week tab or overview is clicked
                    monthlyOverview.style.display = 'none';
                    Array.from(sheetTabs.querySelectorAll('li')).forEach(t => t.classList.remove('active'));
                    li.classList.add('active');
                    Array.from(document.querySelectorAll('.tab-content')).forEach(content => {
                        if (content.id === li.getAttribute('data-tab')) {
                            content.classList.add('active');
                            content.style.display = 'block';
                        } else {
                            content.classList.remove('active');
                            content.style.display = 'none';
                        }
                    });
                });
            });
        });
    });

    // Helper: ISO week number
    function getISOWeek(date) {
        const target = new Date(date.valueOf());
        const dayNr = (date.getDay() + 6) % 7;
        target.setDate(target.getDate() - dayNr + 3);
        const firstThursday = target.valueOf();
        target.setMonth(0, 1);
        if (target.getDay() !== 4) {
            target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
        }
        return 1 + Math.ceil((firstThursday - target) / 604800000);
    }

    // Only show monthlyOverview at first
    monthlyOverview.style.display = 'block';
});

// Fetch tracker_project_data via AJAX from /report-view/ endpoint
document.addEventListener('DOMContentLoaded', function() {
    fetch('/report-view/', {
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    .then(response => response.json())
    .then(data => {
        const tracker_project_data = data.tracker_project_data || [];
        console.log('All tracker_project_data:', tracker_project_data);

        // Get today's date
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth() + 1; // Months are 0-based, so add 1
        const currentDate = today.getDate();
        console.log('Current Year:', currentYear);
        console.log('Current Month:', currentMonth);
        console.log('Current Date:', currentDate);

        // Get previous month and year
        let prevMonth = today.getMonth(); // 0-based, so this is current month
        let prevYear = today.getFullYear();
        if (prevMonth === 0) {
            prevMonth = 12;
            prevYear -= 1;
        }

        // Filter rows where date1 is in previous month
        const prevMonthRows = tracker_project_data.filter(row => {
            if (!row.date1) return false;
            const d = new Date(row.date1);
            return (d.getFullYear() === prevYear && (d.getMonth() + 1) === prevMonth);
        });
        console.log('Rows from previous month:', prevMonthRows);
        // Dispatch a custom event so the template can populate the dropdown
        const event = new CustomEvent('trackerProjectDataReady', { detail: { prevMonthRows } });
        document.dispatchEvent(event);
    })
    .catch(err => {
        console.error('Error fetching tracker_project_data:', err);
    });
});
