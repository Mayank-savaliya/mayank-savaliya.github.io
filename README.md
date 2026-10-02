# Mayank Savaliya — Portfolio

A Hogwarts-inspired personal portfolio with a camera journey through a Three.js castle, changing light and seasonal weather, and a wizarding newspaper presenting real engineering work. Built with React and Vite for GitHub Pages.

## Local development

Use Node.js 22.12 or newer.

```sh
npm ci
npm run dev
```

The development server runs at `http://127.0.0.1:5173`.

```sh
npm test          # Local calendar, lighting, journey interpolation, and preview rules
npm run build    # Production output in build/
npm run preview  # Serve the production build locally
```

The production preview runs at `http://127.0.0.1:4173`. Keep the terminal running while viewing either local server. After editing source, use the development server for live updates, or rebuild before viewing the production preview.

## Content

- `src/data/portfolio.js`: profile, four original projects, career history, combined skills, and technical project notes.
- `public/Mayank-Savaliya-Resume.pdf`: the current downloadable Associate Tech Lead resume.
- `src/App.jsx`: page structure, navigation, resume download, and contact links.
- `src/styles.css`: responsive layouts, locally hosted fonts, newspaper, spellbook, and reduced-motion styles.
- `src/lib/createWorld.js`: original procedural castle, landscape, reflective lake, weather, and camera movement.
- `src/data/journey.js`, `src/lib/journey.js`, and `src/lib/useJourney.js`: six destinations, approach waypoints, and scroll-to-route interpolation.
- `src/components/Journey.jsx` and `src/journey.css`: chapter notes, scene passages, accessible castle map, and hero typography/layout.
- `src/lib/createJourneyArchitecture.js`: connected halls, gallery, reading room, library, and owlery.
- `src/lib/createCastleEntrance.js` and `src/lib/entrance.js`: opening garden gates, planted lawns and flower beds, butterflies, twelve stone steps, and a permanently open grand doorway. Scenery and camera share the same ground profile.
- `src/components/MagicalIntro.jsx`, `src/components/DeathlyHallows.jsx`, and `src/intro.css`: the cinematic opening and locally drawn Deathly Hallows symbol.
- `src/lib/hallowsSpell.js`, `src/lib/introScore.js`, and `src/lib/preloadPortfolio.js`: path-following sparks, ten-second music playback, and image/font readiness.
- `public/audio/`: a ten-second Hedwig’s Theme excerpt with a 1.2-second fade-in and a two-second fade-out; source and recording credits are in `source.json`.
- `src/lib/physicalMaterials.js` and `src/lib/createFloorReflection.js`: scanned PBR surfaces, HDR lighting, refractive glass, and planar floor reflections.
- `src/data/showcases.js`, `src/lib/createProjectWindows.js`, and `src/components/ProjectGallery.jsx`: four moving website windows and their larger, keyboard-accessible video viewer.
- `public/materials/` and `public/showcases/`: locally hosted textures, HDR environment, website recordings, posters, and source manifests.
- `src/lib/atmosphere.js`: the calendar and lighting rules.
- `src/components/Transfiguration.jsx`: the 26-technology sequence with automatic forward/backward cycling, selection, previous/next, and pause controls.
- `src/components/MorphingLogo.jsx`: a single SVG path animated by GSAP MorphSVG, matching the reference's continuous outline transformation, two-second duration, and `power3` easing.
- `src/data/technologyShapes.json`: normalized compound paths generated from local SVG artwork by `npm run prepare:logos`.
- `src/components/LivingNewspaper.jsx`: four independently moving product previews in the newspaper's original asymmetrical layout. News has a portrait capture and DataMine a wide capture; tablet and phone layouts use the standard recordings. Selecting a frame opens that product in the larger viewer.
- `src/enchanted.css`: parchment cards, ornaments, reference-inspired typography, and moving-picture layouts.

The four existing portfolio images are preserved without changing their files or colors: `AlmaConnect.png`, `KarmaBoxFeed.png`, `DataMine.png`, and `IITKGPStaticWebsite.png`. They load lazily and are displayed without cropping. Personal portraits and the former product-testimonial section are no longer part of the website.

## The castle journey

