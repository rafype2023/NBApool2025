console.log("conference_finals.js loaded");

// Fetch Semifinals predictions to populate Conference Finals matchups
document.addEventListener('DOMContentLoaded', () => {
    console.log("Fetching Semifinals data...");
    fetch('/get-semifinals', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin'
    })
    .then(response => {
        console.log('Get Semifinals response status:', response.status);
        if (!response.ok) throw new Error(`Semifinals response: ${response.status}`);
        return response.json();
    })
    .then(data => {
        console.log("Semifinals data received:", data);
        if (data.selections) {
            // Eastern Conference Finals: Winner of Semifinal 1 vs Winner of Semifinal 2
            const eastFinalTeams = [data.selections[0], data.selections[1]];
            document.getElementById('eastFinalTeams').textContent = `${eastFinalTeams[0]} vs ${eastFinalTeams[1]}`;
            const eastFinalWinner = document.getElementById('eastFinalWinner');
            eastFinalWinner.innerHTML = '<option value="" disabled selected>Select Team</option>';
            eastFinalTeams.forEach(team => {
                let option = document.createElement('option');
                option.value = team;
                option.textContent = team;
                eastFinalWinner.appendChild(option);
            });

            // Western Conference Finals: Winner of Semifinal 3 vs Winner of Semifinal 4
            const westFinalTeams = [data.selections[2], data.selections[3]];
            document.getElementById('westFinalTeams').textContent = `${westFinalTeams[0]} vs ${westFinalTeams[1]}`;
            const westFinalWinner = document.getElementById('westFinalWinner');
            westFinalWinner.innerHTML = '<option value="" disabled selected>Select Team</option>';
            westFinalTeams.forEach(team => {
                let option = document.createElement('option');
                option.value = team;
                option.textContent = team;
                westFinalWinner.appendChild(option);
            });
        } else {
            console.error("Semifinals data incomplete:", data);
            alert("Please complete the Semifinals step first.");
            window.location.href = "/semifinals.html";
        }
    })
    .catch(error => {
        console.error('Error fetching Semifinals data:', error.message);
        alert("An error occurred while loading the page: " + error.message + ". Please complete the Semifinals step first.");
        window.location.href = "/semifinals.html";
    });
});

function submitConferenceFinals() {
    const selections = [
        document.getElementById('eastFinalWinner').value,
        document.getElementById('westFinalWinner').value
    ];

    console.log("Submitting Conference Finals selections:", selections);

    if (selections.some(selection => !selection)) {
        alert("Please select a winner for each conference final.");
        return;
    }

    fetch('/submit-conference-finals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ selections })
    })
    .then(response => {
        console.log('Submit Conference Finals response status:', response.status);
        if (response.ok) {
            console.log("Conference Finals predictions saved successfully");
            window.location.href = "/finals.html";
        } else {
            throw new Error('Failed to submit Conference Finals predictions');
        }
    })
    .catch(error => {
        console.error('Error:', error.message);
        alert("An error occurred while submitting your predictions: " + error.message);
    });
}
