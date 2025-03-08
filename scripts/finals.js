console.log("finals.js loaded");

// Fetch Conference Finals predictions to populate Finals winner options
document.addEventListener('DOMContentLoaded', () => {
    console.log("Fetching Conference Finals data...");
    fetch('/get-conference-finals', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin'
    })
    .then(response => {
        console.log('Get Conference Finals response status:', response.status);
        if (!response.ok) throw new Error(`Conference Finals response: ${response.status}`);
        return response.json();
    })
    .then(data => {
        console.log("Conference Finals data received:", data);
        if (data.selections && data.selections.length === 2) {
            const winnerSelect = document.getElementById('winner');
            winnerSelect.innerHTML = '<option value="" disabled selected>Select Team</option>';
            const finalists = [data.selections[0], data.selections[1]];
            finalists.forEach(team => {
                if (team) {
                    let option = document.createElement('option');
                    option.value = team;
                    option.textContent = team;
                    winnerSelect.appendChild(option);
                }
            });

            // Populate MVP dropdown with placeholder players
            const mvpSelect = document.getElementById('mvp');
            mvpSelect.innerHTML = '<option value="" disabled selected>Select Player</option>';
            const playerMap = {
                'Boston Celtics': ['Jayson Tatum', 'Jaylen Brown', 'Derrick White'],
                'Denver Nuggets': ['Nikola Jokić', 'Jamal Murray', 'Aaron Gordon'],
                'Milwaukee Bucks': ['Giannis Antetokounmpo', 'Damian Lillard', 'Khris Middleton'],
                'LA Lakers': ['LeBron James', 'Anthony Davis', 'Austin Reaves']
                // Add more teams and players as needed
            };
            finalists.forEach(team => {
                if (playerMap[team]) {
                    playerMap[team].forEach(player => {
                        let option = document.createElement('option');
                        option.value = player;
                        option.textContent = player;
                        mvpSelect.appendChild(option);
                    });
                }
            });
        } else {
            console.error("Conference Finals data incomplete or missing:", data);
            alert("Please complete the Conference Finals step first.");
            window.location.href = "/conference_finals.html";
        }
    })
    .catch(error => {
        console.error('Error fetching Conference Finals data:', error.message);
        alert("An error occurred while loading the page: " + error.message + ". Please complete the Conference Finals step first.");
        window.location.href = "/conference_finals.html";
    });
});

function submitFinals() {
    const formData = {
        winner: document.getElementById('winner').value,
        series: document.getElementById('series').value,
        mvp: document.getElementById('mvp').value,
        team1Score: parseInt(document.getElementById('team1Score').value),
        team2Score: parseInt(document.getElementById('team2Score').value)
    };

    console.log("Submitting Finals data:", formData);

    if (!formData.winner || !formData.series || !formData.mvp || isNaN(formData.team1Score) || isNaN(formData.team2Score)) {
        alert("Please fill in all fields with valid values.");
        return;
    }
    if (formData.team1Score <= formData.team2Score) {
        alert("Winning team score must be greater than losing team score.");
        return;
    }

    fetch('/submit-finals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(formData)
    })
    .then(response => {
        console.log('Submit Finals response status:', response.status);
        if (response.ok) {
            console.log("Finals predictions saved successfully");
            window.location.href = "/summary.html";
        } else {
            return response.json().then(data => {
                throw new Error(data.error || 'Failed to submit Finals predictions');
            });
        }
    })
    .catch(error => {
        console.error('Error:', error.message);
        alert("An error occurred while submitting your predictions: " + error.message);
    });
}
