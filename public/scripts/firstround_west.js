document.addEventListener('DOMContentLoaded', () => {
    console.log('First Round West page loaded with Super Grok optimization');
    fetch('/get-firstround-west', {
        method: 'GET',
        credentials: 'include',
        mode: 'cors'
    })
        .then(response => {
            console.log('GET /get-firstround-west response:', response.status, response.headers);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            return response.json();
        })
        .then(data => {
            console.log('First Round West data received:', data);
            if (data.error) {
                alert(`${data.error}. Contact support if the issue persists.`);
                window.location.href = '/playin.html';
                return;
            }
            // Map team names to image file names (nicknames)
            const teamImages = {
                'OKC': 'thunder.png',
                'Denver': 'nuggets.png',
                'Los Angeles': 'lakers.png',
                'Memphis': 'grizzlies.png',
                'Suns': 'suns.png',
                'Pelicans': 'pelicans.png',
                'Kings': 'kings.png',
                'Spurs': 'spurs.png',
                'Timberwolves': 'timberwolves.png',
                'Golden State': 'warriors.png',
                'Houston': 'rockets.png'
            };
            // Update opponent labels and images with Play-In results
            document.getElementById('matchup1-opponent').textContent = data.playin.west8;
            document.getElementById('matchup1-opponent-img').src = `/images/${teamImages[data.playin.west8] || 'placeholder.png'}`;
            document.getElementById('matchup1-opponent-img').alt = data.playin.west8;
            document.getElementById('matchup2-opponent').textContent = data.playin.west7;
            document.getElementById('matchup2-opponent-img').src = `/images/${teamImages[data.playin.west7] || 'placeholder.png'}`;
            document.getElementById('matchup2-opponent-img').alt = data.playin.west7;
            document.getElementById('matchup3-opponent').textContent = 'Golden State';
            document.getElementById('matchup3-opponent-img').src = '/images/warriors.png';
            document.getElementById('matchup3-opponent-img').alt = 'Golden State Warriors';
            document.getElementById('matchup4-opponent').textContent = 'Houston';
            document.getElementById('matchup4-opponent-img').src = '/images/rockets.png';
            document.getElementById('matchup4-opponent-img').alt = 'Houston Rockets';
            // Define matchups based on Western Conference order
            const matchups = {
                matchup1: ['OKC', data.playin.west8],      // 1st vs 8th
                matchup2: ['Denver', data.playin.west7],    // 2nd vs 7th
                matchup3: ['Los Angeles', 'Golden State'],  // 3rd vs 6th
                matchup4: ['Memphis', 'Houston']            // 4th vs 5th
            };
            // Populate dropdowns
            const allElementsFound = populateDropdowns(matchups);
            if (!allElementsFound) {
                alert('Form error. Some elements are missing. Refresh or contact support.');
                return;
            }
            // Set previously saved values
            ['matchup1', 'matchup2', 'matchup3', 'matchup4'].forEach(id => {
                const select = document.getElementById(id);
                if (select) {
                    select.value = data.firstRoundWest[id] || '';
                }
            });
        })
        .catch(error => {
            console.error('Fetch error for /get-firstround-west:', error);
            alert('Failed to load First Round West data. Please ensure you’re registered or contact support.');
            window.location.href = '/';
        });

    const firstRoundWestForm = document.getElementById('firstround-west-form');
    if (!firstRoundWestForm) {
        console.error('First Round West form not found. Check if id="firstround-west-form" exists.');
        alert('Form error. Refresh or contact support.');
        return;
    }
    firstRoundWestForm.addEventListener('submit', submitFirstRoundWest);
});

function populateDropdowns(matchups) {
    let allElementsFound = true;
    ['matchup1', 'matchup2', 'matchup3', 'matchup4'].forEach(id => {
        const select = document.getElementById(id);
        if (!select) {
            console.error(`Select element with id '${id}' not found`);
            allElementsFound = false;
            return;
        }
        select.innerHTML = '<option value="" disabled selected>Select WINNER</option>';
        const teams = matchups[id];
        if (teams) {
            teams.forEach(team => {
                const option = document.createElement('option');
                option.value = team;
                option.textContent = team;
                select.appendChild(option);
            });
        } else {
            console.error(`No teams defined for matchup '${id}'`);
            allElementsFound = false;
        }
    });
    return allElementsFound;
}

function submitFirstRoundWest(event) {
    event.preventDefault();
    const formData = {
        matchup1: document.getElementById('matchup1')?.value || '',
        matchup2: document.getElementById('matchup2')?.value || '',
        matchup3: document.getElementById('matchup3')?.value || '',
        matchup4: document.getElementById('matchup4')?.value || ''
    };

    if (!formData.matchup1 || !formData.matchup2 || !formData.matchup3 || !formData.matchup4) {
        alert('Please select all winners.');
        return;
    }

    console.log('Submitting First Round West data:', formData);
    fetch('/submit-firstround-west', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstRoundWest: formData }),
        credentials: 'include',
        mode: 'cors'
    })
        .then(response => {
            console.log('POST /submit-firstround-west response:', response.status);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            return response.json();
        })
        .then(data => {
            console.log('Submit response:', data);
            if (data.error) alert(`Error: ${data.error}`);
            else {
                alert('First Round West data saved successfully!');
                window.location.href = '/semifinals.html';
            }
        })
        .catch(error => {
            console.error('Submit error for /submit-firstround-west:', error);
            alert('Failed to save First Round West data. Please try again or contact support.');
        });
}