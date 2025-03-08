// This is the complete index.js file. Paste this entire content into the file.
document.addEventListener('DOMContentLoaded', () => {
    function submitRegistration() {
        // Collect form data
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            comments: document.getElementById('comments').value,
            paymentMethod: document.getElementById('paymentMethod').value
        };

        // Basic client-side validation
        if (!formData.name || !formData.email || !formData.phone || !formData.paymentMethod) {
            alert('Please fill out all required fields.');
            return;
        }

        // Send data to server
        fetch('/submit-registration', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        })
        .then(response => {
            console.log('Response Status:', response.status);
            console.log('Response Headers:', response.headers.get('content-type'));

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                return response.text().then(text => {
                    throw new Error(`Expected JSON, but received: ${text.substring(0, 50)}...`);
                });
            }

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.error) {
                alert('Error: ' + data.error);
            } else {
                window.location.href = '/playin.html';
            }
        })
        .catch(error => {
            console.error('Error submitting registration:', error);
            alert('An error occurred. Please try again.');
        });
    }

    const nextButton = document.querySelector('button');
    if (nextButton) {
        nextButton.addEventListener('click', submitRegistration);
    } else {
        console.error('Next button not found in the DOM');
    }
});