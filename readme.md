# FA – Fallow Analytics

A very simple, privacy-focused script for tracking basic usage on fallowmedia.com.

## Aims

- Anonymous: no identifiable information is stored.
- Private: shares no information with other sites or third-parties.
- Minimal: tracks as few metrics as practicable.

## How It Works

fa.js is a tiny, single-line script included on all pages on fallowmedia.com. It collects the following information: 
- the url of the current page
- the current date and time
- referral (where the user has come from, if present)

fa.js sends that information to a backend service. The backend service then:
- salts and hashes the IP address of the request to produce an anonymised sessionID (salts are rotated every 24 hours).
- stores the sessionID, current URL, datetime, and referrer in the database.
- makes that information available to an internal dashboard. (Note: dashboard to come later.)

## What It Tracks

From this minimal information we should be able to track:
- number of site visits over time
- number of visits to particular pages
- user journeys from page to page
- where users have come from

In essence, fa.js is inspired by [Plausible](https://github.com/plausible/analytics), another privacy-focused, open-source analytics software. As they say: "Measure traffic, not individuals. No personal data or IP addresses are ever stored in our database. We don't use cookies or any other persistent identifiers."

## TODO
- Collect the information entirely on the backend – it's all in the request anyway, no need to send JSON.
- Build the dashboard.