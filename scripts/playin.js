// Fetch existing Play-In data when the page loads
document.addEventListener('DOMContentLoaded', () => {
    fetch('/get-playin')
        .then(response => response.json())
        .then(data => {
            if (!data.error) {
                // Populate dropdowns with existing selections
                document.getElementById('east7').value = data.east7 || '';
                document.getElementById('east8').value = data.east8 || '';
                document.getElementById('west7').value = data.west7 || '';
                document.getElementById('west8').value = data.west8 || '';
            }
            // Populate dropdown options
            populateDropdowns();
        })
        .catch(error => {
            console.error('Error fetching Play-In data:', error);
            // Populate dropdowns even if no data is found
            populateDropdowns();
        });
});

// Function to populate dropdowns with team options
function populateDropdowns() {
    const eastTeams = ['Pistons', 'Magic', 'Wizards', 'Hawks'];
    const westTeams = ['Rockets', 'Spurs', 'Trail Blazers', 'Jazz'];

    const east7Select = document.getElementById('east7');
    const east8Select = document.getElementById('east8');
    const west7Select = document.getElementById('west7');
    const west8Select = document.getElementById('west8');

    // Populate Eastern Conference teams
    eastTeams.forEach(team => {
        const option7 = document.createElement('option');
        option7.value = team;
        option7.textContent = team;
        east7Select.appendChild(option7);

        const option8 = document.createElement('option');
        option8.value = team;
        option8.textContent = team;
        east8Select.appendChild(option8);
    });

    // Populate Western Conference teams
    westTeams.forEach(team => {
        const option7 = document.createElement('option');
        option7.value = team;
        option7.textContent = team;
        west7Select.appendChild(option7);

        const option8 = document.createElement('option');
        option8.value = team;
        option8.textContent = team;
        west8Select.appendChild(option8);
    });
}

// Handle Play-In form submission
function submitPlayin() {
    const formData = {
        east7: document.getElementById('east7').value,
        east8: document.getElementById('east8').value,
        west7: document.getElementById('west7').value,
        west8: document.getElementById('west8').value
    };

    // Basic client-side validation
    if (!formData.east7 || !formData.east8 || !formData.west7 || !formData.west8) {
        alert('Please select all Play-In seeds.');
        return;
    }

    // Ensure East 7 and East 8 are different teams
    if (formData.east7 === formData.east8) {
        alert('Eastern Conference 7th and 8th seeds must be different teams.');
        return;
    }

    // Ensure West 7 and West 8 are different teams
    if (formData.west7 === formData.west8) {
        alert('Western Conference 7th and 8th seeds must be different teams.');
        return;
    }

    // Submit data to server
    fetch('/submit-playin', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert('Error: ' + data.error);
        } else {
            window.location.href = '/firstround_east.html';
        }
    })
    .catch(error => {
        console.error('Error submitting Play-In data:', error);
        alert('An error occurred. Please try again.');
    });
}
