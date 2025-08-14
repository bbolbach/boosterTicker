<script>
document.addEventListener('DOMContentLoaded', () => {
    const jackpotElement = document.getElementById('jackpot');
    const ticketLists = document.querySelectorAll('.ticket-list'); // Both lists

    // ORDS endpoint that returns {"items":[{"RAFFLE_URL":"https://..."}]}
    const configEndpoint = 'https://apex.oracle.com/ords/stvm_booster/raffle/current';
    let raffleApiUrl = null; // will be set after config fetch

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

    // Fetch the current raffle API URL from APEX/ORDS
    function fetchRaffleApiUrl() {
        return fetch(configEndpoint)
            .then(res => {
                if (!res.ok) throw new Error(`Config HTTP error: ${res.status}`);
                return res.json();
            })
            .then(json => {
                const url =
                    (json.items && json.items[0] && (json.items[0].RAFFLE_URL || json.items[0].raffle_url)) || null;
                if (!url) throw new Error('No RAFFLE_URL in config response');
                raffleApiUrl = url;
                return raffleApiUrl;
            });
    }

    // Function to fetch and update the jackpot and ticket pricing
    function fetchJackpot() {
        // Ensure we have the raffle API URL first
        const ready = raffleApiUrl ? Promise.resolve(raffleApiUrl) : fetchRaffleApiUrl();

        ready
          .then(url => fetch(url))
          .then(response => {
              if (!response.ok) {
                  throw new Error(`HTTP error! Status: ${response.status}`);
              }
              return response.json();
          })
          .then(apiResponse => {
              const data = apiResponse.data?.data || {};
              const jackpot = parseInt(data.displayJackpotDollars || 0, 10);
              const ticketPackages = data.ticketPackages || [];

              // Display the jackpot
              jackpotElement.textContent = `$${jackpot.toLocaleString()}`;

              // Update the jackpot font size
              updateJackpotFontSize(jackpot);

              // Clear and populate both ticket lists
              ticketLists.forEach(ticketList => {
                  ticketList.innerHTML = '';
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

    // Initial fetch on page load: get URL then load jackpot once
    fetchRaffleApiUrl()
      .then(() => fetchJackpot())
      .catch(err => {
          console.error('Error fetching raffle API URL:', err);
          jackpotElement.textContent = 'Error loading jackpot.';
      });

    // Refresh every 15s (uses the cached raffleApiUrl)
    setInterval(fetchJackpot, 15000);
});
</script>
