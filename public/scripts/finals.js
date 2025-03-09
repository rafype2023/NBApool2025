document.addEventListener('DOMContentLoaded', () => {
    console.log('Finals page loaded with Super Grok optimization');
    fetch('/get-finals', {
        method: 'GET',
        credentials: 'include',
        mode: 'cors'
    })
        .then(response => {
            console.log('GET /get-finals response:', response.status, response.headers);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            return response.json();
        })
        .then(data => {
            console.log('Finals data received:', data);
            if (data.error) {
                alert(`${data.error}. Contact support if the issue persists.`);
                window.location.href = data.error.includes('Conference Finals') ? '/conferencefinals.html' : '/';
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
            // Set NBA Finals
            const eastWinner = data.conferenceFinals.eastWinner || 'East Winner';
            const westWinner = data.conferenceFinals.westWinner || 'West Winner';
            document.getElementById('finals-team1').querySelector('span').textContent = eastWinner;
            document.getElementById('finals-team1').querySelector('img').src = `/images/${teamImages[eastWinner] || 'placeholder.png'}`;
            document.getElementById('finals-team1').querySelector('img').alt = eastWinner;
            document.getElementById('finals-team2').querySelector('span').textContent = westWinner;
            document.getElementById('finals-team2').querySelector('img').src = `/images/${teamImages[westWinner] || 'placeholder.png'}`;
            document.getElementById('finals-team2').querySelector('img').alt = westWinner;
            // Define matchup for dropdown
            const matchup = {
                champion: [eastWinner, westWinner]
            };
            console.log('Matchup defined:', matchup); // Debug log
            // Populate dropdown with only the two teams in the matchup
            const select = document.getElementById('champion');
            if (select) {
                select.innerHTML = '<option value="" disabled selected>Select CHAMPION</option>';
                const teams = matchup.champion.filter(team => team && team !== 'East Winner' && team !== 'West Winner');
                console.log('Populating champion with teams:', teams); // Debug log
                if (teams.length === 2) {
                    teams.forEach(team => {
                        const option = document.createElement('option');
                        option.value = team;
                        option.textContent = team;
                        select.appendChild(option);
                    });
                } else {
                    console.warn('Invalid team count for champion:', teams);
                }
                select.value = data.finals.champion || '';
            }
        })
        .catch(error => {
            console.error('Fetch error for /get-finals:', error);
            alert('Failed to load Finals data. Please ensure you’re registered or contact support.');
            window.location.href = '/';
        });

    const finalsForm = document.getElementById('finals-form');
    if (!finalsForm) {
        console.error('Finals form not found. Check if id="finals-form" exists.');
        alert('Form error. Refresh or contact support.');
        return;
    }
    finalsForm.addEventListener('submit', submitFinals);
});

function submitFinals(event) {
    event.preventDefault();
    const formData = {
        champion: document.getElementById('champion')?.value || ''
    };

    if (!formData.champion) {
        alert('Please select the champion.');
        return;
    }

    console.log('Submitting Finals data:', formData);
    fetch('/submit-finals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ finals: formData }),
        credentials: 'include',
        mode: 'cors'
    })
        .then(response => {
            console.log('POST /submit-finals response:', response.status);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            return response.json();
        })
        .then(data => {
            console.log('Submit response:', data);
            if (data.error) alert(`Error: ${data.error}`);
            else {
                alert('Finals prediction saved successfully! Thank you for participating in the NBA Pool 2025!');
                window.location.href = '/summary.html'; // Redirect to a summary page or root
            }
        })
        .catch(error => {
            console.error('Submit error for /submit-finals:', error);
            alert('Failed to save Finals data. Please try again or contact support.');
        });
}