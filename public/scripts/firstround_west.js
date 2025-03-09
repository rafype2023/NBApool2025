document.addEventListener('DOMContentLoaded', () => {
    console.log('First Round East page loaded');
    fetch('/get-playin', {
        method: 'GET',
        credentials: 'include',
        mode: 'cors'
    })
        .then(response => {
            console.log('GET /get-playin response:', response.status);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
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
        'Bucks': '/images/bucks.png',
        'Heat': '/images/heat.png',
        'Celtics': '/images/celtics.png',
        'Pacers': '/images/pacers.png',
        'Knicks': '/images/knicks.png',
        'Sixers': '/images/sixers.png',
        'Pistons': '/images/pistons.png',
        'Magic': '/images/magic.png',
        'Wizards': '/images/wizards.png',
        'Hawks': '/images/hawks.png'
    };

    const matchups = [
        { id: 'match1-winner', teams: ['Bucks', playinData.east7] },
        { id: 'match2-winner', teams: ['Heat', playinData.east8] },
        { id: 'match3-winner', teams: ['Celtics', 'Pacers'] },
        { id: 'match4-winner', teams: ['Knicks', 'Sixers'] }
    ];

    document.getElementById('east7-logo').src = teamLogos[playinData.east7] || '/images/default.png';
    document.getElementById('east7-logo').alt = `${playinData.east7} Logo`;
    document.getElementById('east8-logo').src = teamLogos[playinData.east8] || '/images/default.png';
    document.getElementById('east8-logo').alt = `${playinData.east8} Logo`;

    console.log('Populating matchups:', matchups);
    matchups.forEach(matchup => {
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstRoundEast: winners }),
        credentials: 'include',
        mode: 'cors'
    })
        .then(response => {
            console.log('POST /submit-firstround-east response:', response.status);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            return response.json();
        })
        .then(data => {
            console.log('Submit response:', data);
            if (data.error) alert(`Error: ${data.error}`);
            else {
                alert('First Round East submitted successfully!');
                window.location.href = '/firstround_west.html';
            }
        })
        .catch(error => {
            console.error('Error submitting First Round East data:', error);
            alert('An error occurred. Please try again or contact support.');
        });
}