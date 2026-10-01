# Mayank Savaliya — Portfolio

A Hogwarts-inspired personal portfolio with a live Three.js castle, changing light and seasonal weather, and a wizarding newspaper presenting real engineering work. Built with React and Vite; hosted on GitHub Pages.

## Local development

Use Node.js 22.12 or newer.

```sh
npm ci
npm run dev
```

The development server runs at `http://127.0.0.1:5173`.

```sh
npm test          # Local date, season, lighting, and preview rules
npm run build    # Production output in build/
npm run preview  # Serve the production build locally
```

## Content

- `src/data/portfolio.js`: profile, four original projects, career history, combined skills, and technical project notes.
- `public/Mayank-Savaliya-Resume.pdf`: the current downloadable Associate Tech Lead resume.
- `src/App.jsx`: page structure, navigation, resume download, and contact links.
- `src/styles.css`: responsive layouts, locally hosted fonts, newspaper, spellbook, and reduced-motion styles.
- `src/lib/createWorld.js`: original procedural castle, landscape, reflective lake, weather, and camera movement.
- `src/lib/atmosphere.js`: the calendar and lighting rules.

The four existing portfolio images are preserved without changing their files or colors: `AlmaConnect.png`, `KarmaBoxFeed.png`, `DataMine.png`, and `IITKGPStaticWebsite.png`. They load lazily and are displayed without cropping. Personal portraits and the former product-testimonial section are no longer part of the website.

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

The clock updates once a minute, including across midnight. The atmosphere control lets visitors preview a different light or season and pause motion. System reduced-motion preferences are respected. Manual choices last for the current page visit; refreshing returns to the clock unless preview parameters are present.

Useful preview URLs:

```text
/?light=night&season=winter
/?light=day&season=summer
/?light=dusk&season=rain
```

Invalid parameter values fall back to the local clock. A still CSS landscape remains visible if WebGL cannot initialize. Content, links, and the resume do not depend on the 3D scene loading.

## Rendering

The 3D engine loads separately from the content. Static castle geometry is batched by material, the rendering resolution is capped, and particles are reduced on small screens. Animation pauses in hidden tabs. Reduced-motion mode shows a still scene with no particles or camera movement. All fonts and artwork are local; the architecture and scene textures are generated in code.

The layered storytelling direction references [Kage](https://mengto.github.io/kage/). No Kage source code or artwork is included.

## Git and deployment

Work on a dedicated task branch. Never commit or push directly to `master`, `main`, or the default branch; submit source changes through a pull request. A pull request is not permission to merge.

The existing `npm run deploy` command builds and publishes `build/` to the `gh-pages` branch. Run it only when publication is explicitly requested. A local build does not publish the site.
