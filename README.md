# Perhap Ticket API
Ticket API for generating valid ticket cookies for supremenewyork.com, this project is not being used anymore so im making this repo public. With some adaptation this can still be used but ive decided to go a much easier and more reliable route.

Uses Nodejs and Deno to simulate a browser environment to run the Ticket JS file outside of the browser and generate valid ticket cookies.

This was also made to run on Heroku but obviously this will host a local server with a few endpoints listed in the **perhap.js** file. This will need work to get working with the new versions of ticket and their new checks but this will do most of the work if you use it.
