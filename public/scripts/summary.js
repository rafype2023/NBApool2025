document.addEventListener('DOMContentLoaded', () => {
    console.log('Summary page loaded with Super Grok optimization');
    fetch('/get-summary', {
        method: 'GET',
        credentials: 'include',
        mode: 'cors'
    })
        .then(response => {
            console.log('GET /get-summary response:', response.status, response.headers);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            return response.json();
        })
        .then(data => {
            console.log('Summary data received:', data);
            if (data.error) {
                alert(`${data.error}. Contact support if the issue persists.`);
                window.location.href = '/';
                return;
            }
            // Display Personal Information
            document.getElementById('name').textContent = data.personalData.name || 'N/A';
            document.getElementById('email').textContent = data.personalData.email || 'N/A';
            document.getElementById('phone').textContent = data.personalData.phone || 'N/A';
            document.getElementById('comments').textContent = data.personalData.comments || 'None';
            document.getElementById('paymentMethod').textContent = data.personalData.paymentMethod || 'N/A';
            // Display Play-In Selections
            document.getElementById('playin-east7').textContent = data.selections.playin.east7 || 'Not selected';
            document.getElementById('playin-east8').textContent = data.selections.playin.east8 || 'Not selected';
            document.getElementById('playin-west7').textContent = data.selections.playin.west7 || 'Not selected';
            document.getElementById('playin-west8').textContent = data.selections.playin.west8 || 'Not selected';
            // Display First Round East Selections
            document.getElementById('firstRoundEast-matchup1').textContent = data.selections.firstRoundEast.matchup1 || 'Not selected';
            document.getElementById('firstRoundEast-series1').textContent = data.selections.firstRoundEast.series1 || 'Not selected';
            document.getElementById('firstRoundEast-matchup2').textContent = data.selections.firstRoundEast.matchup2 || 'Not selected';
            document.getElementById('firstRoundEast-series2').textContent = data.selections.firstRoundEast.series2 || 'Not selected';
            document.getElementById('firstRoundEast-matchup3').textContent = data.selections.firstRoundEast.matchup3 || 'Not selected';
            document.getElementById('firstRoundEast-series3').textContent = data.selections.firstRoundEast.series3 || 'Not selected';
            document.getElementById('firstRoundEast-matchup4').textContent = data.selections.firstRoundEast.matchup4 || 'Not selected';
            document.getElementById('firstRoundEast-series4').textContent = data.selections.firstRoundEast.series4 || 'Not selected';
            // Display First Round West Selections
            document.getElementById('firstRoundWest-matchup1').textContent = data.selections.firstRoundWest.matchup1 || 'Not selected';
            document.getElementById('firstRoundWest-series1').textContent = data.selections.firstRoundWest.series1 || 'Not selected';
            document.getElementById('firstRoundWest-matchup2').textContent = data.selections.firstRoundWest.matchup2 || 'Not selected';
            document.getElementById('firstRoundWest-series2').textContent = data.selections.firstRoundWest.series2 || 'Not selected';
            document.getElementById('firstRoundWest-matchup3').textContent = data.selections.firstRoundWest.matchup3 || 'Not selected';
            document.getElementById('firstRoundWest-series3').textContent = data.selections.firstRoundWest.series3 || 'Not selected';
            document.getElementById('firstRoundWest-matchup4').textContent = data.selections.firstRoundWest.matchup4 || 'Not selected';
            document.getElementById('firstRoundWest-series4').textContent = data.selections.firstRoundWest.series4 || 'Not selected';
            // Display Semifinals Selections
            document.getElementById('semifinals-east1').textContent = data.selections.semifinals.east1 || 'Not selected';
            document.getElementById('semifinals-eastSeries1').textContent = data.selections.semifinals.eastSeries1 || 'Not selected';
            document.getElementById('semifinals-east2').textContent = data.selections.semifinals.east2 || 'Not selected';
            document.getElementById('semifinals-eastSeries2').textContent = data.selections.semifinals.eastSeries2 || 'Not selected';
            document.getElementById('semifinals-west1').textContent = data.selections.semifinals.west1 || 'Not selected';
            document.getElementById('semifinals-westSeries1').textContent = data.selections.semifinals.westSeries1 || 'Not selected';
            document.getElementById('semifinals-west2').textContent = data.selections.semifinals.west2 || 'Not selected';
            document.getElementById('semifinals-westSeries2').textContent = data.selections.semifinals.westSeries2 || 'Not selected';
            // Display Conference Finals Selections
            document.getElementById('conferenceFinals-eastWinner').textContent = data.selections.conferenceFinals.eastWinner || 'Not selected';
            document.getElementById('conferenceFinals-eastSeries').textContent = data.selections.conferenceFinals.eastSeries || 'Not selected';
            document.getElementById('conferenceFinals-westWinner').textContent = data.selections.conferenceFinals.westWinner || 'Not selected';
            document.getElementById('conferenceFinals-westSeries').textContent = data.selections.conferenceFinals.westSeries || 'Not selected';
            // Display Finals Selections
            document.getElementById('finals-champion').textContent = data.selections.finals.champion || 'Not selected';
            document.getElementById('finals-seriesLength').textContent = data.selections.finals.seriesLength || 'Not selected';
            document.getElementById('finals-mvp').textContent = data.selections.finals.mvp || 'Not selected';
            document.getElementById('finals-finalScore').textContent = data.selections.finals.finalScore || 'Not selected';
        })
        .catch(error => {
            console.error('Fetch error for /get-summary:', error);
            alert('Failed to load Summary data. Please ensure you’re registered or contact support.');
            window.location.href = '/';
        });
});

// Start Over function
function startOver() {
    fetch('/start-over', {
        method: 'POST',
        credentials: 'include',
        mode: 'cors'
    })
        .then(response => {
            console.log('POST /start-over response:', response.status);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            return response.json();
        })
        .then(data => {
            console.log('Start-over response:', data);
            if (data.error) alert(`Error: ${data.error}`);
            else {
                alert('Starting over! Redirecting to registration.');
                window.location.href = data.redirect;
            }
        })
        .catch(error => {
            console.error('Start-over error:', error);
            alert('Failed to start over. Please try again or contact support.');
        });
}