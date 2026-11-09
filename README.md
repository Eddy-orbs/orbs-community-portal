# ORBS Community Portal

A community portal that brings Orbs network information, staking, governance, and community updates together in one place. It helps visitors explore the network and understand how to participate.

## Features

- Network overview and staking statistics
- Guardian directory and profiles
- DAO proposals and voting results
- Community updates and useful links
- A personal dashboard for viewing staking and voting activity through a read-only wallet connection
- English, Korean, and Japanese interfaces with light and dark themes

The portal displays information without requesting transaction signatures. Staking actions are handled by linked external services.

## Run locally

Requires Node.js 22 or later and npm.

After cloning or downloading the repository, open a terminal in the project directory:

```bash
npm ci
npm run build
npm start
```

Open <http://127.0.0.1:8894> in your browser. Live information requires an internet connection.

To use a different port:

```bash
PORT=3000 npm start
```

## Check and test

```bash
npm run check
npm test
```

To rebuild the browser bundles after making changes:

```bash
npm run build
```
