# FA – Fallow Analytics

A very simple, privacy-focused script for tracking basic usage on fallowmedia.com.

## Aims

– Anonymous: no identifiable information is stored.
– Private: shares no information with other sites or third-parties.
– Minimal: tracks as few metrics as practicable.

## How It Works

fa.js is a single-line script included on all pages on fallowmedia.com. 

Its first job is to check whether a sessionID cookie is present in the browser. It collects the following information: 
– the sessionID value (if present)
– the url of the current page
– the current date and time
– referral (where the user has come from, if present)

fa.js sends that information to a backend service. The backend service then:
– salts and hashes the IP address of the request to produce an anonymous sessionID (if one does not already exist).
– stores the sessionID, current URL, datetime, and referer (if present) in the database.
– sends the new sessionID back to the client, if necessary.

Finally, fa.js receives that sessionID and sets a new sessionID cookie if necessary.

## What It Tracks

From this minimal information we should be able to track:
– number of site visits over time
– number of visits to particular pages
– user journeys from page to page
– where users have come from