| Stop | Setting                                | Content                                    |
| ---- | -------------------------------------- | ------------------------------------------ |
| 1    | Whole-castle view above the lake                   | Introduction                               |
| 2    | Walled gardens, stone steps and grand hall | Moving project windows and transfiguration |
| 3    | Portrait gallery                       | Career story                               |
| 4    | Reading room                           | The Chronicle and selected work            |
| 5    | Library                                | Skills and tools                           |
| 6    | Owlery                                 | Contact                                    |

Native scrolling moves the camera through transparent scene passages. The opening is an elevated view of the whole school, with a dominant round staircase tower, the buttressed Great Hall, twin-spired bell tower, interconnected quadrangles, and a covered timber bridge over a lake gorge. The original procedural model uses the supplied castle image as its visual reference. Irregular cliffs, forested mountain banks and drifting local mist frame the school. The camera then approaches the main iron gate, passes through green gardens, climbs the stone stairs, and enters the already-open inner door before continuing through the rooms to the owlery. A small Golden Snitch leads the journey; there is no walking avatar. The garden passage leaves space to see the route. The camera climbs the shared staircase height profile and passes through a real opening; exterior light blends into the hallway lighting across the threshold. The camera rests while visitors read each chapter; scrolling back retraces the route. The castle map and normal navigation links allow direct chapter access. The hero's actions and chapter caption stay in document flow at every width.

The Snitch is modelled in `src/lib/createGoldenSnitch.js`: spiral engraving and raised bands follow a reflective gold sphere, while each wing has 36 separate metal vanes. Wing hinges beat about 18.5 times per second, with phase-continuous changes during flight and faint subframe exposures to keep the flutter readable on phones. Layered, nonmatching orbit frequencies create irregular circling; scroll direction changes its lead distance and bank. Its camera-relative flight stays framed during fast descents and map jumps. The body reflects outdoor HDR light and warm hall lamps. Reduced motion holds the body and wings still; hidden tabs suspend the scene.

The opening has one full-screen invitation. Clicking anywhere, tapping, or pressing a key starts the ten-second Deathly Hallows animation and the music together. During the spell, only the symbol, sparks, and atmosphere are visible. Audio starts inside the interaction handler rather than relying on audible autoplay. The audio fades are encoded in the file for mobile playback. Escape skips the introduction; M toggles mute during playback. Hidden tabs stop the music, and reduced motion displays the finished symbol without particle or tracing animation.

The portfolio stays hidden and inert until fonts, decoded images, the HDR environment, scene textures, and the first complete 3D frame are ready. Optional assets have bounded waits, and an unavailable 3D renderer falls back to the CSS landscape. The music is a short excerpt of the John Williams recording linked in `public/audio/source.json`, not an original or CC0 recording.

The hall's windows show scrolling recordings of AlmaConnect News, DataMine, AlmaConnect for Institutions, and AlmaConnect for Companies. The source pages were allowed to load their fonts and images, then scrolled to activate lazy content before recording their visible viewports. Four muted H.264 loops are shared by the 3D frames. They load on approach and pause outside the scene passages, in hidden tabs, and with reduced motion. A native dialog provides larger previews with video controls, titles, and links to the source sites; it also works without WebGL. Source URLs and capture details are in `public/showcases/sources.json`.

## A world that follows the visitor

The browser's **local date and time** determine the opening atmosphere. No location permission, weather service, or third-party API is needed. The calendar is a creative seasonal schedule, not a live weather forecast.

| Months            | Season                                       |
| ----------------- | -------------------------------------------- |
| November–February | Snow, winter foliage, and snow-covered roofs |
| March–June        | Summer greens and drifting golden particles  |
| July–October      | Rain, cooler light, and low mist             |

| Local time  | Light |
| ----------- | ----- |
| 06:00–07:59 | Dawn  |
| 08:00–16:59 | Day   |
| 17:00–18:59 | Dusk  |
| 19:00–05:59 | Night |

The clock updates once a minute, including across midnight. The atmosphere control lets visitors preview a different light or season. System reduced-motion preferences are respected. Manual choices last for the current page visit; refreshing returns to the clock unless preview parameters are present.

Useful preview URLs:

```text
/?light=night&season=winter
/?light=day&season=summer
/?light=dusk&season=rain
```

