
# Sylla

This project started as a static UI export for the Sylla web app and is now wired to a local backend included in this repository.

## Run the app

1. Install dependencies:

   `npm install`

2. Optional: configure Gemini-backed slide generation and suggestions by setting
   `GEMINI_API_KEY` in `.env` or your shell environment. You can also override the
   model with `GEMINI_MODEL`.

3. Start the frontend and backend together:

   `npm run dev`

4. Or start only the API server:

   `npm run dev:api`

Without a Gemini key, the app still creates slide decks and suggestions with a local
safe fallback outline so the UI remains usable.

## Build

Run `npm run build` to create the production frontend build.

Run `npm start` to serve the built frontend and API from the local Node server.
  
