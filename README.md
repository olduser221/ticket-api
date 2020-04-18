# Ticket API

Ticket API and Monitor for Phase Robotics. This will host an express server on port 1337 that monitors for changes to the Ticket Javascript and WASM files, as well as generate valid ATC & Checkout cookies.

## Installation

Use the package manager npm to install.

```bash
npm install .
node apiHandler.js
```

## Generate

```bash
Endpoint:
- http://ticket.phaserobotics.io/gen?ticket={ticketFromResponseHeader}

Response (JSON):
{
  "status": "success",
  "type": "atc",
  "_ticket": "",
  "ticket": "",
  "timestamp": 1587102291014
}
```
## Latest Files
```bash
Endpoint:
- http://ticket.phaserobotics.io/latest

Response (JSON):
{
  "javascript": "https://d17ol771963kd3.cloudfront.net/assets/t.367b90.js",
  "wasm": "https://d17ol771963kd3.cloudfront.net/assets/t.367b90.wasm"
}
```
