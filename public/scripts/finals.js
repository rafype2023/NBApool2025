document.addEventListener('DOMContentLoaded', () => {
    console.log('Finals page loaded');
    fetch('/get-playin')
        .then(response => response.json())
        .then(data => {
            if (data.error || !data.east7 || !data.east8 || !data.west7 || !data.west8) {
                alert('Please complete the Play-In step first.');
                window.location.href = '/playin.html';
                return;
            }
            fetchConferenceFinalsData();
        })
        .catch(error => {
            console.error('Error fetching Play-In data:', error);
            alert('Please complete the Play-In step first.');
            window.location.href = '/playin.html';
        });
});

function fetchConferenceFinalsData() {
    fetch('/get-conferencefinals')
        .then(response => response.json())
        .then(data => {
            console.log('Conference Finals data:', data);
            if (!data['east-final-winner'] || !data['west-final-winner']) {
                alert('Please complete the Conference Finals step first.');
                window.location.href = '/conferencefinals.html';
                return;
            }
            populateMatchups(data);
        })
        .catch(error => {
            console.error('Error fetching Conference Finals data:', error);
            alert('Please complete the Conference Finals step first.');
            window.location.href = '/conferencefinals.html';
        });
}

function populateMatchups(conferenceFinalsData) {
    const teamLogos = {
        'Bucks': '/images/bucks.png',
        'Heat': '/images/heat.png',
        'Celtics': '/images/celtics.png',
        'Pacers': '/images/pacers.png',
        'Knicks': '/images/knicks.png',
        'Sixers': '/images/sixers.png',
        'Hawks': '/images/hawks.png',
        'Bulls': '/images/bulls.png',
        'Hornets': '/images/hornets.png',
        'Wizards': '/images/wizards.png',
        'Nets': '/images/nets.png',
        'Raptors': '/images/raptors.png',
        'Nuggets': '/images/nuggets.png',
        'Suns': '/images/suns.png',
        'Warriors': '/images/warriors.png',
        'Mavericks': '/images/mavericks.png',
        'Lakers': '/images/lakers.png',
        'Clippers': '/images/clippers.png',
        'Pelicans': '/images/pelicans.png',
        'Jazz': '/images/jazz.png',
        'Kings': '/images/kings.png',
        'Spurs': '/images/spurs.png'
    };

    const mvpCandidates = {
        'Bucks': 'Giannis Antetokounmpo',
        'Heat': 'Jimmy Butler',
        'Celtics': 'Jayson Tatum',
        'Pacers': 'Tyrese Haliburton',
        'Knicks': 'Jalen Brunson',
        'Sixers': 'Joel Embiid',
        'Hawks': 'Trae Young',
        'Bulls': 'DeMar DeRozan',
        'Hornets': 'LaMelo Ball',
        'Wizards': 'Kyle Kuzma',
        'Nets': 'Mikal Bridges',
        'Raptors': 'Scottie Barnes',
        'Nuggets': 'Nikola Jokic',
        'Suns': 'Kevin Durant',
        'Warriors': 'Stephen Curry',
        'Mavericks': 'Luka Doncic',
        'Lakers': 'LeBron James',
        'Clippers': 'Kawhi Leonard',
        'Pelicans': 'Zion Williamson',
        'Jazz': 'Lauri Markkanen',
        'Kings': 'De’Aaron Fox',
        'Spurs': 'Victor Wembanyama'
    };

    const teams = [conferenceFinalsData['east-final-winner'], conferenceFinalsData['west-final-winner']];

    // Populate matchup logos
    document.getElementById('finals-team1-logo').src = teamLogos[teams[0]] || '/images/default.png';
    document.getElementById('finals-team1-logo').alt = `${teams[0]} Logo`;
    document.getElementById('finals-team2-logo').src = teamLogos[teams[1]] || '/images/default.png';
    document.getElementById('finals-team2-logo').alt = `${teams[1]} Logo`;

    // Populate champion dropdown
    const winnerSelect = document.getElementById('finals-winner');
    teams.forEach(team => {
        const option = document.createElement('option');
        option.value = team;
        option.textContent = team;
        winnerSelect.appendChild(option);
    });

    // Populate MVP dropdown
    const mvpSelect = document.getElementById('finals-mvp');
    teams.forEach(team => {
        const player = mvpCandidates[team];
        if (player) {
            const option = document.createElement('option');
            option.value = player;
            option.textContent = player;
            mvpSelect.appendChild(option);
        }
    });

    // Update score placeholders
    document.getElementById('finals-score-team1').placeholder = `${teams[0]} Score`;
    document.getElementById('finals-score-team2').placeholder = `${teams[1]} Score`;
}

function submitFinals() {
    const winners = {
        'finals-winner': document.getElementById('finals-winner').value,
        'finals-games': document.getElementById('finals-games').value,
        'finals-mvp': document.getElementById('finals-mvp').value,
        'finals-score-team1': document.getElementById('finals-score-team1').value,
        'finals-score-team2': document.getElementById('finals-score-team2').value
    };

    console.log('Selected finals data:', winners);
    if (!winners['finals-winner'] || !winners['finals-games'] || !winners['finals-mvp'] ||
        !winners['finals-score-team1'] || !winners['finals-score-team2']) {
        alert('Please fill out all fields (Champion, Games, MVP, and Final Score).');
        return;
    }

    const team1Score = parseInt(winners['finals-score-team1']);
    const team2Score = parseInt(winners['finals-score-team2']);
    if (isNaN(team1Score) || isNaN(team2Score) || team1Score < 0 || team2Score < 0) {
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
            window.location.href = '/summary.html';
        }
    })
    .catch(error => {
        console.error('Error submitting Finals data:', error);
        alert('An error occurred. Please try again.');
    });
}