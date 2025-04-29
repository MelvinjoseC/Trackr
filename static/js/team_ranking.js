const form = document.getElementById('teamForm');
form.addEventListener('submit', async function(e) {
    e.preventDefault();
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    const response = await fetch('/add-team-ranking/', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    });

    if ((await response.json()).status === 'success') {
        alert('Team ranking added!');
        form.reset();
        loadTable();
    }
});

async function loadTable() {
    const res = await fetch('/get-team-rankings/');
    const data = await res.json();
    const tbody = document.querySelector('#rankingTable tbody');
    tbody.innerHTML = '';

    data.forEach(row => {
        // Check if the date is empty or undefined
        if (!row.date) {
            return; // Skip this row if date is empty or undefined
        }

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${row.team_name}</td>
            <td>${row.team_member}</td>
            <td>${row.date}</td>
            <td>${getStars(row.speed_of_execution)}</td>
            <td>${getStars(row.complaints_of_check_list)}</td>
            <td>${getStars(row.task_ownership)}</td>
            <td>${getStars(row.understanding_task)}</td>
            <td>${getStars(row.quality_of_work)}</td>
        `;
        tbody.appendChild(tr);
    });
}

function getStars(rating) {
    const filledStar = '<span style="color: orange;">★</span>';
    const emptyStar = '<span style="color: #ccc;">☆</span>';
    return filledStar.repeat(rating) + emptyStar.repeat(5 - rating);
}

document.addEventListener('DOMContentLoaded', loadTable);

document.addEventListener('DOMContentLoaded', function () {
    fetch('/get-team-names/')
        .then(res => res.json())
        .then(data => {
            const teamDropdown = document.getElementById('team_name_dropdown');
            const memberDropdown = document.getElementById('team_member_dropdown');

            const teamMap = {};

            // Group team members by team name
            data.forEach(item => {
                const team = item.team_name;
                const members = item.team_member.split(',').map(m => m.trim());

                if (!teamMap[team]) {
                    teamMap[team] = new Set();
                }
                members.forEach(m => teamMap[team].add(m));
            });

            // Populate team name dropdown
            Object.keys(teamMap).forEach(team => {
                const option = document.createElement('option');
                option.value = team;
                option.textContent = team;
                teamDropdown.appendChild(option);
            });

            // Handle member dropdown on team selection
            teamDropdown.addEventListener('change', function () {
                const selectedTeam = this.value;
                const members = Array.from(teamMap[selectedTeam] || []);
                memberDropdown.innerHTML = '<option value="">-- Select Member --</option>';

                members.forEach(member => {
                    const option = document.createElement('option');
                    option.value = member;
                    option.textContent = member;
                    memberDropdown.appendChild(option);
                });
            });
        });
});

document.addEventListener('DOMContentLoaded', () => {
    const starContainers = document.querySelectorAll('.star-rating');

    starContainers.forEach(container => {
        const name = container.getAttribute('data-name');
        for (let i = 1; i <= 5; i++) {
            const star = document.createElement('span');
            star.classList.add('star');
            star.innerHTML = '★';
            star.dataset.value = i;

            star.addEventListener('click', () => {
                container.dataset.selected = i;
                updateStars(container, i);
            });

            container.appendChild(star);
        }

        // Hidden input to carry star value for form submission
        const hiddenInput = document.createElement('input');
        hiddenInput.type = 'hidden';
        hiddenInput.name = name;
        container.appendChild(hiddenInput);
    });

    function updateStars(container, value) {
        const stars = container.querySelectorAll('.star');
        stars.forEach(star => {
            star.style.color = star.dataset.value <= value ? 'gold' : '#ccc';
        });
        container.querySelector('input[type="hidden"]').value = value;
    }
});

document.addEventListener('DOMContentLoaded', function () {
    const viewRankingButton = document.getElementById('viewRankingButton');
    const backToSearchButton = document.getElementById('backToSearch');
    const searchContainer = document.querySelector('.search-history');
    const rankDiv = document.getElementById('rank');

    viewRankingButton.addEventListener('click', function () {
        searchContainer.style.display = 'none';
        rankDiv.style.display = 'block';
    });

    backToSearchButton.addEventListener('click', function () {
        rankDiv.style.display = 'none';
        searchContainer.style.display = 'block';
    });
});

