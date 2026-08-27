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
