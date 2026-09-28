# HandyMan

HandyMan is a mobile-first DIY application for discovering woodworking and handcrafted projects, with plans, patterns, materials and step-by-step build guidance.

## Current prototype

The first app shell is now implemented as a dependency-free static web app:

- Home page based on the approved HandyMan mockup
- Responsive mobile-first layout
- Search field and category filtering
- Popular project cards with local save interaction
- Persistent five-item navigation shell: Home, Projects, Build, Saved, Profile
- Only Home is active; the other destinations intentionally show a temporary "coming next" message
- Existing HandyMan icon is reused as the brand mark

Open `index.html` directly or serve the repository with any static web server.

## Structure

- `index.html` — semantic app shell and Home screen
- `styles.css` — HandyMan design tokens and responsive UI
- `app.js` — Home interactions and temporary navigation behavior
- `AGENTS.md` — Team HandyMan operating model
- `.github/agents/` — specialist agent definitions
- `docs/` — product documentation

## Next screens

Projects, Build, Saved and Profile are deliberately left for separate design/implementation passes so their flows can be designed before being coupled to the Home shell.
