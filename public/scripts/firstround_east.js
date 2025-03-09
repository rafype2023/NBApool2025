document.addEventListener('DOMContentLoaded', () => {
    console.log('First Round East page loaded with Super Grok optimization');
    fetch('/get-firstround-east', {
        method: 'GET',
        credentials: 'include',
        mode: 'cors'
    })
        .then(response => {
            console.log('GET /get-firstround-east response:', response.status, response.headers);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            return response.json();
        })
        .then(data => {
            console.log('First Round East data received:', data);
            if (data.error) {
                alert(`${data.error}. Contact support if the issue persists.`);
                window.location.href = data.error.includes('Play-In') ? '/playin.html' : '/';
                return;
            }
            // Map team names to image file names (nicknames)
              const teamImages = {
                'Cleveland': 'cavaliers.png',
                'Boston': 'celtics.png',
                'New York Knicks': 'knicks.png',
                'Milwaukee': 'bucks.png',
                'Magic': 'magic.png',
                'Pistons': 'pistons.png',
                'Detroit': 'pistons.png',
                'Indiana': 'pacers.png',
                'OKC': 'thunder.png',
                'Denver': 'nuggets.png',
                'Los Angeles': 'lakers.png',
                'Memphis': 'grizzlies.png',
                'Houston': 'rockets.png',
                'Golden State': 'warriors.png',
    'Atlanta': 'hawks.png',
    'Miami': 'heat.png',
    'Orlando': 'magic.png',
    'Washington': 'wizards.png',
    'Detroit': 'pistons.png',
    'Indiana': 'pacers.png',
    'New Orleans': 'pelicans.png',
    'San Antonio': 'spurs.png',
    'Houston': 'rockets.png',
    'Utah': 'jazz.png'
    // Add more teams as needed
};          // Use Play-In data for 7th and 8th seeds
            const east7 = data.playin.east7 || '7th Seed';
            const east8 = data.playin.east8 || '8th Seed';
            // Define matchups based on Play-In winners
            const matchup1Team1 = 'Cleveland'; // Fixed seed 1
            const matchup1Team2 = east8; // 8th seed from Play-In
            const matchup2Team1 = 'Boston'; // Fixed seed 2
            const matchup2Team2 = east7; // 7th seed from Play-In
            const matchup3Team1 = 'New York Knicks'; // Fixed seed 3
            const matchup3Team2 = 'Detroit'; // Fixed seed 6
            const matchup4Team1 = 'Milwaukee'; // Fixed seed 4
            const matchup4Team2 = 'Indiana'; // Fixed seed 5
            // Set team names and logos
            document.getElementById('matchup1-team1').querySelector('span').textContent = matchup1Team1;
            document.getElementById('matchup1-team1').querySelector('img').src = `/images/${teamImages[matchup1Team1] || 'placeholder.png'}`;
            document.getElementById('matchup1-team1').querySelector('img').alt = matchup1Team1;
            document.getElementById('matchup1-team2').querySelector('span').textContent = matchup1Team2;
            document.getElementById('matchup1-team2').querySelector('img').src = `/images/${teamImages[matchup1Team2] || 'placeholder.png'}`;
            document.getElementById('matchup1-team2').querySelector('img').alt = matchup1Team2;
            document.getElementById('matchup2-team1').querySelector('span').textContent = matchup2Team1;
            document.getElementById('matchup2-team1').querySelector('img').src = `/images/${teamImages[matchup2Team1] || 'placeholder.png'}`;
            document.getElementById('matchup2-team1').querySelector('img').alt = matchup2Team1;
            document.getElementById('matchup2-team2').querySelector('span').textContent = matchup2Team2;
            document.getElementById('matchup2-team2').querySelector('img').src = `/images/${teamImages[matchup2Team2] || 'placeholder.png'}`;
            document.getElementById('matchup2-team2').querySelector('img').alt = matchup2Team2;
            document.getElementById('matchup3-team1').querySelector('span').textContent = matchup3Team1;
            document.getElementById('matchup3-team1').querySelector('img').src = `/images/${teamImages[matchup3Team1] || 'placeholder.png'}`;
            document.getElementById('matchup3-team1').querySelector('img').alt = matchup3Team1;
            document.getElementById('matchup3-team2').querySelector('span').textContent = matchup3Team2;
            document.getElementById('matchup3-team2').querySelector('img').src = `/images/${teamImages[matchup3Team2] || 'placeholder.png'}`;
            document.getElementById('matchup3-team2').querySelector('img').alt = matchup3Team2;
            document.getElementById('matchup4-team1').querySelector('span').textContent = matchup4Team1;
            document.getElementById('matchup4-team1').querySelector('img').src = `/images/${teamImages[matchup4Team1] || 'placeholder.png'}`;
            document.getElementById('matchup4-team1').querySelector('img').alt = matchup4Team1;
            document.getElementById('matchup4-team2').querySelector('span').textContent = matchup4Team2;
            document.getElementById('matchup4-team2').querySelector('img').src = `/images/${teamImages[matchup4Team2] || 'placeholder.png'}`;
            document.getElementById('matchup4-team2').querySelector('img').alt = matchup4Team2;
            // Define matchups for dropdowns
            const matchups = {
                matchup1: [matchup1Team1, matchup1Team2],
                matchup2: [matchup2Team1, matchup2Team2],
                matchup3: [matchup3Team1, matchup3Team2],
                matchup4: [matchup4Team1, matchup4Team2]
            };
            console.log('Matchups defined:', matchups); // Debug log
            // Populate dropdowns with teams
            ['matchup1', 'matchup2', 'matchup3', 'matchup4'].forEach(id => {
                const select = document.getElementById(id);
                if (select) {
                    select.innerHTML = '<option value="" disabled selected>Select WINNER</option>';
                    const teams = matchups[id].filter(team => team && team !== '7th Seed' && team !== '8th Seed');
                    console.log(`Populating ${id} with teams:`, teams); // Debug log
                    if (teams.length === 2) {
                        teams.forEach(team => {
                            const option = document.createElement('option');
                            option.value = team;
                            option.textContent = team;
                            select.appendChild(option);
                        });
                    } else {
                        console.warn(`Invalid team count for ${id}:`, teams);
                    }
                    select.value = data.firstRoundEast[id] || '';
                } else {
                    console.error(`Select element with id '${id}' not found`);
                }
            });
            // Populate series length dropdowns
            ['series1', 'series2', 'series3', 'series4'].forEach(id => {
                const select = document.getElementById(id);
                if (select) {
                    console.log(`Populating ${id} with series options`); // Debug log
                    select.innerHTML = '<option value="" disabled selected>Select SERIES LENGTH</option>';
                    ['4-0', '4-1', '4-2', '4-3'].forEach(series => {
                        const option = document.createElement('option');
                        option.value = series;
                        option.textContent = series;
                        select.appendChild(option);
                    });
                    select.value = data.firstRoundEast[id] || '';
                } else {
                    console.error(`Select element with id '${id}' not found`);
                }
            });
        })
        .catch(error => {
            console.error('Fetch error for /get-firstround-east:', error);
            alert('Failed to load First Round East data. Please ensure you’ve completed the Play-In step or contact support.');
            window.location.href = '/playin.html';
        });

    const firstRoundEastForm = document.getElementById('firstround-east-form');
    if (!firstRoundEastForm) {
        console.error('First Round East form not found. Check if id="firstround-east-form" exists.');
        alert('Form error. Refresh or contact support.');
        return;
    }
    firstRoundEastForm.addEventListener('submit', submitFirstRoundEast);
});

function submitFirstRoundEast(event) {
    event.preventDefault();
    const formData = {
        matchup1: document.getElementById('matchup1')?.value || '',
        matchup2: document.getElementById('matchup2')?.value || '',
        matchup3: document.getElementById('matchup3')?.value || '',
        matchup4: document.getElementById('matchup4')?.value || '',
        series1: document.getElementById('series1')?.value || '',
        series2: document.getElementById('series2')?.value || '',
        series3: document.getElementById('series3')?.value || '',
        series4: document.getElementById('series4')?.value || ''
    };

    if (!formData.matchup1 || !formData.matchup2 || !formData.matchup3 || !formData.matchup4 ||
        !formData.series1 || !formData.series2 || !formData.series3 || !formData.series4) {
        alert('Please select all winners and series lengths.');
        return;
    }

    console.log('Submitting First Round East data:', formData);
    fetch('/submit-firstround-east', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstRoundEast: formData }),
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
                alert('First Round East data saved successfully!');
                window.location.href = '/firstround_west.html';
            }
        })
        .catch(error => {
            console.error('Submit error for /submit-firstround-east:', error);
            alert('Failed to save First Round East data. Please try again or contact support.');
        });
}