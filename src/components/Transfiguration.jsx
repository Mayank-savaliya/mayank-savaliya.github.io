import { useEffect, useRef, useState } from "react";
import { technologies } from "../data/technologies.js";
import { useMotionVisibility } from "../lib/useMotionVisibility.js";
import MorphingLogo from "./MorphingLogo.jsx";
import { Corners, Ornament } from "./Ornament.jsx";

export default function Transfiguration({ reducedMotion }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const direction = useRef(1);
  const countdown = useRef({ index: 0, remaining: 750 });
  const { ref, visible } = useMotionVisibility();
  const running = visible && !paused && !reducedMotion;
  const technology = technologies[index];
  useEffect(() => {
    const cycle = countdown.current;
    if (cycle.index !== index) {
      cycle.index = index;
      // Keep the two-second contour morph; rest only a quarter second.
      cycle.remaining = 2250;
    }
    if (!running) return;
    const started = performance.now();
    const timer = setTimeout(() => {
      cycle.remaining = 0;
      let next = index + direction.current;
      if (next < 0 || next >= technologies.length) {
        direction.current *= -1;
        next = index + direction.current;
      }
      setIndex(next);
    }, cycle.remaining);
    return () => {
      clearTimeout(timer);
      // Pausing or leaving the viewport preserves the remaining beat.
      cycle.remaining = Math.max(
        0,
        cycle.remaining - (performance.now() - started),
      );
    };
  }, [running, index]);
  function choose(next) {
    const value = (next + technologies.length) % technologies.length;
    direction.current = next < index ? -1 : 1;
    setIndex(value);
    setAnnouncement(
      `${technologies[value].name}. ${technologies[value].description}`,
    );
  }
  return (
    <section
      id="transfiguration"
      className="transfiguration-section section-shell"
      aria-labelledby="transfiguration-heading"
      ref={ref}
    >
      <div className="chapter-label">
        <span>02</span>
        <i />
        The art of changing form
      </div>
      <div className="transfiguration-parchment">
        <Corners />
        <div className="transfiguration-title">
          <span className="eyebrow">A practical lesson in possibility</span>
          <h2 id="transfiguration-heading">Transfiguration</h2>
          <Ornament />
        </div>
        <div className="transfiguration-layout">
          <div className="transfiguration-copy">
            <p className="script-introduction">
              The language changes.
              <br />
              The curiosity remains.
            </p>
            <p className="drop-cap">
              Every idea asks for a different kind of craft. Sometimes it’s a
              thoughtful interface. Sometimes it’s a resilient service, a faster
              search, or a model that finds meaning in the noise.
            </p>
            <p>
              My spellbook has grown through six years of building at
              AlmaConnect. These are some of the languages and frameworks I’ve
              put to work along the way.
            </p>
            <div className="spell-lessons">
              <div>
                <span className="lesson-seal" aria-hidden="true">
                  I
                </span>
                <div>
                  <h3>Conjure the experience</h3>
                  <p>Interfaces people want to return to.</p>
                </div>
              </div>
              <div>
                <span className="lesson-seal" aria-hidden="true">
                  II
                </span>
                <div>
                  <h3>Strengthen the foundations</h3>
                  <p>Systems that keep their promises at scale.</p>
                </div>
              </div>
              <div>
                <span className="lesson-seal" aria-hidden="true">
                  III
                </span>
                <div>
                  <h3>Find a little understanding</h3>
                  <p>Useful intelligence, woven into the product.</p>
                </div>
              </div>
            </div>
            <a href="#spellbook" className="ink-link">
              Open the complete spellbook <span aria-hidden="true">↗</span>
            </a>
          </div>
          <div className="transfiguration-card" data-running={running}>
            <Corners />
            <div className="specimen-topline">
              <span>Fig. {String(index + 1).padStart(2, "0")}</span>
              <span>Enchanted specimens</span>
            </div>
            <MorphingLogo
              technology={technology}
              running={running}
              reducedMotion={reducedMotion}
              reverse={direction.current < 0}
            />
            <div className="specimen-copy">
              <span className="eyebrow">{technology.discipline}</span>
              <h3>{technology.name}</h3>
              <p>{technology.description}</p>
            </div>
            <div className="transfiguration-controls">
              <button
                type="button"
                onClick={() => choose(index - 1)}
                aria-label="Previous technology"
              >
                ←
              </button>
              <label>
                <span className="sr-only">Choose a technology</span>
                <select
                  value={index}
                  onChange={(event) => choose(Number(event.target.value))}
                >
                  {technologies.map((item, position) => (
                    <option key={item.id} value={position}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                onClick={() => choose(index + 1)}
                aria-label="Next technology"
              >
                →
              </button>
            </div>
            <div className="specimen-bottomline">
              <span>
                {String(index + 1).padStart(2, "0")} / {technologies.length}{" "}
                forms
              </span>
              <button
                type="button"
                className="transfiguration-pause"
                onClick={() => setPaused(!paused)}
                aria-pressed={paused || reducedMotion}
                disabled={reducedMotion}
              >
                {reducedMotion
                  ? "Motion reduced"
                  : paused
                    ? "▷ Resume spell"
                    : "Ⅱ Pause spell"}
              </button>
            </div>
            <span className="sr-only" role="status">
              {announcement}
            </span>
          </div>
        </div>
        <div className="parchment-colophon">
          <Ornament />
          <span>Different tools. The same thoughtful hand.</span>
          <Ornament />
        </div>
      </div>
    </section>
  );
}
