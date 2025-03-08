document.addEventListener('DOMContentLoaded', () => {
    console.log('Conference Finals page loaded');
    fetch('/get-playin')
        .then(response => {
            console.log('Fetch /get-playin response status:', response.status);
            return response.json();
        })
        .then(data => {
            console.log('Play-In data:', data);
            if (data.error || !data.east7 || !data.east8 || !data.west7 || !data.west8) {
                alert('Please complete the Play-In step first.');
                window.location.href = '/playin.html';
                return;
            }
            populateWinners();
        })
        .catch(error => {
            console.error('Error fetching Play-In data:', error);
            alert('Please complete the Play-In step first.');
            window.location.href = '/playin.html';
        });
});

function populateWinners() {
    const matchups = [
        { id: 'east-final-winner', teams: ['Hawks', 'Bucks'] },
        { id: 'west-final-winner', teams: ['Lakers', 'Warriors'] }
    ];

    console.log('Populating winners for matchups:', matchups);
    matchups.forEach(matchup => {
        const select = document.getElementById(matchup.id);
        if (select) {
            matchup.teams.forEach(team => {
                const option = document.createElement('option');
                option.value = team;
                option.textContent = team;
                select.appendChild(option);
            });
        } else {
            console.error(`Select element with id '${matchup.id}' not found`);
        }
    });
}

function submitConferenceFinals() {
    const winners = {};
    document.querySelectorAll('.winner-select').forEach(select => {
        if (select.value) {
            winners[select.id] = select.value;
        }
    });

    console.log('Selected winners:', winners);
    if (Object.keys(winners).length !== document.querySelectorAll('.winner-select').length) {
        alert('Please select a winner for all matchups.');
        return;
    }

    fetch('/submit-conferencefinals', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ conferenceFinals: winners })
    })
    .then(response => {
        console.log('Fetch /submit-conferencefinals response status:', response.status);
        return response.json();
    })
    .then(data => {
        console.log('Submit response:', data);
        if (data.error) {
            alert('Error: ' + data.error);
        } else {
            alert('Conference Finals submitted successfully!');
            window.location.href = '/finals.html'; // Next step in sequence
        }
    })
    .catch(error => {
        console.error('Error submitting Conference Finals data:', error);
        alert('An error occurred. Please try again.');
    });
}
