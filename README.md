# APMC Desktop Applications

This repository contains two Electron + React desktop applications for agricultural trading workflows:

- `MD` - MD AgriTrader application
- `PH` - PH AgriTrader application

Each app follows the same general structure:

```text
APMC/
|-- MD/
|   |-- assets/          # icons and desktop assets
|   |-- client/          # React frontend
|   |-- database.js      # database setup/helpers
|   |-- main.js          # Electron main process
|   |-- preload.js       # Electron preload bridge
|   |-- server.js        # Express backend
|   |-- package.json     # Electron/backend scripts
|-- PH/
|   |-- assets/
|   |-- client/
|   |-- database.js
|   |-- main.js
|   |-- preload.js
|   |-- server.js
|   |-- package.json
|-- .gitignore
|-- README.md
```

## Tech Stack

- Electron
- React
- Express
- SQL.js

## Getting Started

Install dependencies for both desktop apps and their React clients:

```bash
cd MD
npm install
cd client
npm install

cd ../../PH
npm install
cd client
npm install
```

## Running The Apps

Run MD in development:

```bash
cd MD
npm run dev
```

Run PH in development:

```bash
cd PH
npm run dev
```

The `dev` command starts:

- the backend server
- the React client
- the Electron desktop shell

## Build Commands

Build the MD desktop application:

```bash
cd MD
npm run build
```

Build the PH desktop application:

```bash
cd PH
npm run build
```

## Important Notes Before Pushing

- Do not commit `node_modules`, `build`, `dist`, `.exe`, or `.zip` files.
- This repository currently has nested `.git` folders inside `MD/client` and `PH/client`. Those should be removed before the first parent repository commit, otherwise Git may treat them as embedded repositories.
- `package-lock.json` files should be committed.

## First-Time Git Setup

Run these commands from the repository root after the nested client `.git` folders are removed:

```bash
git init
git branch -M main
git remote add origin https://github.com/Venkatesh-Tadpatri/Personal.git
git add .
git commit -m "Initial project setup"
git push -u origin main
```

If `origin` already exists, update it with:

```bash
git remote set-url origin https://github.com/Venkatesh-Tadpatri/Personal.git
```

## Existing App Scripts

Inside both `MD` and `PH`:

```bash
npm run start
npm run server
npm run client
npm run dev
npm run build:client
npm run build
```

Inside both `MD/client` and `PH/client`:

```bash
npm start
npm run build
npm test
```
