# Ticket API

Ticket API and Monitor for Phase Robotics. This will host an express server on port 1337 that monitors for changes to the Ticket Javascript and WASM files, as well as generate valid ATC & Checkout cookies.

## Installation

Use the package manager npm to install.

```bash
npm install .
node apiHandler.js
```

## ATC

```bash
Endpoint:
- http://ticket.phaserobotics.io/atc

Response (JSON):
{
  "status": "success",
  "type": "atc",
  "_ticket": "",
  "ticket": "",
  "timestamp": 1587102291014
}
```
## Checkout
```bash
Endpoint:
- http://ticket.phaserobotics.io/checkout?ticket={ticketFromResponseHeader}

Response (JSON):
{
  "status": "success",
  "type": "checkout",
  "_ticket": "",
  "ticket": "",
  "timestamp": 1587102291014
}
```
