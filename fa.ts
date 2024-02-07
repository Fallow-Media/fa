// deno-lint-ignore-file

(async () => {

    // TODO: Find a better way of checking this.
    const apiURL = window.location.host == 'fallowmedia.com' ? 'https://fallowmedia.com/api/fa' : 'http://localhost:5001';

    const getCookieValue = (cookieName: string) => {
        // Get the value of the specified cookie.
        const cookieValue = document.cookie
        .split("; ")
        .find((row: string) => row.startsWith(`${cookieName}=`))
        ?.split("=")[1];
    
        // If the value exists, return it. Otherwise, return false.
        if (cookieValue) {
            return cookieValue;
        } else {
            return false;
        }
    };
    
    const setCookieValue = (name: string, sessionID: string) => {
        document.cookie = `${name}=${sessionID}; max-age=${60 * 60 * 24}; secure`;
    }
    
    const getDataObject = () => {
        // Collect the data to send to the backend.
        return {
            url: window.location.pathname,
            fa_sid: getCookieValue("fa_sid"),
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
          }).then(response => response.json());

        if (res.sessionID) {
            setCookieValue("fa_sid", res.sessionID);
        }
    } catch (error) {
        console.error(error);
    }
})();