document.addEventListener('DOMContentLoaded', () => {
    console.log('Registration page loaded');
    document.getElementById('registration-form').addEventListener('submit', submitRegistration);
});

function submitRegistration(event) {
    event.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const comments = document.getElementById('comments').value;
    const paymentMethod = document.getElementById('payment-method').value;

    const userData = {
        name,
        email,
        phone,
        comments,
        paymentMethod
    };

    console.log('Submitting registration:', userData);
    fetch('/submit-registration', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
        credentials: 'include' // Ensure cookies are sent
    })
    .then(response => {
        console.log('Fetch /submit-registration response status:', response.status);
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
        console.error('Error submitting registration:', error);
        alert('An error occurred. Please try again.');
    });
}