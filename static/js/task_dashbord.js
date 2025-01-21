function updateClock() {
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const date = now.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

    document.getElementById('current-time').textContent = time;
    document.getElementById('current-date').textContent = date;

    // Highlight the current day
    const dayIndex = now.getDay(); // 0 = Sunday, 6 = Saturday
    const days = document.querySelectorAll('.day');
    days.forEach((day, index) => {
        if (index === dayIndex - 1) { // Adjust for Monday start
            day.classList.add('active');
        } else {
            day.classList.remove('active');
        }
    });
}

setInterval(updateClock, 1000);
updateClock();

document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', function () {
        document.querySelector('.tab.active').classList.remove('active');
        this.classList.add('active');

        // Handle the content switching logic here
        const content = document.querySelector('.project-list');
        if (this.textContent === 'Running') {
            content.innerHTML = `
                <div class="project-item">RORO Bridge <span>DEME</span></div>
                <div class="project-item">PANAMA Chock Support <span>Value Maritime</span></div>
                <div class="project-item">JB-119 Boatlanding <span>CADELER</span></div>`;
        } else if (this.textContent === 'Revisions') {
            content.innerHTML = `<div class="project-item">Project X <span>Review</span></div>`;
        } else {
            content.innerHTML = `<div class="project-item">Project Y <span>Upcoming</span></div>`;
        }
    });
});

// Get the input and display elements
const dateInput = document.getElementById("date-input");
const selectedDate = document.getElementById("selected-date");

// Function to format the date
function formatDate(dateString) {
    const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", options);
}

// Set the initial value of the date input to today's date
const today = new Date().toISOString().split("T")[0]; // Format: YYYY-MM-DD
dateInput.value = today;
selectedDate.textContent = formatDate(today);

// Update the displayed date when the user changes the date
dateInput.addEventListener("change", (event) => {
    selectedDate.textContent = formatDate(event.target.value);
});

document.addEventListener("DOMContentLoaded", () => {
    const timeElements = document.querySelectorAll(".time-display");
    timeElements.forEach((element) => {
        const decimalTime = parseFloat(element.dataset.time);
        if (!isNaN(decimalTime)) {
            const hours = Math.floor(decimalTime);
            const minutes = Math.round((decimalTime - hours) * 60);
            element.textContent = `${hours}hr ${minutes}min`;
        } else {
            element.textContent = "Not Available";
        }
    });
});