Invalid parameter values fall back to the local clock. A still CSS landscape remains visible if WebGL cannot initialize, with perspective and depth-separated arches inside the castle. Content, the map, project viewer, links, and resume do not depend on the 3D scene loading.

## Rendering

The 3D engine loads separately from the content. Static geometry is batched by material; rooms behind the camera are hidden, while the continuous hallway ahead remains visible. Resolution, lights, and reflection targets are capped on phones; desktop rendering adds restrained bloom and ambient occlusion at reduced resolution. Transparent mist, wing trails, foliage cards and reflectors are excluded from the occlusion depth pass. Animation pauses in hidden tabs. Reduced motion displays still destinations, stops ambient movement, and uses poster images in the windows. Visitors can still navigate all chapters.

Stone, slate, and floor materials use scanned color, normal, roughness, and ambient-occlusion maps, with consistent texture scale. HDR environment lighting supplies indirect illumination and roughness-filtered reflections. Nearby lamps use distance attenuation; the key lights cast shadows. The lake and polished or rain-wet paving reflect the rendered scene. Glass uses physical transmission, thickness, an index of refraction of 1.5, and subtle dispersion. These are real-time WebGL approximations, not offline ray tracing or a full caustics simulation.

The 1K scanned materials and outdoor HDR environment come from [Poly Haven](https://polyhaven.com/license) under CC0. Individual contributors, original download URLs, and checksums are recorded in `public/materials/sources.json`. All assets and fonts are hosted locally; the castle, rooms, and other geometry are original procedural artwork.

The transfiguration and newspaper animations also stop when their own sections are off-screen. Both have local pause controls and respect the operating system's reduced-motion preference. The atmosphere panel contains only lighting and seasonal choices. Pausing a logo mid-transformation freezes its actual SVG outline; resuming continues that transformation. Reduced motion shows complete, still logos and lets visitors select them manually. The newspaper's text and original four project screenshots remain stationary. Its four picture panels show actual AlmaConnect product sites, with muted videos requested only as their panels become visible. They pause in hidden tabs, during reduced motion, and while the larger viewer is open. Static product posters remain available if video playback fails.

The layered storytelling direction references [Kage](https://mengto.github.io/kage/). No Kage source code or artwork is included.

Architectural research includes the [Hogwarts4D project](https://hogwarts4d.home.blog/), particularly its clustered towers and Gothic cloisters. No source models or renders from that project are included.

The parchment framing and Benne / Imperial Script typography are inspired by [Abhinav Saxena's CodePen](https://codepen.io/er-abhinav-saxena/pen/WNWyQNY). Transfiguration uses the same GSAP MorphSVG mechanism: linear SVG contour interpolation with position-based point mapping, pale fill and ink outlines, and two-second `power3` transitions. The faster sequence holds each completed form for 0.25 seconds, including at reversal; the initial form rests for 0.75 seconds. Pausing or leaving the section preserves the remaining time. GSAP and the Fontsource fonts are bundled locally.

Technology logos are vendored from [Devicon](https://github.com/devicons/devicon) under its MIT license and [Simple Icons](https://github.com/simple-icons/simple-icons) under CC0. Exact sources and licenses are in `public/technology/`. The path-only artwork used for morphing is in `public/technology/morph/`, with its own source manifest. The preparation script combines and centers the paths in a shared viewBox without rasterization. Run `npm run prepare:logos` after changing this artwork. Logos remain the property of their respective owners.

The earlier generated atlas, `src/assets/enchanted-press-plates.png`, its prompt, and `src/lib/livingPhotographs.js` are retained as design archives. They are not imported, preloaded, or displayed by the site. The Chronicle now uses only product imagery.

## Git and deployment

Work on a dedicated task branch. Never commit or push directly to `master`, `main`, or the default branch; submit source changes through a pull request. A pull request is not permission to merge.

The existing `npm run deploy` command builds and publishes `build/` to the `gh-pages` branch. Run it only when publication is explicitly requested. A local build does not publish the site.

The charcoal Systems Architect design is committed independently on `feature/charcoal-portfolio` (`939971a`). Hogwarts development continues on `feature/hogwarts-portfolio`.
