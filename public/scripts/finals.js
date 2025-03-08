document.addEventListener('DOMContentLoaded', () => {
    console.log('Finals page loaded');
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
        { id: 'finals-winner', teams: ['Hawks', 'Lakers'] }
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

function submitFinals() {
    const winners = {
        'finals-winner': document.getElementById('finals-winner').value,
        'finals-games': document.getElementById('finals-games').value,
        'finals-mvp': document.getElementById('finals-mvp').value,
        'finals-score-hawks': document.getElementById('finals-score-hawks').value,
        'finals-score-lakers': document.getElementById('finals-score-lakers').value
    };

    console.log('Selected finals data:', winners);
    if (!winners['finals-winner'] || !winners['finals-games'] || !winners['finals-mvp'] ||
        !winners['finals-score-hawks'] || !winners['finals-score-lakers']) {
        alert('Please fill out all fields (Champion, Games, MVP, and Final Score).');
        return;
    }

    // Validate scores are numbers
    const hawksScore = parseInt(winners['finals-score-hawks']);
    const lakersScore = parseInt(winners['finals-score-lakers']);
    if (isNaN(hawksScore) || isNaN(lakersScore) || hawksScore < 0 || lakersScore < 0) {
        alert('Please enter valid scores (non-negative numbers).');
        return;
    }

    fetch('/submit-finals', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ finals: winners })
    })
    .then(response => {
        console.log('Fetch /submit-finals response status:', response.status);
        return response.json();
    })
    .then(data => {
        console.log('Submit response:', data);
        if (data.error) {
            alert('Error: ' + data.error);
        } else {
            alert('Finals submitted successfully!');
            window.location.href = '/summary.html'; // Next step in sequence
        }
    })
    .catch(error => {
        console.error('Error submitting Finals data:', error);
        alert('An error occurred. Please try again.');
    });
}
