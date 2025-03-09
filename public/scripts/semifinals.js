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
                window.location.href = '/firstround_west.html';
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
                'Golden State': 'warriors.png'
                // Add more teams as needed based on Play-In possibilities
            };
            // Set Eastern Conference Semifinals
            document.getElementById('east1-team1').querySelector('span').textContent = data.firstRoundEast.matchup1 || 'Winner 1 vs 8';
            document.getElementById('east1-team1').querySelector('img').src = `/images/${teamImages[data.firstRoundEast.matchup1] || 'placeholder.png'}`;
            document.getElementById('east1-team1').querySelector('img').alt = data.firstRoundEast.matchup1 || 'Winner 1 vs 8';
            document.getElementById('east1-team2').querySelector('span').textContent = data.firstRoundEast.matchup4 || 'Winner 4 vs 5';
            document.getElementById('east1-team2').querySelector('img').src = `/images/${teamImages[data.firstRoundEast.matchup4] || 'placeholder.png'}`;
            document.getElementById('east1-team2').querySelector('img').alt = data.firstRoundEast.matchup4 || 'Winner 4 vs 5';
            document.getElementById('east2-team1').querySelector('span').textContent = data.firstRoundEast.matchup2 || 'Winner 2 vs 7';
            document.getElementById('east2-team1').querySelector('img').src = `/images/${teamImages[data.firstRoundEast.matchup2] || 'placeholder.png'}`;
            document.getElementById('east2-team1').querySelector('img').alt = data.firstRoundEast.matchup2 || 'Winner 2 vs 7';
            document.getElementById('east2-team2').querySelector('span').textContent = data.firstRoundEast.matchup3 || 'Winner 3 vs 6';
            document.getElementById('east2-team2').querySelector('img').src = `/images/${teamImages[data.firstRoundEast.matchup3] || 'placeholder.png'}`;
            document.getElementById('east2-team2').querySelector('img').alt = data.firstRoundEast.matchup3 || 'Winner 3 vs 6';
            // Set Western Conference Semifinals
            document.getElementById('west1-team1').querySelector('span').textContent = data.firstRoundWest.matchup1 || 'Winner 1 vs 8';
            document.getElementById('west1-team1').querySelector('img').src = `/images/${teamImages[data.firstRoundWest.matchup1] || 'placeholder.png'}`;
            document.getElementById('west1-team1').querySelector('img').alt = data.firstRoundWest.matchup1 || 'Winner 1 vs 8';
            document.getElementById('west1-team2').querySelector('span').textContent = data.firstRoundWest.matchup4 || 'Winner 4 vs 5';
            document.getElementById('west1-team2').querySelector('img').src = `/images/${teamImages[data.firstRoundWest.matchup4] || 'placeholder.png'}`;
            document.getElementById('west1-team2').querySelector('img').alt = data.firstRoundWest.matchup4 || 'Winner 4 vs 5';
            document.getElementById('west2-team1').querySelector('span').textContent = data.firstRoundWest.matchup2 || 'Winner 2 vs 7';
            document.getElementById('west2-team1').querySelector('img').src = `/images/${teamImages[data.firstRoundWest.matchup2] || 'placeholder.png'}`;
            document.getElementById('west2-team1').querySelector('img').alt = data.firstRoundWest.matchup2 || 'Winner 2 vs 7';
            document.getElementById('west2-team2').querySelector('span').textContent = data.firstRoundWest.matchup3 || 'Winner 3 vs 6';
            document.getElementById('west2-team2').querySelector('img').src = `/images/${teamImages[data.firstRoundWest.matchup3] || 'placeholder.png'}`;
            document.getElementById('west2-team2').querySelector('img').alt = data.firstRoundWest.matchup3 || 'Winner 3 vs 6';
            // Populate dropdowns with possible winners
            const allTeams = [
                ...Object.keys(teamImages),
                data.firstRoundEast.matchup1, data.firstRoundEast.matchup2,
                data.firstRoundEast.matchup3, data.firstRoundEast.matchup4,
                data.firstRoundWest.matchup1, data.firstRoundWest.matchup2,
                data.firstRoundWest.matchup3, data.firstRoundWest.matchup4
            ].filter(team => team); // Remove undefined values
            ['east1', 'east2', 'west1', 'west2'].forEach(id => {
                const select = document.getElementById(id);
                if (select) {
                    select.innerHTML = '<option value="" disabled selected>Select WINNER</option>';
                    const uniqueTeams = [...new Set(allTeams)];
                    uniqueTeams.forEach(team => {
                        const option = document.createElement('option');
                        option.value = team;
                        option.textContent = team;
                        select.appendChild(option);
                    });
                    select.value = data.semifinals[id] || '';
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
        west2: document.getElementById('west2')?.value || ''
    };

    if (!formData.east1 || !formData.east2 || !formData.west1 || !formData.west2) {
        alert('Please select all winners.');
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