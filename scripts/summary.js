console.log("summary.js loaded");

document.addEventListener('DOMContentLoaded', () => {
    console.log("Fetching all predictions and user data...");
    const summaryContent = document.getElementById('summaryContent');
    const submitButton = document.getElementById('submitSelection');
    if (!summaryContent || !submitButton) {
        console.error("Summary content or submit button element not found!");
        return;
    }

    Promise.all([
        fetch('/get-playin', { method: 'GET', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin' }),
        fetch('/get-firstround-east', { method: 'GET', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin' }),
        fetch('/get-firstround-west', { method: 'GET', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin' }),
        fetch('/get-semifinals', { method: 'GET', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin' }),
        fetch('/get-conference-finals', { method: 'GET', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin' }),
        fetch('/get-finals', { method: 'GET', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin' })
    ])
    .then(responses => {
        const errors = responses.filter(response => !response.ok).map(response => `Status ${response.status} for ${response.url}`);
        if (errors.length > 0) {
            console.error("Failed fetches:", errors);
            throw new Error(`Failed fetches: ${errors.join(', ')}`);
        }
        return Promise.all(responses.map(response => response.json()));
    })
    .then(([playinData, eastData, westData, semifinalsData, conferenceFinalsData, finalsData]) => {
        console.log("All predictions received:", {
            playinData,
            eastData,
            westData,
            semifinalsData,
            conferenceFinalsData,
            finalsData
        });

        let content = '<h3>Play-In Predictions</h3>';
        content += `<p>Eastern 7th Seed: ${playinData.east7 || 'Not selected'}</p>`;
        content += `<p>Eastern 8th Seed: ${playinData.east8 || 'Not selected'}</p>`;
        content += `<p>Western 7th Seed: ${playinData.west7 || 'Not selected'}</p>`;
        content += `<p>Western 8th Seed: ${playinData.west8 || 'Not selected'}</p>`;

        content += '<h3>First Round East Predictions</h3>';
        content += (eastData.selections || []).map((team, index) => `<p>Matchup ${index + 1} Winner: ${team || 'Not selected'}</p>`).join('');

        content += '<h3>First Round West Predictions</h3>';
        content += (westData.selections || []).map((team, index) => `<p>Matchup ${index + 1} Winner: ${team || 'Not selected'}</p>`).join('');

        content += '<h3>Semifinals Predictions</h3>';
        content += (semifinalsData.selections || []).map((team, index) => `<p>Matchup ${index + 1} Winner: ${team || 'Not selected'}</p>`).join('');

        content += '<h3>Conference Finals Predictions</h3>';
        content += `<p>Eastern Conference Winner: ${conferenceFinalsData.selections?.[0] || 'Not selected'}</p>`;
        content += `<p>Western Conference Winner: ${conferenceFinalsData.selections?.[1] || 'Not selected'}</p>`;

        content += '<h3>Finals Predictions</h3>';
        content += `<p>Winner: ${finalsData.winner || 'Not selected'}</p>`;
        content += `<p>Series: ${finalsData.series || 'Not selected'}</p>`;
        content += `<p>MVP: ${finalsData.mvp || 'Not selected'}</p>`;
        content += `<p>Final Score: ${finalsData.team1Score || 'N/A'} - ${finalsData.team2Score || 'N/A'}</p>`;

        return fetch('/get-user', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin'
        })
        .then(response => {
            if (!response.ok) throw new Error(`User response: ${response.status}`);
            return response.json();
        })
        .then(userData => {
            console.log("User data received:", userData);
            content += '<h3>Personal Information</h3>';
            content += `<p>Name: ${userData.name || 'Not provided'}</p>`;
            content += `<p>Email: ${userData.email || 'Not provided'}</p>`;
            content += `<p>Phone: ${userData.phone || 'Not provided'}</p>`;
            content += `<p>Comments: ${userData.comments || 'Not provided'}</p>`;
            content += `<p>Payment Method: ${userData.paymentMethod || 'Not provided'}</p>`;
            summaryContent.innerHTML = content;

            // Add submit button functionality
            submitButton.addEventListener('click', () => {
                const selectionData = {
                    playin: {
                        east7: playinData.east7,
                        east8: playinData.east8,
                        west7: playinData.west7,
                        west8: playinData.west8
                    },
                    firstRoundEast: eastData.selections,
                    firstRoundWest: westData.selections,
                    semifinals: semifinalsData.selections,
                    conferenceFinals: conferenceFinalsData.selections,
                    finals: {
                        winner: finalsData.winner,
                        series: finalsData.series,
                        mvp: finalsData.mvp,
                        team1Score: finalsData.team1Score,
                        team2Score: finalsData.team2Score
                    },
                    userInfo: {
                        name: userData.name,
                        email: userData.email,
                        phone: userData.phone,
                        comments: userData.comments,
                        paymentMethod: userData.paymentMethod
                    }
                };

                console.log("Submitting consolidated selection:", selectionData);

                fetch('/submit-selection', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'same-origin',
                    body: JSON.stringify(selectionData)
                })
                .then(response => {
                    if (!response.ok) throw new Error(`Submit response: ${response.status}`);
                    return response.text();
                })
                .then(() => {
                    console.log("Selection submitted successfully");
                    alert("Your predictions have been submitted successfully!");
                    window.location.href = '/';
                })
                .catch(error => {
                    console.error('Error submitting selection:', error.message);
                    alert("An error occurred while submitting your predictions: " + error.message);
                });
            });
        });
    })
    .catch(error => {
        console.error('Error fetching predictions or user data:', error.message);
        summaryContent.innerHTML = '<p>Error loading predictions or personal information. Please ensure all steps are completed and try again, or contact support.</p>';
        if (error.message.includes('404')) {
            summaryContent.innerHTML += '<p>Missing data detected. Please complete all previous steps.</p>';
        }
    });
});
