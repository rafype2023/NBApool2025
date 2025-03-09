document.addEventListener('DOMContentLoaded', () => {
    console.log('Play-In page loaded with Super Grok optimization');
    
    // Define Play-In teams
    const eastPlayinTeams = ['Atlanta', 'Miami', 'Orlando', 'Washington'];
    const westPlayinTeams = ['New Orleans', 'San Antonio', 'Houston', 'Utah'];

    // Populate dropdowns with teams
    const east7Select = document.getElementById('east7');
    const east8Select = document.getElementById('east8');
    const west7Select = document.getElementById('west7');
    const west8Select = document.getElementById('west8');

    if (!east7Select || !east8Select || !west7Select || !west8Select) {
        console.error('One or more Play-In dropdowns not found. Check if ids exist.');
        alert('Form error. Refresh or contact support.');
        return;
    }

    // Populate Eastern Conference dropdowns
    eastPlayinTeams.forEach(team => {
        const option7 = document.createElement('option');
        option7.value = team;
        option7.textContent = team;
        east7Select.appendChild(option7);

        const option8 = document.createElement('option');
        option8.value = team;
        option8.textContent = team;
        east8Select.appendChild(option8);
    });

    // Populate Western Conference dropdowns
    westPlayinTeams.forEach(team => {
        const option7 = document.createElement('option');
        option7.value = team;
        option7.textContent = team;
        west7Select.appendChild(option7);

        const option8 = document.createElement('option');
        option8.value = team;
        option8.textContent = team;
        west8Select.appendChild(option8);
    });

    // Fetch existing selections from the server
    fetch('/get-playin', {
        method: 'GET',
        credentials: 'include',
        mode: 'cors'
    })
        .then(response => {
            console.log('GET /get-playin response:', response.status, response.headers);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            return response.json();
        })
        .then(data => {
            console.log('Play-In data received:', data);
            if (data.error) {
                alert(`${data.error}. Contact support if the issue persists.`);
                window.location.href = '/';
                return;
            }
            // Set existing selections
            east7Select.value = data.playin.east7 || '';
            east8Select.value = data.playin.east8 || '';
            west7Select.value = data.playin.west7 || '';
            west8Select.value = data.playin.west8 || '';
        })
        .catch(error => {
            console.error('Fetch error for /get-playin:', error);
            alert('Failed to load Play-In data. Please ensure you’re registered or contact support.');
            window.location.href = '/';
        });

    const playinForm = document.getElementById('playin-form');
    if (!playinForm) {
        console.error('Play-In form not found. Check if id="playin-form" exists.');
        alert('Form error. Refresh or contact support.');
        return;
    }
    playinForm.addEventListener('submit', submitPlayin);
});

function submitPlayin(event) {
    event.preventDefault();
    const formData = {
        east7: document.getElementById('east7')?.value || '',
        east8: document.getElementById('east8')?.value || '',
        west7: document.getElementById('west7')?.value || '',
        west8: document.getElementById('west8')?.value || ''
    };

    // Validate selections
    if (!formData.east7 || !formData.east8 || !formData.west7 || !formData.west8) {
        alert('Please select all Play-In winners.');
        return;
    }

    // Ensure 7th and 8th seeds are different for each conference
    if (formData.east7 === formData.east8) {
        alert('Eastern Conference 7th and 8th seeds must be different teams.');
        return;
    }
    if (formData.west7 === formData.west8) {
        alert('Western Conference 7th and 8th seeds must be different teams.');
        return;
    }

    console.log('Submitting Play-In data:', formData);
    fetch('/submit-playin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playin: formData }),
        credentials: 'include',
        mode: 'cors'
    })
        .then(response => {
            console.log('POST /submit-playin response:', response.status);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            return response.json();
        })
        .then(data => {
            console.log('Submit response:', data);
            if (data.error) alert(`Error: ${data.error}`);
            else {
                alert('Play-In data saved successfully!');
                window.location.href = '/firstround_east.html';
            }
        })
        .catch(error => {
            console.error('Submit error for /submit-playin:', error);
            alert('Failed to save Play-In data. Please try again or contact support.');
        });
}