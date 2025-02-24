function openCreateProjectPopup() {
    document.getElementById("createProjectModal").style.display = "flex";
}

function closeCreateProjectPopup() {
    document.getElementById("createProjectModal").style.display = "none";
}

// ✅ Ensure JavaScript runs only after DOM is fully loaded
document.addEventListener("DOMContentLoaded", function () {
    let submitButton = document.querySelector(".submit-btn");

    if (submitButton) {
        submitButton.addEventListener("click", function (event) {
            event.preventDefault();

            // ✅ Get form inputs
            let projectName = document.getElementById("projectName").value.trim();
            let startDate = document.getElementById("startDate").value;
            let endDate = document.getElementById("endDate").value;
            let scope = document.getElementById("scope").value.trim();
            let category = document.getElementById("category").value.trim();
            let benchmark = document.getElementById("Benchmark").value.trim();

            // ✅ Ensure fields are filled
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
                    document.getElementById("projectForm").reset(); // ✅ Clear the form
                    closeCreateProjectPopup();
                    location.reload();
                } else {
                    alert("Error: " + (data.error || "Unknown error"));
                }
            })
            .catch(error => {
                console.error("Submission Error:", error);
                alert("An error occurred. Please check your internet connection or try again.");
            })
            .finally(() => {
                submitButton.disabled = false;
                submitButton.textContent = "Submit";
            });
        });
    }
});

// ✅ Fix `handleTaskAction` function
function handleTaskAction(action, projectName) {
    fetch('/task_action/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCsrfToken()
        },
        body: JSON.stringify({
            task_data: { name: projectName },
            action: action
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert(`Task has been ${action}ed.`);
            location.reload();
        } else {
            alert('Error: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

// ✅ Fix CSRF Token Retrieval
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
