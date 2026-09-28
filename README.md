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

Serve the repository with a static web server. The Home screen loads its catalog from `data/projects.json`, so direct `file://` opening is not supported by all browsers.

## Structure

- `index.html` — semantic app shell and Home screen
- `css/tokens.css` — shared design tokens
- `css/app.css` — canonical app/mobile styling and compact-phone adjustments
- `css/desktop.css` — desktop-only responsive enhancements; never duplicates the full app styling
- `app.js` — Home interactions, project-catalog loading and temporary navigation behavior
- `data/projects.json` — canonical project catalog with stable HandyMan project IDs
- `AGENTS.md` — Team HandyMan operating model
- `.github/agents/` — specialist agent definitions
- `docs/` — product documentation

## Next screens

Projects, Build, Saved and Profile are deliberately left for separate design/implementation passes so their flows can be designed before being coupled to the Home shell.

## Project IDs

Every catalog project has a stable ID in the form `HM-0001`. IDs are sequential, never reused, and do not change when a project is renamed, edited or reordered. The catalog's `idPolicy.nextId` records the next available ID.

## Styling architecture

The app experience is the canonical visual implementation. Shared component styling belongs in `css/app.css`; reusable visual variables belong in `css/tokens.css`. Desktop is a progressive enhancement layer in `css/desktop.css` and should contain only rules that genuinely differ on wider viewports. Do not copy complete component blocks into the desktop layer when only one or two properties change.
