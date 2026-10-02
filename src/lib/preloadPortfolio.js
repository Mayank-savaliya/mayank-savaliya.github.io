import { projects } from "../data/portfolio.js";
import { showcases } from "../data/showcases.js";

// Decode the reading content while the spell plays. Website videos retain
// their deliberate on-approach loading; their posters are ready immediately.
export async function preloadPortfolio(onProgress = () => {}) {
  const sources = [
    ...new Set([
      ...projects.map((p) => p.image),
      ...showcases.map((p) => p.poster),
      ...showcases.map((p) => p.newspaperPoster),
    ]),
  ];
  let complete = 0;
  const total = sources.length + 1;
  const track = async (task) => {
    let timeout;
    try {
      await Promise.race([
        task,
        new Promise((resolve) => {
          timeout = setTimeout(resolve, 15000);
        }),
      ]);
    } catch {
      // Missing optional artwork must not make navigation inaccessible.
    } finally {
      clearTimeout(timeout);
      onProgress(++complete / total);
    }
  };
  const fonts = document.fonts
    ? Promise.all([
        document.fonts.load('400 1em "Cormorant Garamond"'),
        document.fonts.load('400 1em "DM Sans"'),
        document.fonts.load('400 1em "Cinzel"'),
        document.fonts.load('400 1em "Benne"'),
        document.fonts.ready,
      ])
    : Promise.resolve();
  await Promise.all([
    track(fonts),
    ...sources.map((src) => {
      const image = new Image();
      image.src = src;
      return track(image.decode());
    }),
  ]);
}
