console.log("firstround_east.js loaded");

// Fetch Play-In predictions to populate 7th and 8th seeds
document.addEventListener('DOMContentLoaded', () => {
    console.log("Fetching Play-In data...");
    fetch('/get-playin', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'same-origin' // Ensure cookies are sent with the request
    })
    .then(response => {
        console.log('Get Play-In response status:', response.status);
        if (!response.ok) {
            return response.json().then(data => {
                throw new Error(data.error || 'Failed to fetch Play-In data');
            });
        }
        return response.json();
    })
    .then(data => {
        console.log("Play-In data received:", data);
        if (data.east7 && data.east8) {
            // Update display
            document.getElementById('east7').textContent = data.east7;
            document.getElementById('east8').textContent = data.east8;

            // Add 7th seed to Matchup 2 dropdown
            const matchup2 = document.getElementById('matchup2');
            const option7 = document.createElement('option');
            option7.value = data.east7;
            option7.textContent = data.east7;
            matchup2.appendChild(option7);

            // Add 8th seed to Matchup 1 dropdown
            const matchup1 = document.getElementById('matchup1');
            const option8 = document.createElement('option');
            option8.value = data.east8;
            option8.textContent = data.east8;
            matchup1.appendChild(option8);
        } else {
            console.error("Play-In data incomplete:", data);
            alert("Please complete the Play-In step first.");
            window.location.href = "/playin.html";
        }
    })
    .catch(error => {
        console.error('Error fetching Play-In data:', error.message);
        alert("An error occurred while loading the page: " + error.message + ". Please complete the Play-In step first.");
        window.location.href = "/playin.html";
    });
});

function submitFirstRoundEast() {
    const selections = [
        document.getElementById('matchup1').value,
        document.getElementById('matchup2').value,
        document.getElementById('matchup3').value,
        document.getElementById('matchup4').value
    ];

    console.log("Submitting First Round East selections:", selections);

    if (selections.some(selection => !selection)) {
        alert("Please select a winner for each matchup.");
        return;
    }

    fetch('/submit-firstround_east', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
        body: JSON.stringify({ selections })
    })
    .then(response => {
        console.log('Submit First Round East response status:', response.status);
        if (response.ok) {
            console.log("First Round East predictions saved successfully");
            window.location.href = "/firstround_west.html";
        } else {
            throw new Error('Failed to submit First Round East predictions');
        }
    })
    .catch(error => {
        console.error('Error:', error.message);
        alert("An error occurred while submitting your predictions: " + error.message);
    });
}
