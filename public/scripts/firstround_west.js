document.addEventListener('DOMContentLoaded', () => {
    console.log('First Round West page loaded');
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
        { id: 'match1-winner', teams: ['Lakers', 'Pelicans'] },
        { id: 'match2-winner', teams: ['Nuggets', 'Timberwolves'] },
        { id: 'match3-winner', teams: ['Warriors', 'Clippers'] },
        { id: 'match4-winner', teams: ['Suns', 'Mavericks'] }
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

function submitFirstRoundWest() {
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

    fetch('/submit-firstround-west', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ firstRoundWest: winners })
    })
    .then(response => {
        console.log('Fetch /submit-firstround-west response status:', response.status);
        return response.json();
    })
    .then(data => {
        console.log('Submit response:', data);
        if (data.error) {
            alert('Error: ' + data.error);
        } else {
            alert('First Round West submitted successfully!');
            window.location.href = '/semifinals.html'; // Next step in sequence
        }
    })
    .catch(error => {
        console.error('Error submitting First Round West data:', error);
        alert('An error occurred. Please try again.');
    });
}
