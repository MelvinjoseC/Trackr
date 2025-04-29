document.addEventListener("DOMContentLoaded", function() {
    const ctx = document.getElementById('teamBarChart').getContext('2d');

    if (!ctx) {
        console.error("Canvas not found!");
        return;
    }

    const teams = ["Team A", "Team B", "Team C","Team D", "Team E", "Team F"];
    const approvedHours = [120, 95, 150, 120, 95, 150];
    const totalWorktime = [140, 110, 160, 120, 95, 150];

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: teams,
            datasets: [
                {
                    label: 'Approved Project Hours',
                    data: approvedHours,
                    backgroundColor: '#F04693',
                    borderColor: '#F04693',
                    borderWidth: 1
                },
                {
                    label: 'Total Worktime',
                    data: totalWorktime,
                    backgroundColor: '#00B0F0',
                    borderColor: '#00B0F0',
                    borderWidth: 1
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
});