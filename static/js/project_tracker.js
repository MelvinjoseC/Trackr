function handleTaskAction(action) {
    fetch('/task_action/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCsrfToken()
        },
        body: JSON.stringify({
            task_data: { 
                name: projectData.name  // Include project name to identify the task
            },
            action: action
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert(`Task has been ${action}ed.`);
            location.reload();  // Reload the page to reflect changes
        } else {
            alert('Error: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

// Function to get CSRF token from the cookies
function getCsrfToken() {
    let cookieValue = null;
    let cookies = document.cookie ? document.cookie.split('; ') : [];
    
    for (let i = 0; i < cookies.length; i++) {
        let cookie = cookies[i].split('=');
        if (cookie[0] === 'csrftoken') {
            cookieValue = decodeURIComponent(cookie[1]);
            break;
        }
    }
    return cookieValue;
}
