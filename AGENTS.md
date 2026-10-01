# Repository guide

## Git

- Never commit or push directly to `master`, `main`, or the repository default branch.
- Make changes on a dedicated task branch; preserve existing work.
- Verify the current branch and remote destination immediately before every commit and push.
- Push a task branch explicitly and submit source changes through a pull request. Do not infer permission to merge or deploy.

## Architecture and commands

This is a React/Vite static portfolio with an original procedural Three.js environment. Node.js 22.12+ is required. Use `npm run dev`, `npm test`, and `npm run build`; output is in `build/`. `npm run deploy` publishes to GitHub Pages and needs an explicit publication request.

- Content: `src/data/portfolio.js`.
- Page: `src/App.jsx`; styles: `src/styles.css`.
- Scene: `src/lib/createWorld.js`, lazily loaded by `src/components/World.jsx`.
- Time and season rules: `src/lib/atmosphere.js` and its Node tests.
- Downloadable resume: `public/Mayank-Savaliya-Resume.pdf`.

## Product constraints

- Preserve all four original project images in `src/assets`: `AlmaConnect.png`, `KarmaBoxFeed.png`, `DataMine.png`, and `IITKGPStaticWebsite.png`. Do not replace or recolor them, or crop them in the layout.
- Keep professional claims and metrics grounded in the supplied resume. Do not turn product reviews into personal endorsements.
- Default atmosphere follows the visitor's local clock. Snow is November–February, summer March–June, rain July–October.
- Keep keyboard navigation, reduced-motion behavior, mobile readability, and the no-WebGL fallback working.
- Reuse procedural geometry and locally hosted assets; do not copy Kage's original artwork or source.

## Verification

Run calendar tests and a production build for functional changes. For scene or layout changes, inspect desktop and phone widths, check browser errors, test atmosphere controls, and verify no horizontal overflow. The resume link and four preserved project images must still work.
