\document.addEventListener('DOMContentLoaded', () => {
    console.log('Conference Finals page loaded');
    fetch('/get-playin', {
        method: 'GET',
        credentials: 'include',
        mode: 'cors'
    })
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            return response.json();
        })
        .then(data => {
            if (data.error || !data.east7 || !data.east8 || !data.west7 || !data.west8) {
                alert('Please complete the Play-In step first.');
                window.location.href = '/playin.html';
                return;
            }
            fetchSemifinalsData();
        })
        .catch(error => {
            console.error('Error fetching Play-In data:', error);
            alert('Please complete the Play-In step first.');
            window.location.href = '/playin.html';
        });
});

function fetchSemifinalsData() {
    fetch('/get-semifinals', {
        method: 'GET',
        credentials: 'include',
        mode: 'cors'
    })
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            return response.json();
        })
        .then(data => {
            console.log('Semifinals data:', data);
            if (!data['east-match1-winner'] || !data['east-match2-winner'] || !data['west-match1-winner'] || !data['west-match2-winner']) {
                alert('Please complete the Semifinals step first.');
                window.location.href = '/semifinals.html';
                return;
            }
            populateMatchups(data);
        })
        .catch(error => {
            console.error('Error fetching Semifinals data:', error);
            alert('Please complete the Semifinals step first.');
            window.location.href = '/semifinals.html';
        });
}

function populateMatchups(semifinalsData) {
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
        'Spurs': '/images/spurs.png',
        'Pistons': '/images/pistons.png',
        'Magic': '/images/magic.png',
        'Rockets': '/images/rockets.png',
        'Trail Blazers': '/images/trailblazers.png'
    };

    const matchups = [
        { id: 'east-final-winner', teams: [semifinalsData['east-match1-winner'], semifinalsData['east-match2-winner']], logos: ['east-final-team1-logo', 'east-final-team2-logo'] },
        { id: 'west-final-winner', teams: [semifinalsData['west-match1-winner'], semifinalsData['west-match2-winner']], logos: ['west-final-team1-logo', 'west-final-team2-logo'] }
    ];

    matchups.forEach(matchup => {
        document.getElementById(matchup.logos[0]).src = teamLogos[matchup.teams[0]] || '/images/default.png';
        document.getElementById(matchup.logos[0]).alt = `${matchup.teams[0]} Logo`;
        document.getElementById(matchup.logos[1]).src = teamLogos[matchup.teams[1]] || '/images/default.png';
        document.getElementById(matchup.logos[1]).alt = `${matchup.teams[1]} Logo`;

        const select = document.getElementById(matchup.id);
        if (select) {
            select.innerHTML = '<option value="" disabled selected>Select WINNER</option>';
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conferenceFinals: winners }),
        credentials: 'include',
        mode: 'cors'
    })
        .then(response => {
            console.log('POST /submit-conferencefinals response:', response.status);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            return response.json();
        })
        .then(data => {
            console.log('Submit response:', data);
            if (data.error) alert(`Error: ${data.error}`);
            else {
                alert('Conference Finals submitted successfully!');
                window.location.href = '/finals.html';
            }
        })
        .catch(error => {
            console.error('Error submitting Conference Finals data:', error);
            alert('An error occurred. Please try again.');
        });
}