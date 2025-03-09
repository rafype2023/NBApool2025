document.addEventListener('DOMContentLoaded', () => {
    console.log('Play-In page loaded with Super Grok optimization');
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
            // Populate dropdowns with existing data
            document.getElementById('east7').value = data.playin.east7 || '';
            document.getElementById('east8').value = data.playin.east8 || '';
            document.getElementById('west7').value = data.playin.west7 || '';
            document.getElementById('west8').value = data.playin.west8 || '';
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

    if (!formData.east7 || !formData.east8 || !formData.west7 || !formData.west8) {
        alert('Please select all Play-In winners.');
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