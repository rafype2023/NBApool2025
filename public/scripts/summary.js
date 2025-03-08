document.addEventListener('DOMContentLoaded', () => {
    console.log('Summary page loaded');
    fetchUserPicks();
});

function fetchUserPicks() {
    fetch('/get-all-picks', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        console.log('Fetch /get-all-picks response status:', response.status);
        return response.json();
    })
    .then(data => {
        console.log('All picks data:', data);
        if (data.error) {
            alert('Error: ' + data.error);
            return;
        }

        // Populate Play-In
        document.getElementById('playin-east7').textContent = data.playin.east7 || 'Not selected';
        document.getElementById('playin-east8').textContent = data.playin.east8 || 'Not selected';
        document.getElementById('playin-west7').textContent = data.playin.west7 || 'Not selected';
        document.getElementById('playin-west8').textContent = data.playin.west8 || 'Not selected';

        // Populate First Round East
        document.getElementById('firstRoundEast-match1-winner').textContent = data.firstRoundEast['match1-winner'] || 'Not selected';
        document.getElementById('firstRoundEast-match2-winner').textContent = data.firstRoundEast['match2-winner'] || 'Not selected';
        document.getElementById('firstRoundEast-match3-winner').textContent = data.firstRoundEast['match3-winner'] || 'Not selected';
        document.getElementById('firstRoundEast-match4-winner').textContent = data.firstRoundEast['match4-winner'] || 'Not selected';

        // Populate First Round West
        document.getElementById('firstRoundWest-match1-winner').textContent = data.firstRoundWest['match1-winner'] || 'Not selected';
        document.getElementById('firstRoundWest-match2-winner').textContent = data.firstRoundWest['match2-winner'] || 'Not selected';
        document.getElementById('firstRoundWest-match3-winner').textContent = data.firstRoundWest['match3-winner'] || 'Not selected';
        document.getElementById('firstRoundWest-match4-winner').textContent = data.firstRoundWest['match4-winner'] || 'Not selected';

        // Populate Semifinals
        document.getElementById('semifinals-east-match1-winner').textContent = data.semifinals['east-match1-winner'] || 'Not selected';
        document.getElementById('semifinals-east-match2-winner').textContent = data.semifinals['east-match2-winner'] || 'Not selected';
        document.getElementById('semifinals-west-match1-winner').textContent = data.semifinals['west-match1-winner'] || 'Not selected';
        document.getElementById('semifinals-west-match2-winner').textContent = data.semifinals['west-match2-winner'] || 'Not selected';

        // Populate Conference Finals
        document.getElementById('conferenceFinals-east-final-winner').textContent = data.conferenceFinals['east-final-winner'] || 'Not selected';
        document.getElementById('conferenceFinals-west-final-winner').textContent = data.conferenceFinals['west-final-winner'] || 'Not selected';

        // Populate Finals
        document.getElementById('finals-finals-winner').textContent = data.finals['finals-winner'] || 'Not selected';
        document.getElementById('finals-finals-games').textContent = data.finals['finals-games'] || 'Not selected';
        document.getElementById('finals-finals-mvp').textContent = data.finals['finals-mvp'] || 'Not selected';
        const team1Score = data.finals['finals-score-team1'] || 'N/A';
        const team2Score = data.finals['finals-score-team2'] || 'N/A';
        document.getElementById('finals-finals-score').textContent = `${team1Score} - ${team2Score}`;
    })
    .catch(error => {
        console.error('Error fetching all picks:', error);
        alert('An error occurred while loading your picks. Please try again.');
    });
}