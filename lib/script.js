document.addEventListener('DOMContentLoaded', () => {
    const jackpotElement = document.getElementById('jackpot');
    const ticketLists = document.querySelectorAll('.ticket-list'); // Both lists

    // Function to update the font size based on the jackpot value
    function updateJackpotFontSize(jackpot) {
        const jackpotH1 = document.querySelector('.jackpot-box h1');
        if (jackpot < 100) {
            jackpotH1.style.fontSize = '23vw';
        } else if (jackpot >= 100 && jackpot <= 999) {
            jackpotH1.style.fontSize = '21vw';
        } else {
            jackpotH1.style.fontSize = '17vw';
        }
    }

    // Function to fetch and update the jackpot and ticket pricing
    function fetchJackpot() {
        fetch('https://apic.rafflebox.ca/event-service/v2/events/2024-25-bbk')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(apiResponse => {
                const data = apiResponse.data.data; // Navigate to the correct part of the response
                const jackpot = parseInt(data.displayJackpotDollars || 0, 10); // Ensure the value is an integer
                const ticketPackages = data.ticketPackages || [];

                // Display the jackpot
                jackpotElement.textContent = `$${jackpot.toLocaleString()}`;

                // Update the jackpot font size
                updateJackpotFontSize(jackpot);

                // Clear and populate both ticket lists
                ticketLists.forEach(ticketList => {
                    ticketList.innerHTML = ''; // Clear existing list
                    ticketPackages.forEach(ticket => {
                        const li = document.createElement('li');
                        li.textContent = `${ticket.numTickets} tickets for $${ticket.price}`;
                        ticketList.appendChild(li);
                    });
                });
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                jackpotElement.textContent = 'Error loading jackpot.';
                ticketLists.forEach(ticketList => {
                    ticketList.innerHTML = '<li>Error loading ticket pricing.</li>';
                });
            });
    }

    // Initial fetch when the page loads
    fetchJackpot();

    // Set an interval to reload the jackpot and ticket pricing every 30 seconds
    setInterval(fetchJackpot, 15000); // 15000ms = 15 seconds
});
