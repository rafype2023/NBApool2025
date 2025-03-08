document.addEventListener('DOMContentLoaded', () => {
    console.log('First Round West page loaded');
    fetch('/get-playin', {
        method: 'GET',
        credentials: 'include' // Ensure cookies are sent
    })
        .then(response => {
            console.log('Fetch /get-playin response status:', response.status);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Play-In data:', data);
            if (data.error || !data.east7 || !data.east8 || !data.west7 || !data.west8) {
                alert('Please complete the Play-In step first or check for errors: ' + (data.error || 'Missing Play-In data'));
                window.location.href = '/playin.html';
                return;
            }
            populateMatchups(data);
        })
        .catch(error => {
            console.error('Error fetching Play-In data:', error);
            alert('Please complete the Play-In step first or contact support if the issue persists.');
            window.location.href = '/playin.html';
        });
});

function populateMatchups(playinData) {
    const teamLogos = {
        'Lakers': '/images/lakers.png',
        'Warriors': '/images/warriors.png',
        'Pelicans': '/images/pelicans.png',
        'Jazz': '/images/jazz.png',
        'Kings': '/images/kings.png',
        'Spurs': '/images/spurs.png',
        'Nuggets': '/images/nuggets.png',
        'Suns': '/images/suns.png',
        'Mavericks': '/images/mavericks.png',
        'Clippers': '/images/clippers.png',
        'Rockets': '/images/rockets.png',
        'Trail Blazers': '/images/trailblazers.png'
        // Add more teams as needed
    };

    const matchups = [
        { id: 'match1-winner', teams: ['Nuggets', playinData.west7] },
        { id: 'match2-winner', teams: ['Suns', playinData.west8] },
        { id: 'match3-winner', teams: ['Warriors', 'Mavericks'] },
        { id: 'match4-winner', teams: ['Lakers', 'Clippers'] }
    ];

    // Update logos for dynamic teams
    document.getElementById('west7-logo').src = teamLogos[playinData.west7] || '/images/default.png';
    document.getElementById('west7-logo').alt = `${playinData.west7} Logo`;
    document.getElementById('west8-logo').src = teamLogos[playinData.west8] || '/images/default.png';
    document.getElementById('west8-logo').alt = `${playinData.west8} Logo`;

    console.log('Populating matchups:', matchups);
    matchups.forEach(matchup => {
        const select = document.getElementById(matchup.id);
        if (select) {
            select.innerHTML = ''; // Clear existing options to prevent duplicates
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
        body: JSON.stringify({ firstRoundWest: winners }),
        credentials: 'include' // Ensure cookies are sent
    })
    .then(response => {
        console.log('Fetch /submit-firstround-west response status:', response.status);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Submit response:', data);
        if (data.error) {
            alert('Error: ' + data.error);
        } else {
            alert('First Round West submitted successfully!');
            window.location.href = '/semifinals.html';
        }
    })
    .catch(error => {
        console.error('Error submitting First Round West data:', error);
        alert('An error occurred. Please try again or contact support.');
    });
}