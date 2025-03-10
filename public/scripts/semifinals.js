document.addEventListener('DOMContentLoaded', () => {
    console.log('Semifinals page loaded with Super Grok optimization');
    fetch('/get-semifinals', {
        method: 'GET',
        credentials: 'include',
        mode: 'cors'
    })
        .then(response => {
            console.log('GET /get-semifinals response:', response.status, response.headers);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            return response.json();
        })
        .then(data => {
            console.log('Semifinals data received:', data);
            if (data.error) {
                alert(`${data.error}. Contact support if the issue persists.`);
                window.location.href = data.error.includes('First Round') ? '/firstround_west.html' : '/';
                return;
            }
            // Map team names to image file names (nicknames)
            const teamImages = {
                'Cleveland': 'cavaliers.png',
                'Boston': 'celtics.png',
                'New York Knicks': 'knicks.png',
                'Milwaukee': 'bucks.png',
                'Atlanta': 'hawks.png',
                'Miami': 'heat.png',
                'Orlando': 'magic.png',
                'Washington': 'wizards.png',
                'Detroit': 'pistons.png',
                'Indiana': 'pacers.png',
                'New Orleans': 'pelicans.png',
                'San Antonio': 'spurs.png',
                'Houston': 'rockets.png',
                'Utah': 'jazz.png',
                'OKC': 'thunder.png',
                'Denver': 'nuggets.png',
                'Los Angeles': 'lakers.png',
                'Memphis': 'grizzlies.png',
                'Golden State': 'warriors.png'
            };
            // Set Eastern Conference Semifinals
            const eastMatchup1Team1 = data.firstRoundEast.matchup1 || 'Winner 1 vs 8';
            const eastMatchup1Team2 = data.firstRoundEast.matchup4 || 'Winner 4 vs 5';
            const eastMatchup2Team1 = data.firstRoundEast.matchup2 || 'Winner 2 vs 7';
            const eastMatchup2Team2 = data.firstRoundEast.matchup3 || 'Winner 3 vs 6';
            // Set Western Conference Semifinals
            const westMatchup1Team1 = data.firstRoundWest.matchup1 || 'Winner 1 vs 8';
            const westMatchup1Team2 = data.firstRoundWest.matchup4 || 'Winner 4 vs 5';
            const westMatchup2Team1 = data.firstRoundWest.matchup2 || 'Winner 2 vs 7';
            const westMatchup2Team2 = data.firstRoundWest.matchup3 || 'Winner 3 vs 6';
            // Function to set team data with null checks
            const setTeamData = (id, team) => {
                const element = document.getElementById(id);
                if (element) {
                    const span = element.querySelector('span');
                    const img = element.querySelector('img');
                    if (span) span.textContent = team;
                    if (img) img.src = `/images/${teamImages[team] || 'placeholder.png'}`;
                    if (img) img.alt = team;
                } else {
                    console.error(`Element with id '${id}' not found`);
                }
            };
            // Set Eastern Conference teams
            setTeamData('east1-team1', eastMatchup1Team1);
            setTeamData('east1-team2', eastMatchup1Team2);
            setTeamData('east2-team1', eastMatchup2Team1);
            setTeamData('east2-team2', eastMatchup2Team2);
            // Set Western Conference teams
            setTeamData('west1-team1', westMatchup1Team1);
            setTeamData('west1-team2', westMatchup1Team2);
            setTeamData('west2-team1', westMatchup2Team1);
            setTeamData('west2-team2', westMatchup2Team2);
            // Define matchups for dropdowns
            const matchups = {
                east1: [eastMatchup1Team1, eastMatchup1Team2],
                east2: [eastMatchup2Team1, eastMatchup2Team2],
                west1: [westMatchup1Team1, westMatchup1Team2],
                west2: [westMatchup2Team1, westMatchup2Team2]
            };
            console.log('Matchups defined:', matchups); // Debug log
            // Populate winner dropdowns
            ['east1', 'east2', 'west1', 'west2'].forEach(id => {
                const select = document.getElementById(id);
                if (select) {
                    select.innerHTML = '<option value="" disabled selected>Select WINNER</option>';
                    const teams = matchups[id].filter(team => team && team !== 'Winner 1 vs 8' && team !== 'Winner 2 vs 7' && team !== 'Winner 3 vs 6' && team !== 'Winner 4 vs 5');
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
                    select.value = data.semifinals[id] || '';
                } else {
                    console.error(`Select element with id '${id}' not found`);
                }
            });
            // Populate series length dropdowns
            ['eastSeries1', 'eastSeries2', 'westSeries1', 'westSeries2'].forEach(id => {
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
                    select.value = data.semifinals[id] || '';
                } else {
                    console.error(`Select element with id '${id}' not found`);
                }
            });
        })
        .catch(error => {
            console.error('Fetch error for /get-semifinals:', error);
            alert('Failed to load Semifinals data. Please ensure you’re registered or contact support.');
            window.location.href = '/';
        });

    const semifinalsForm = document.getElementById('semifinals-form');
    if (!semifinalsForm) {
        console.error('Semifinals form not found. Check if id="semifinals-form" exists.');
        alert('Form error. Refresh or contact support.');
        return;
    }
    semifinalsForm.addEventListener('submit', submitSemifinals);
});

function submitSemifinals(event) {
    event.preventDefault();
    const formData = {
        east1: document.getElementById('east1')?.value || '',
        east2: document.getElementById('east2')?.value || '',
        west1: document.getElementById('west1')?.value || '',
        west2: document.getElementById('west2')?.value || '',
        eastSeries1: document.getElementById('eastSeries1')?.value || '',
        eastSeries2: document.getElementById('eastSeries2')?.value || '',
        westSeries1: document.getElementById('westSeries1')?.value || '',
        westSeries2: document.getElementById('westSeries2')?.value || ''
    };

    if (!formData.east1 || !formData.east2 || !formData.west1 || !formData.west2 ||
        !formData.eastSeries1 || !formData.eastSeries2 || !formData.westSeries1 || !formData.westSeries2) {
        alert('Please select all winners and series lengths.');
        return;
    }

    console.log('Submitting Semifinals data:', formData);
    fetch('/submit-semifinals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ semifinals: formData }),
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
                alert('Semifinals data saved successfully!');
                window.location.href = '/conferencefinals.html';
            }
        })
        .catch(error => {
            console.error('Submit error for /submit-semifinals:', error);
            alert('Failed to save Semifinals data. Please try again or contact support.');
        });
}