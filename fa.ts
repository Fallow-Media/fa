// deno-lint-ignore-file

(async () => {

    // TODO: Find a better way of checking this.
    const apiURL = window.location.host == 'fallowmedia.com' ? 'https://fallowmedia.com/api/fa' : 'http://localhost:5001';
    
    const getDataObject = () => {
        // Collect the data to send to the backend.
        return {
            url: window.location.pathname,
            ref: document.referrer,
            time: Date.now()
        }
    };

    // Send the data and handle the result.
    try {
        const res = await fetch(apiURL, {
            method: 'post',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(getDataObject())
          });

    } catch (error) {
        console.error(error);
    }
})();