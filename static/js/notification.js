document.addEventListener("DOMContentLoaded", function() {
    fetch('/check_task_status/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
    })
    .then(response => response.json())
    .then(data => {
        let message = "No project status available.";
        let seenStatuses = new Set(JSON.parse(localStorage.getItem('seenStatuses')) || []);
        let content = "";
        
        if (data.projects && data.projects.length > 0) {
            content = data.projects.map(proj => {
                let statusText = `${proj.project}: ${proj.status}`;
                let style = seenStatuses.has(statusText) ? "color: green;" : "color: blue; font-weight: bold;";
                seenStatuses.add(statusText);
                return `<span style='${style}'>${statusText}</span>`;
            }).join("<br>");
            
            localStorage.setItem('seenStatuses', JSON.stringify([...seenStatuses]));
        }
        
        document.getElementById('taskStatus').innerHTML = content || message;
    })
    .catch(error => {
        document.getElementById('taskStatus').innerHTML = 'Error fetching task status: ' + error;
    });
});
