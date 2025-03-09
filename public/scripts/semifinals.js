document.addEventListener('DOMContentLoaded', () => {
    console.log('Semifinals page loaded');
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
            fetchFirstRoundData();
        })
        .catch(error => {
            console.error('Error fetching Play-In data:', error);
            alert('Please complete the Play-In step first.');
            window.location.href = '/playin.html';
        });
});

function fetchFirstRoundData() {
    Promise.all([
        fetch('/get-firstround-east', { credentials: 'include', mode: 'cors' }).then(res => res.json()),
        fetch('/get-firstround-west', { credentials: 'include', mode: 'cors' }).then(res => res.json())
    ])
    .then(([eastData, westData]) => {
        console.log('First Round East data:', eastData);
        console.log('First Round West data:', westData);
        if (!eastData['match1-winner'] || !eastData['match2-winner'] || !eastData['match3-winner'] || !eastData['match4-winner'] ||
            !westData['match1-winner'] || !westData['match2-winner'] || !westData['match3-winner'] || !westData['match4-winner']) {
            alert('Please complete the First Round steps first.');
            window.location.href = '/firstround_east.html';
            return;
        }
        populateMatchups(eastData, westData);
    })
    .catch(error => {
        console.error('Error fetching First Round data:', error);
        alert('Please complete the First Round steps first.');
        window.location.href = '/firstround_east.html';
    });
}

function populateMatchups(eastData, westData) {
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
        { id: 'east-match1-winner', teams: [eastData['match1-winner'], eastData['match4-winner']], logos: ['east-match1-team1-logo', 'east-match1-team2-logo'] },
        { id: 'east-match2-winner', teams: [eastData['match2-winner'], eastData['match3-winner']], logos: ['east-match2-team1-logo', 'east-match2-team2-logo'] },
        { id: 'west-match1-winner', teams: [westData['match1-winner'], westData['match4-winner']], logos: ['west-match1-team1-logo', 'west-match1-team2-logo'] },
        { id: 'west-match2-winner', teams: [westData['match2-winner'], westData['match3-winner']], logos: ['west-match2-team1-logo', 'west-match2-team2-logo'] }
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

function submitSemifinals() {
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

    fetch('/submit-semifinals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ semifinals: winners }),
        credentials: 'include',
        mode: 'cors'
    })
        .then(response => {
            console.log('POST /submit-semifinals response:', response.status);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            return response.json();
        })
        .then(data => {
            console.log('Submit response:', data);
            if (data.error) alert(`Error: ${data.error}`);
            else {
                alert('Semifinals submitted successfully!');
                window.location.href = '/conferencefinals.html';
            }
        })
        .catch(error => {
            console.error('Error submitting Semifinals data:', error);
            alert('An error occurred. Please try again.');
        });
}