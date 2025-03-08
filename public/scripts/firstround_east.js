document.addEventListener('DOMContentLoaded', () => {
    console.log('First Round East page loaded');
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
        { id: 'match1-winner', teams: ['Hawks', 'Knicks'] },
        { id: 'match2-winner', teams: ['Celtics', 'Heat'] },
        { id: 'match3-winner', teams: ['Bucks', 'Pacers'] },
        { id: 'match4-winner', teams: ['Sixers', 'Cavaliers'] }
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

function submitFirstRoundEast() {
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

    fetch('/submit-firstround-east', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ firstRoundEast: winners }) // Changed to firstRoundEast to distinguish from West
    })
    .then(response => {
        console.log('Fetch /submit-firstround-east response status:', response.status);
        return response.json();
    })
    .then(data => {
        console.log('Submit response:', data);
        if (data.error) {
            alert('Error: ' + data.error);
        } else {
            alert('First Round East submitted successfully!');
            window.location.href = '/firstround_west.html'; // Updated to First Round West
        }
    })
    .catch(error => {
        console.error('Error submitting First Round East data:', error);
        alert('An error occurred. Please try again.');
    });
}
