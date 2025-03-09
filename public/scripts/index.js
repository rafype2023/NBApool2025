document.addEventListener('DOMContentLoaded', () => {
    console.log('Index page loaded with Super Grok optimization');
    const registerForm = document.getElementById('register-form');
    if (!registerForm) {
        console.error('Register form not found. Check if id="register-form" exists.');
        alert('Form error. Refresh or contact support.');
        return;
    }

    // Check if all required elements exist
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const commentsInput = document.getElementById('comments');
    const paymentMethodSelect = document.getElementById('paymentMethod');

    if (!nameInput || !emailInput || !phoneInput || !paymentMethodSelect) {
        console.error('One or more form fields are missing. Check form inputs.');
        alert('An error occurred: Form fields are missing. Please refresh or contact support.');
        return;
    }

    const userData = {
        name: nameInput.value,
        email: emailInput.value,
        phone: phoneInput.value,
        comments: commentsInput.value,
        paymentMethod: paymentMethodSelect.value
    };

    console.log('Submitting registration:', userData);
    fetch('/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData),
        credentials: 'include' // Ensure cookies are sent
    })
        .then(response => {
            console.log('Response from /register:', response.status, response.statusText);
            if (!response.ok) {
                return response.json().then(errData => {
                    throw new Error(`HTTP error! Status: ${response.status}, Message: ${errData.error}`);
                });
            }
            return response.json();
        })
        .then(data => {
            console.log('Registration response:', data);
            if (data.error) {
                alert('Error: ' + data.error);
            } else {
                alert('Registration successful!');
                window.location.href = '/playin.html';
            }
        })
        .catch(error => {
            console.error('Fetch error for /register:', error);
            alert('Failed to register. Please try again or contact support.');
        });

    registerForm.addEventListener('submit', submitRegistration);
});

function submitRegistration(event) {
    event.preventDefault();
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const commentsInput = document.getElementById('comments');
    const paymentMethodSelect = document.getElementById('paymentMethod');

    if (!nameInput || !emailInput || !phoneInput || !paymentMethodSelect) {
        console.error('One or more form fields are missing. Check form inputs.');
        alert('An error occurred: Form fields are missing. Please refresh or contact support.');
        return;
    }

    const userData = {
        name: nameInput.value,
        email: emailInput.value,
        phone: phoneInput.value,
        comments: commentsInput.value,
        paymentMethod: paymentMethodSelect.value
    };

    console.log('Submitting registration:', userData);
    fetch('/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData),
        credentials: 'include' // Ensure cookies are sent
    })
        .then(response => {
            console.log('Response from /register:', response.status, response.statusText);
            if (!response.ok) {
                return response.json().then(errData => {
                    throw new Error(`HTTP error! Status: ${response.status}, Message: ${errData.error}`);
                });
            }
            return response.json();
        })
        .then(data => {
            console.log('Registration response:', data);
            if (data.error) {
                alert('Error: ' + data.error);
            } else {
                alert('Registration successful!');
                window.location.href = '/playin.html';
            }
        })
        .catch(error => {
            console.error('Fetch error for /register:', error);
            alert('Failed to register. Please try again or contact support.');
        });
}