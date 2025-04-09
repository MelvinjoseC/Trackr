const calendar = document.getElementById("calendar");
const monthYear = document.getElementById("month-year");
const select = document.getElementById("employee-select");
const totalDisplay = document.getElementById("total-worktime-display");
const detailsDisplay = document.getElementById("attendance-details");  // Added this line
let current = new Date();

function convertSecondsToTime(seconds) {
  const hours = Math.floor(seconds / 3600); // Get full hours
  const minutes = Math.floor((seconds % 3600) / 60); // Get full minutes
  const remainingSeconds = Math.floor(seconds % 60); // Get remaining seconds

  // Format to hh:mm:ss with leading zeros for single digits
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}


// Function to handle date click in the calendar
function handleDateClick(dateStr, employeeId) {
  if (!employeeId) {
    alert("Please select an employee first.");
    return;
  }

  fetch(`/attendance/get-attendance-details/?employee_id=${employeeId}&date=${dateStr}`)
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        alert(data.error);  // Handle error, e.g., "No attendance found for this date"
        return;
      }

      const attendanceDetails = data.attendance;
      detailsDisplay.innerHTML = `
        <p><strong>ATTENDACE DETAILS</strong></p>
        <hr>
        <p><strong>Punch In:</strong> ${attendanceDetails.punch_in}</p>
        <p><strong>Punch Out:</strong> ${attendanceDetails.punch_out}</p>
        <p><strong>Break Time:</strong> ${convertSecondsToTime(attendanceDetails.break_time)} </p>  <!-- Convert seconds to hh:mm:ss -->
        <p><strong>Worktime:</strong> ${attendanceDetails.worktime} hrs</p>
      `;
    })
    .catch(err => {
      console.error("Error fetching attendance details:", err);
      alert("Failed to fetch attendance details.");
    });
}

// Function to update the calendar view
function updateCalendar(datesWithWorktime = {}, employeeId) {
  calendar.innerHTML = "";

  const year = current.getFullYear();
  const month = current.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDay = firstDay.getDay();

  monthYear.textContent = current.toLocaleString('default', { month: 'long', year: 'numeric' });

  for (let i = 0; i < startDay; i++) {
    const empty = document.createElement("div");
    calendar.appendChild(empty);
  }

  for (let day = 1; day <= lastDay.getDate(); day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const div = document.createElement("div");
    div.className = "day";
    div.innerHTML = `<div class="date">${day}</div>`;

    if (datesWithWorktime[dateStr]) {
      div.innerHTML += `<div class="worktime">${datesWithWorktime[dateStr]} hrs</div>`;
    }

    // Add event listener for the click event on each date
    div.addEventListener("click", () => handleDateClick(dateStr, employeeId));

    calendar.appendChild(div);
  }
}

// Function to fetch and display worktime for the selected employee
function fetchWorktimeForSelectedEmployee(empId) {
  const month = current.getMonth() + 1;
  const year = current.getFullYear();

  fetch(`/attendance/get-user-worktime/?employee_id=${empId}`)
    .then(res => res.json())
    .then(data => {
      const datesWithWorktime = {};
      let total = 0;

      data.worktime.forEach(entry => {
        const d = new Date(entry.date);
        if (d.getMonth() + 1 === month && d.getFullYear() === year) {
          const daily = parseFloat(entry.daily_worktime) || 0;
          datesWithWorktime[entry.date] = daily;
          total += daily;
        }
      });

      totalDisplay.textContent = `Total Worktime: ${total.toFixed(2)} hrs`;
      updateCalendar(datesWithWorktime, empId); // Update the calendar with worktime data
    })
    .catch(err => console.error('Error fetching worktime:', err));
}

// Handle previous month button click
document.getElementById("prev-month").onclick = () => {
  current.setMonth(current.getMonth() - 1); // Decrement the current month
  const empId = select.value; // Get the selected employee ID
  if (empId) {
    fetchWorktimeForSelectedEmployee(empId); // Fetch worktime data when employee is selected
  } else {
    updateCalendar(); // Update the calendar with no worktime data when no employee is selected
  }
};

// Handle next month button click
document.getElementById("next-month").onclick = () => {
  current.setMonth(current.getMonth() + 1); // Increment the current month
  const empId = select.value; // Get the selected employee ID
  if (empId) {
    fetchWorktimeForSelectedEmployee(empId); // Fetch worktime data when employee is selected
  } else {
    updateCalendar(); // Update the calendar with no worktime data when no employee is selected
  }
};

// Fetch employee list and populate dropdown
fetch("/attendance/get-users/")
  .then(res => res.json())
  .then(data => {
    data.employees.forEach(emp => {
      const option = document.createElement("option");
      option.value = emp.id;
      option.textContent = emp.name;
      select.appendChild(option);
    });
  });

// Handle employee selection
select.addEventListener("change", () => {
  const empId = select.value;
  if (empId) {
    fetchWorktimeForSelectedEmployee(empId); // Fetch worktime for the selected employee
  } else {
    updateCalendar(); // Update the calendar with no worktime data if no employee is selected
    totalDisplay.textContent = "";
    detailsDisplay.innerHTML = ""; // Clear details when no employee is selected
  }
});

// Initialize the calendar on page load
updateCalendar();

// Toggle between forms
document.addEventListener("DOMContentLoaded", function () {
  const formContainer = document.getElementById("project-form-container");
  const analysisContainer = document.getElementById("monthly-analysis");
  const toggleButton = document.getElementById("toggle-btn");
  const backButton = document.getElementById("back-btn");

  // Show Monthly Analysis
  toggleButton.addEventListener("click", function () {
    formContainer.style.display = "none";
    analysisContainer.style.display = "block";
    toggleButton.style.display = "none"; // hide main button
  });

  // Go back to Form View
  backButton.addEventListener("click", function () {
    formContainer.style.display = "block";
    analysisContainer.style.display = "none";
    toggleButton.style.display = "inline-block"; // show main button again
  });
});
