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
- Journey: `src/data/journey.js`, `src/lib/journey.js`, `src/lib/useJourney.js`, `src/components/Journey.jsx`, and `src/journey.css`.
- Architecture: `src/lib/createJourneyArchitecture.js` and `src/lib/createCastleEntrance.js`. Shared camera/stair heights: `src/lib/entrance.js`.
- Exterior school: `src/lib/createCastleExterior.js`; headland, forests and local mist: `src/lib/createHighlands.js`. The model follows the supplied castle reference with clustered towers, a Great Hall, quadrangles and a covered bridge.
- Golden Snitch: `src/lib/createGoldenSnitch.js`. Its engraved body and individually ribbed wings use physical metal materials; camera-relative flight follows scroll direction.
- Physical surfaces and reflections: `src/lib/physicalMaterials.js`, `src/lib/createFloorReflection.js`, and licensed assets in `public/materials/`.
- Moving website windows: `src/data/showcases.js`, `src/lib/createProjectWindows.js`, `src/components/ProjectGallery.jsx`, and recordings/posters in `public/showcases/`.
- Time and season rules: `src/lib/atmosphere.js` and its Node tests.
- Downloadable resume: `public/Mayank-Savaliya-Resume.pdf`.
- Transfiguration: `src/components/Transfiguration.jsx`, `src/components/MorphingLogo.jsx`, and `src/data/technologies.js`.
- Morph artwork: `public/technology/morph/`; run `npm run prepare:logos` to regenerate `src/data/technologyShapes.json` after editing the SVGs.
- Moving newspaper: `src/components/LivingNewspaper.jsx`, product entries in `src/data/showcases.js`, and recordings in `public/showcases/`. The old `src/lib/livingPhotographs.js` is archived and is not part of the rendered site.
- Parchment/card refinements: `src/enchanted.css`.

## Product constraints

- Preserve all four original project images in `src/assets`: `AlmaConnect.png`, `KarmaBoxFeed.png`, `DataMine.png`, and `IITKGPStaticWebsite.png`. Do not replace or recolor them, or crop them in the layout.
- Keep professional claims and metrics grounded in the supplied resume. Do not turn product reviews into personal endorsements.
- Default atmosphere follows the visitor's local clock. Snow is November–February, summer March–June, rain July–October.
- The atmosphere panel shows light and season choices only. Do not restore its motion toggle or month legend. Respect the operating system's reduced-motion preference.
- Keep keyboard navigation, reduced-motion behavior, mobile readability, and the no-WebGL fallback working.
- Reuse procedural geometry and locally hosted assets; do not copy Kage's original artwork or source.
- Keep the castle journey on native scrolling, with the camera resting while chapters are read and direct access through the castle map. Keep hero actions and chapter captions in normal flow.
- Keep the garden → stairs → open grand doorway route physically clear. Share ground heights between the scene and camera; never swap a solid castle facade for the interior during entry. Keep butterflies still with reduced motion.
- Do not restore Dobby or a walking avatar. A small Golden Snitch accompanies the journey, with fast articulated wingbeats, gentle irregular loops and banking that responds to forward/reverse travel. Keep it within the camera view, clear of the hero text, and still with reduced motion. Its gold reflects the current scene lighting; it is not emissive.
- Start with an elevated view of the entire school and grounds, then the main gate, green gardens, open internal door, existing halls, and owlery. Keep realistic surface detail, shadowed lighting, and locally hosted website previews. Preserve texture licenses and recording provenance. Wait for source pages, fonts, and lazy images to load before recapturing previews.
- The Deathly Hallows intro has one full-screen invitation: clicking anywhere or pressing a key starts its ten-second animation and Hedwig’s Theme excerpt together. Show only the logo/effects during the spell. Preserve baked audio fades, keyboard mute/skip, reduced motion, hidden-tab audio pause, and bounded asset waits. Keep music provenance in `public/audio/source.json`.
- Moving website windows must pause outside scene passages, in hidden tabs, and with reduced motion. The larger video viewer must remain usable with a keyboard and without WebGL.
- Use the CodePen's parchment framing and Benne / Imperial Script typography as inspiration. Keep the transfiguration on the right of its desktop card and stack it on mobile.
- Match its actual SVG contour morph using GSAP MorphSVG, two-second `power3` transitions, pale fill and ink outlines. Keep a quarter-second rest between forms (including at reversal), a 0.75-second initial hold, and the forward/backward cycle. Pause/resume preserves the remaining time. Do not substitute particles, crossfades, or rotating logos.
- The newspaper front page shows only product websites in the existing four-panel layout: News in the tall lead, DataMine in the wide panel, and Institutions / Companies below. Use the captured product videos and posters, never fantasy scenes. Keep text and original project screenshots still. Respect pause controls, reduced motion, off-screen visibility, hidden tabs, and pause the panels while the larger viewer is open.
- Keep logo provenance and licenses in `public/technology/`; keep the generated photographic atlas and its prompt in `src/assets/`.

## Verification

Run calendar tests and a production build for functional changes. For scene or layout changes, inspect desktop and phone widths, check browser errors, test atmosphere controls, and verify no horizontal overflow. The resume link and four preserved project images must still work.

For journey changes, verify map destinations, reverse scrolling, camera rest during reading, hero spacing at narrow and short viewports, and the still CSS corridor fallback. For moving website windows, verify all four videos change frames, pause correctly, and open in the accessible viewer.

For exterior changes, check camera clearance against actual geometry and inspect day/summer, night/winter and rain on desktop and phones. Transparent mist, foliage cards and reflectors must not render as opaque objects in the desktop ambient-occlusion pass. For Snitch changes, verify fast continuous wingbeats, bounded flight, forward/reverse response, reduced-motion stillness and hidden-tab suspension.

For transfiguration changes, test automatic cycling and reversal, manual selection, next/previous, a paused intermediate outline that resumes smoothly, and immediate still-logo selection with reduced motion. For newspaper changes, verify that each photo actually changes between frames and becomes still when paused.
