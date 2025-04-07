const calendar = document.getElementById("calendar");
const monthYear = document.getElementById("month-year");
const select = document.getElementById("employee-select");
const totalDisplay = document.getElementById("total-worktime-display");
let current = new Date();

function updateCalendar(datesWithWorktime = {}) {
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

    calendar.appendChild(div);
  }
}

document.getElementById("prev-month").onclick = () => {
  current.setMonth(current.getMonth() - 1);
  select.dispatchEvent(new Event("change"));
};

document.getElementById("next-month").onclick = () => {
  current.setMonth(current.getMonth() + 1);
  select.dispatchEvent(new Event("change"));
};

// Load employee list
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

// When employee is selected
select.addEventListener("change", () => {
  const empId = select.value;
  if (!empId) {
    updateCalendar();
    totalDisplay.textContent = "";
    return;
  }

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
    updateCalendar(datesWithWorktime);
  })
  .catch(err => console.error('Error fetching worktime:', err));

});

updateCalendar();

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
  


