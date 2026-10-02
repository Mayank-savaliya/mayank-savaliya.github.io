import { useEffect, useRef, useState } from "react";
import { showcases } from "../data/showcases.js";
import { useMotionVisibility } from "../lib/useMotionVisibility.js";

const layouts = ["lead", "wide", "standard", "standard"];
const numbers = ["I", "II", "III", "IV"];

function ProductPhotograph({ project, index, paused, compact, onExplore }) {
  const video = useRef(null);
  const { ref, visible } = useMotionVisibility();
  const [requested, setRequested] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const source = compact ? project.video : project.newspaperVideo;
  const poster = compact ? project.poster : project.newspaperPoster;

  useEffect(() => {
    setReady(false);
    setFailed(false);
  }, [source]);

  useEffect(() => {
    if (visible && !paused && !failed) setRequested(true);
  }, [visible, paused, failed]);

  useEffect(() => {
    const element = video.current;
    if (!element) return;
    if (requested && visible && !paused && !failed) {
      void element.play().catch(() => {
        // A browser that blocks muted playback still has the product poster.
      });
    } else element.pause();
    return () => element.pause();
  }, [requested, visible, paused, failed, source]);

  return (
    <figure
      className={"living-photo living-photo--" + layouts[index]}
      ref={ref}
    >
      <button
        type="button"
        className={
          "living-photo-frame" + (ready && !failed ? " photo-ready" : "")
        }
        onClick={() => onExplore(index)}
        aria-label={"Open the " + project.title + " product preview"}
      >
        <img
          className="living-photo-still"
          src={poster}
          alt={project.title + " website"}
          loading="lazy"
          decoding="async"
        />
        <video
          ref={video}
          className="living-photo-video"
          src={requested ? source : undefined}
          poster={poster}
          muted
          loop
          playsInline
          preload={requested ? "auto" : "none"}
          onLoadedData={() => setReady(true)}
          onError={() => setFailed(true)}
          tabIndex={-1}
          aria-hidden="true"
        />
        <span className="photograph-number" aria-hidden="true">
          {numbers[index]}
        </span>
        <span className="photograph-expand" aria-hidden="true">
          ↗
        </span>
      </button>
      <figcaption>
        <span>{project.subtitle}</span>
        <strong>{project.title}</strong>
      </figcaption>
    </figure>
  );
}

export default function LivingNewspaper({
  reducedMotion,
  suspended = false,
  onExplore,
}) {
  const [paused, setPaused] = useState(false);
  const [compact, setCompact] = useState(
    () => matchMedia("(max-width: 960px)").matches,
  );
  useEffect(() => {
    const query = matchMedia("(max-width: 960px)");
    const update = () => setCompact(query.matches);
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  const still = paused || reducedMotion || suspended;
  return (
    <div className="living-edition" data-paused={still}>
      <div className="living-edition-heading">
        <div>
          <span className="eyebrow">The product edition</span>
          <p>A closer look at the work.</p>
        </div>
        <button
          type="button"
          className="photograph-pause"
          aria-pressed={paused || reducedMotion}
          disabled={reducedMotion}
          onClick={() => setPaused(!paused)}
        >
          {reducedMotion
            ? "Still previews · reduced motion"
            : paused
              ? "▷ Play the previews"
              : "Ⅱ Pause the previews"}
        </button>
      </div>
      <div className="living-photo-grid">
        {showcases.map((project, index) => (
          <ProductPhotograph
            key={project.id}
            project={project}
            index={index}
            paused={still}
            compact={compact}
            onExplore={onExplore}
          />
        ))}
      </div>
      <div className="living-edition-rule">
        <span>Four products. Built for real people.</span>
        <span>Explore the work behind them ↓</span>
      </div>
    </div>
  );
}
