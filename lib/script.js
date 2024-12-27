document.addEventListener('DOMContentLoaded', () => {
    const jackpotElement = document.getElementById('jackpot');
    const ticketLists = document.querySelectorAll('.ticket-list'); // Both lists

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
                const jackpot = data.displayJackpotDollars || 0;
                const ticketPackages = data.ticketPackages || [];

                // Display the jackpot
                jackpotElement.textContent = `$${jackpot.toLocaleString()}`;

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
    setInterval(fetchJackpot, 15000); // 30000ms = 30 seconds
});
