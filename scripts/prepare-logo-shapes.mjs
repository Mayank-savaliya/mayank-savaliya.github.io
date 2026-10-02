import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";
import { technologies } from "../src/data/technologies.js";

// Convert the vendored SVGs to compound Bezier paths in one shared viewBox.
// This happens once during development, never during page load or animation.
const root = new URL("../", import.meta.url);
const shapes = {};
for (const { id } of technologies) {
  const svg = await readFile(
    new URL(`public/technology/morph/${id}.svg`, root),
    "utf8",
  );
  const box = svg
    .match(/viewBox="([^"]+)"/)?.[1]
    .split(/[\s,]+/)
    .map(Number);
  if (
    !box ||
    box.length !== 4 ||
    /\btransform=|<(?:circle|ellipse|rect|polygon|polyline|line)\b/.test(svg)
  ) {
    throw new Error(`${id}: expected path-only SVG artwork with a viewBox`);
  }
  const [x, y, width, height] = box;
  const scale = 180 / Math.max(width, height);
  const left = (303 - width * scale) / 2 - x * scale;
  const top = (230 - height * scale) / 2 - y * scale;
  const paths = [...svg.matchAll(/<path\b[^>]*\bd="([^"]+)"/g)];
  if (!paths.length) throw new Error(`${id}: no path data`);

  const normalized = paths.flatMap(([, d]) => {
    const segments = MorphSVGPlugin.stringToRawPath(d);
    for (const segment of segments) {
      for (let i = 0; i < segment.length; i += 2) {
        segment[i] = Math.round((segment[i] * scale + left) * 1000) / 1000;
        segment[i + 1] =
          Math.round((segment[i + 1] * scale + top) * 1000) / 1000;
      }
    }
    return segments;
  });
  shapes[id] = MorphSVGPlugin.rawPathToString(normalized);
}

const destination = new URL("src/data/technologyShapes.json", root);
await writeFile(destination, JSON.stringify(shapes, null, 2) + "\n");
console.log(
  `Prepared ${Object.keys(shapes).length} SVG shapes: ${fileURLToPath(destination)}`,
);
