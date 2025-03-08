console.log("semifinals.js loaded");

// Fetch First Round predictions to populate Semifinals matchups
document.addEventListener('DOMContentLoaded', () => {
    console.log("Fetching First Round data...");
    Promise.all([
        fetch('/get-firstround-east', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin'
        }),
        fetch('/get-firstround-west', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin'
        })
    ])
    .then(([eastResponse, westResponse]) => {
        if (!eastResponse.ok) throw new Error(`East response: ${eastResponse.status}`);
        if (!westResponse.ok) throw new Error(`West response: ${westResponse.status}`);
        return Promise.all([eastResponse.json(), westResponse.json()]);
    })
    .then(([eastData, westData]) => {
        console.log("First Round East data received:", eastData);
        console.log("First Round West data received:", westData);
        if (eastData.selections && westData.selections) {
            // Eastern Conference Semifinals
            // Matchup 1: Winner of East 1 vs Winner of East 3
            const eastMatchup1Teams = [eastData.selections[0], eastData.selections[2]];
            document.getElementById('eastMatchup1Teams').textContent = `${eastMatchup1Teams[0]} vs ${eastMatchup1Teams[1]}`;
            const eastMatchup1 = document.getElementById('eastMatchup1');
            eastMatchup1.innerHTML = '<option value="" disabled selected>Select Team</option>';
            eastMatchup1Teams.forEach(team => {
                let option = document.createElement('option');
                option.value = team;
                option.textContent = team;
                eastMatchup1.appendChild(option);
            });

            // Matchup 2: Winner of East 2 vs Winner of East 4
            const eastMatchup2Teams = [eastData.selections[1], eastData.selections[3]];
            document.getElementById('eastMatchup2Teams').textContent = `${eastMatchup2Teams[0]} vs ${eastMatchup2Teams[1]}`;
            const eastMatchup2 = document.getElementById('eastMatchup2');
            eastMatchup2.innerHTML = '<option value="" disabled selected>Select Team</option>';
            eastMatchup2Teams.forEach(team => {
                let option = document.createElement('option');
                option.value = team;
                option.textContent = team;
                eastMatchup2.appendChild(option);
            });

            // Western Conference Semifinals
            // Matchup 3: Winner of West 1 vs Winner of West 3
            const westMatchup1Teams = [westData.selections[0], westData.selections[2]];
            document.getElementById('westMatchup1Teams').textContent = `${westMatchup1Teams[0]} vs ${westMatchup1Teams[1]}`;
            const westMatchup1 = document.getElementById('westMatchup1');
            westMatchup1.innerHTML = '<option value="" disabled selected>Select Team</option>';
            westMatchup1Teams.forEach(team => {
                let option = document.createElement('option');
                option.value = team;
                option.textContent = team;
                westMatchup1.appendChild(option);
            });

            // Matchup 4: Winner of West 2 vs Winner of West 4
            const westMatchup2Teams = [westData.selections[1], westData.selections[3]];
            document.getElementById('westMatchup2Teams').textContent = `${westMatchup2Teams[0]} vs ${westMatchup2Teams[1]}`;
            const westMatchup2 = document.getElementById('westMatchup2');
            westMatchup2.innerHTML = '<option value="" disabled selected>Select Team</option>';
            westMatchup2Teams.forEach(team => {
                let option = document.createElement('option');
                option.value = team;
                option.textContent = team;
                westMatchup2.appendChild(option);
            });
        } else {
            console.error("First Round data incomplete:", { eastData, westData });
            alert("Please complete the First Round steps first.");
            window.location.href = "/firstround_east.html";
        }
    })
    .catch(error => {
        console.error('Error fetching First Round data:', error.message);
        alert("An error occurred while loading the page: " + error.message + ". Please complete the First Round steps first.");
        window.location.href = "/firstround_east.html";
    });
});

function submitSemifinals() {
    const selections = [
        document.getElementById('eastMatchup1').value,
        document.getElementById('eastMatchup2').value,
        document.getElementById('westMatchup1').value,
        document.getElementById('westMatchup2').value
    ];

    console.log("Submitting Semifinals selections:", selections);

    if (selections.some(selection => !selection)) {
        alert("Please select a winner for each matchup.");
        return;
    }

    fetch('/submit-semifinals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ selections })
    })
    .then(response => {
        console.log('Submit Semifinals response status:', response.status);
        if (response.ok) {
            console.log("Semifinals predictions saved successfully");
            window.location.href = "/finals.html";
        } else {
            throw new Error('Failed to submit Semifinals predictions');
        }
    })
    .catch(error => {
        console.error('Error:', error.message);
        alert("An error occurred while submitting your predictions: " + error.message);
    });
}
