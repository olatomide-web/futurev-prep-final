# Futurev Prep — Multi-Subject WAEC MVP

A polished, responsive prototype for BuildFest Track 4, Case Study 1: AI Education Access Assistant.

## Product scope
Futurev Prep is a multi-subject WAEC preparation platform. The product UI supports:
- Biology
- Chemistry
- Physics
- Mathematics
- English Language
- Economics
- Government
- Geography
- Literature in English
- Financial Accounting
- Commerce
- Agricultural Science
- Computer Studies
- CRS
- IRS

Each subject has a topic catalogue. The current fully demonstrated real-question learning loop is Biology → Osmosis & Diffusion.

## Demonstrated learning loop
Dashboard → subject → topic → simplified lesson → five supplied seed questions → feedback → coach line → pass at 4/5 → fresh WAEC-style follow-up set → progress summary.

## AI Coach
A lightweight chat UI is included. The browser prototype uses local demo responses so no API key is exposed. Production should connect the same interface to a server-side LLM API and approved syllabus/question sources.

## Source note
The five Osmosis & Diffusion seed questions in this prototype are the questions supplied by the project owner. They should be paired with exact WAEC source references before public submission if those references are available.

## Run
Open `index.html` in a modern browser or serve this folder with a static web server.

## Seed flow fix
The Learn → Start practice action explicitly initializes the Biology → Osmosis & Diffusion seed set and resets stale session state. The quiz renderer also validates the selected question set before rendering.

## AI API debugging / deployment

This build now uses a real server-side Vercel function at `/api/chat` instead of a local fake Coach response.

### Browser diagnostics
Open DevTools → Console and run:

```js
checkFuturevAPI()
```

This reports whether the deployed function sees `OPENAI_API_KEY` without exposing the key.

For a raw minimal AI test:

```js
testFuturevAI()
```

The browser logs `CALL FIRED`, request payload (without secrets), response status/body, and any failure. The server logs the same request ID, model, prompt, upstream status, and failure details.

### Vercel environment variable
Set this in Vercel → Project → Settings → Environment Variables:

- `OPENAI_API_KEY` = your OpenAI API key
- optional `OPENAI_MODEL` = model ID; defaults to `gpt-5.6-luna`

Redeploy after changing environment variables.

The API key must stay server-side. Do not put it in `app.js`, HTML, or `NEXT_PUBLIC_*`/browser-exposed variables.


## Real AI API diagnostics

The AI Coach now uses the server-side Vercel function `/api/chat`. The browser never receives the API key.

Open DevTools → Console after deployment:

```js
checkFuturevAPI()
```

This checks whether the server sees `OPENAI_API_KEY`. Then run:

```js
testFuturevAI()
```

That performs a minimal real AI request. Normal Coach requests log `CALL FIRED`, payload, response status/body, and errors in the browser. Vercel logs include a request ID, model, prompt, upstream status, and API configuration errors.

For Vercel, set `OPENAI_API_KEY` in Project Settings → Environment Variables and redeploy. Optionally set `OPENAI_MODEL`; the default is `gpt-5.6-luna`.

After a student scores 4/5 or better on the seed set, the app now calls `/api/chat` in `followup` mode to generate five fresh questions instead of using the hard-coded follow-up list.
