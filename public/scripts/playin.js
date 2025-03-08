document.addEventListener('DOMContentLoaded', () => {
    console.log('Play-In page loaded');
    fetch('/get-playin', {
        method: 'GET',
        credentials: 'include' // Ensure cookies are sent
    })
        .then(response => {
            console.log('Fetch /get-playin response status:', response.status);
            return response.json();
        })
        .then(data => {
            if (data.error) {
                alert('Error: ' + data.error);
                window.location.href = '/';
                return;
            }
            document.getElementById('east7').value = data.east7 || '';
            document.getElementById('east8').value = data.east8 || '';
            document.getElementById('west7').value = data.west7 || '';
            document.getElementById('west8').value = data.west8 || '';
            populateDropdowns();
        })
        .catch(error => {
            console.error('Error fetching Play-In data:', error);
            alert('Please complete registration first.');
            window.location.href = '/';
            populateDropdowns();
        });

    document.getElementById('playin-form').addEventListener('submit', submitPlayin);
});

function populateDropdowns() {
    const eastTeams = ['Pistons', 'Magic', 'Wizards', 'Hawks'];
    const westTeams = ['Rockets', 'Spurs', 'Trail Blazers', 'Jazz'];

    const east7Select = document.getElementById('east7');
    const east8Select = document.getElementById('east8');
    const west7Select = document.getElementById('west7');
    const west8Select = document.getElementById('west8');

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

function submitPlayin(event) {
    event.preventDefault();

    const formData = {
        east7: document.getElementById('east7').value,
        east8: document.getElementById('east8').value,
        west7: document.getElementById('west7').value,
        west8: document.getElementById('west8').value
    };

    if (!formData.east7 || !formData.east8 || !formData.west7 || !formData.west8) {
        alert('Please select all Play-In seeds.');
        return;
    }

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
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        credentials: 'include' // Ensure cookies are sent
    })
    .then(response => {
        console.log('Fetch /submit-playin response status:', response.status);
        return response.json();
    })
    .then(data => {
        console.log('Submit response:', data);
        if (data.error) {
            alert('Error: ' + data.error);
        } else {
            alert('Play-In data saved successfully!');
            window.location.href = '/firstround_east.html';
        }
    })
    .catch(error => {
        console.error('Error submitting Play-In data:', error);
        alert('An error occurred. Please try again.');
    });
}