document.addEventListener('DOMContentLoaded', () => {
    console.log('Conference Finals page loaded with Super Grok optimization');
    fetch('/get-conferencefinals', {
        method: 'GET',
        credentials: 'include',
        mode: 'cors'
    })
        .then(response => {
            console.log('GET /get-conferencefinals response:', response.status, response.headers);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            return response.json();
        })
        .then(data => {
            console.log('Conference Finals data received:', data);
            if (data.error) {
                alert(`${data.error}. Contact support if the issue persists.`);
                window.location.href = data.error.includes('Semifinals') ? '/semifinals.html' : '/';
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
};
            const eastTeam1 = data.semifinals.east1 || 'Winner East 1';
            const eastTeam2 = data.semifinals.east2 || 'Winner East 2';
            document.getElementById('east-team1').querySelector('span').textContent = eastTeam1;
            document.getElementById('east-team1').querySelector('img').src = `/images/${teamImages[eastTeam1] || 'placeholder.png'}`;
            document.getElementById('east-team1').querySelector('img').alt = eastTeam1;
            document.getElementById('east-team2').querySelector('span').textContent = eastTeam2;
            document.getElementById('east-team2').querySelector('img').src = `/images/${teamImages[eastTeam2] || 'placeholder.png'}`;
            document.getElementById('east-team2').querySelector('img').alt = eastTeam2;
            const westTeam1 = data.semifinals.west1 || 'Winner West 1';
            const westTeam2 = data.semifinals.west2 || 'Winner West 2';
            document.getElementById('west-team1').querySelector('span').textContent = westTeam1;
            document.getElementById('west-team1').querySelector('img').src = `/images/${teamImages[westTeam1] || 'placeholder.png'}`;
            document.getElementById('west-team1').querySelector('img').alt = westTeam1;
            document.getElementById('west-team2').querySelector('span').textContent = westTeam2;
            document.getElementById('west-team2').querySelector('img').src = `/images/${teamImages[westTeam2] || 'placeholder.png'}`;
            document.getElementById('west-team2').querySelector('img').alt = westTeam2;
            const matchups = {
                eastWinner: [eastTeam1, eastTeam2],
                westWinner: [westTeam1, westTeam2]
            };
            console.log('Matchups defined:', matchups);
            ['eastWinner', 'westWinner'].forEach(id => {
                const select = document.getElementById(id);
                if (select) {
                    select.innerHTML = '<option value="" disabled selected>Select WINNER</option>';
                    const teams = matchups[id].filter(team => team && team !== 'Winner East 1' && team !== 'Winner East 2' && team !== 'Winner West 1' && team !== 'Winner West 2');
                    console.log(`Populating ${id} with teams:`, teams);
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
                    select.value = data.conferenceFinals[id] || '';
                }
            });
            ['eastSeries', 'westSeries'].forEach(id => {
                const select = document.getElementById(id);
                if (select) select.value = data.conferenceFinals[id] || '';
            });
        })
        .catch(error => {
            console.error('Fetch error for /get-conferencefinals:', error);
            alert('Failed to load Conference Finals data. Please ensure you’re registered or contact support.');
            window.location.href = '/';
        });

    const conferenceFinalsForm = document.getElementById('conferencefinals-form');
    if (!conferenceFinalsForm) {
        console.error('Conference Finals form not found. Check if id="conferencefinals-form" exists.');
        alert('Form error. Refresh or contact support.');
        return;
    }
    conferenceFinalsForm.addEventListener('submit', submitConferenceFinals);
});

function submitConferenceFinals(event) {
    event.preventDefault();
    const formData = {
        eastWinner: document.getElementById('eastWinner')?.value || '',
        westWinner: document.getElementById('westWinner')?.value || '',
        eastSeries: document.getElementById('eastSeries')?.value || '',
        westSeries: document.getElementById('westSeries')?.value || ''
    };

    if (!formData.eastWinner || !formData.westWinner || !formData.eastSeries || !formData.westSeries) {
        alert('Please select all winners and series lengths.');
        return;
    }

    console.log('Submitting Conference Finals data:', formData);
    fetch('/submit-conferencefinals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conferenceFinals: formData }),
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
                alert('Conference Finals data saved successfully!');
                window.location.href = '/finals.html';
            }
        })
        .catch(error => {
            console.error('Submit error for /submit-conferencefinals:', error);
            alert('Failed to save Conference Finals data. Please try again or contact support.');
        });
}