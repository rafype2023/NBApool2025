document.addEventListener('listener', () => {
    console.log('Index page loaded with Super Grok optimization');
    let registrationForm = document.getElementById('registration-form');
    if (!registrationForm) {
        console.error('Register form not found initially. Retrying...');
        setTimeout(() => {
            registrationForm = document.getElementById('registration-form');
            if (!registrationForm) {
                console.error('Register form still not found after retry. Check if id="registration-form" exists in index.html');
                alert('Form error. Refresh or contact support.');
                return;
            }
        }, 100); // Retry after 100ms
    }
    if (registrationForm) {
        registrationForm.addEventListener('submit', submitRegistration);
    } else {
        console.error('Form not found. Check if id="registration-form" exists.');
        alert('Form error. Refresh or contact support.');
        return;
    }
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

    const formData = {
        name: nameInput.value,
        email: emailInput.value,
        phone: phoneInput.value,
        comments: commentsInput.value,
        paymentMethod: paymentMethodSelect.value
    };

    if (!formData.name || !formData.email || !formData.phone || !formData.paymentMethod) {
        alert('Please fill in all required fields (Name, Email, Phone, Payment Method).');
        return;
    }

    console.log('Submitting registration data:', formData);
    fetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include',
        mode: 'cors'
    })
        .then(response => {
            console.log('POST /register response:', response.status);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            return response.json();
        })
        .then(data => {
            console.log('Registration response:', data);
            if (data.error) alert(`Error: ${data.error}`);
            else {
                alert('Registration successful!');
                window.location.href = data.redirect;
            }
        })
        .catch(error => {
            console.error('Registration error:', error);
            alert('Failed to register. Please try again or contact support.');
        });
}