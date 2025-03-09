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
                alert(`Error: ${data.error}. Redirecting to registration.`);
                window.location.href = '/';
                return;
            }
            // Safely populate dropdowns with existence check
            const matchups = ['matchup1', 'matchup2', 'matchup3', 'matchup4'];
            let allElementsFound = true;
            matchups.forEach(id => {
                const select = document.getElementById(id);
                if (select) {
                    select.value = data[id] || '';
                } else {
                    console.error(`Select element with id '${id}' not found`);
                    allElementsFound = false;
                }
            });
            if (!allElementsFound) {
                alert('Form error. Some elements are missing. Refresh or contact support.');
                return;
            }
            populateDropdowns();
        })
        .catch(error => {
            console.error('Fetch error for /get-firstround-east:', error);
            alert('Failed to load First Round East data. Please ensure you’re registered or contact support.');
            window.location.href = '/';
            populateDropdowns();
        });

    const firstRoundEastForm = document.getElementById('firstround-east-form');
    if (!firstRoundEastForm) {
        console.error('First Round East form not found. Check if id="firstround-east-form" exists.');
        alert('Form error. Refresh or contact support.');
        return;
    }
    firstRoundEastForm.addEventListener('submit', submitFirstRoundEast);
});

function populateDropdowns() {
    const teams = ['Bucks', 'Hawks', 'Celtics', 'Knicks', '7th Seed', '8th Seed', '6th Seed', 'Sixers'];
    ['matchup1', 'matchup2', 'matchup3', 'matchup4'].forEach(id => {
        const select = document.getElementById(id);
        if (select) {
            select.innerHTML = '<option value="" disabled selected>Select WINNER</option>';
            teams.forEach(team => {
                const option = document.createElement('option');
                option.value = team;
                option.textContent = team;
                select.appendChild(option);
            });
        } else {
            console.error(`Select element with id '${id}' not found during population`);
        }
    });
}

function submitFirstRoundEast(event) {
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