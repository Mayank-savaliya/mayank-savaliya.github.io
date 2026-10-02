import { useEffect, useRef, useState } from "react";
import { journeyStops } from "../data/journey.js";

export function Lantern() {
  return (
    <svg viewBox="0 0 32 44" fill="none" aria-hidden="true">
      <path
        d="M12 9V6a4 4 0 0 1 8 0v3M7 17h18l-3 21H10L7 17Zm1-3 8-6 8 6M9 40h14M12 19l1 16m7-16-1 16"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path d="M16 22c-3 4-3 6 0 8 3-2 3-4 0-8Z" fill="currentColor" />
    </svg>
  );
}

export function ChapterNote({ stop, intro = false, onExplore }) {
  return (
    <aside
      className={`guide-note ${intro ? "guide-note--intro" : ""}`}
      aria-label="A note from Mayank"
    >
      <div className="guide-note__label">
        <Lantern />
        <span>
          A NOTE FROM<span>MAYANK SAVALIYA</span>
        </span>
        <i aria-hidden="true">✦</i>
      </div>
      <p>{stop.note}</p>
      {!intro && (
        <a href={`#${stop.id}`}>
          {stop.action}
          <span aria-hidden="true">↓</span>
        </a>
      )}
      {onExplore && (
        <button className="window-explore" onClick={onExplore}>
          View the four projects <span aria-hidden="true">↗</span>
        </button>
      )}
    </aside>
  );
}

export function JourneyPassage({ index, onExplore }) {
  const stop = journeyStops[index];
  return (
    <section
      id={stop.passage}
      className={`journey-passage journey-passage--${stop.id}`}
      data-journey-leg={index}
      aria-labelledby={`${stop.passage}-heading`}
    >
      <div className="passage-depth">
        <div className="passage-coordinate">
          <span>{String(index + 1).padStart(2, "0")} / 06</span>
          <i />
          {stop.place}
        </div>
        <h2 id={`${stop.passage}-heading`}>
          {stop.title.split("\n").map((line, i) => (
            <span key={i}>{line}</span>
          ))}
        </h2>
        <ChapterNote stop={stop} onExplore={onExplore} />
        <div className="passage-footnote">
          <span aria-hidden="true">⌖</span> Keep scrolling to follow the
          lanterns
        </div>
      </div>
    </section>
  );
}

export function JourneyMap({ stopIndex }) {
  const [open, setOpen] = useState(false);
  const trigger = useRef(null);
  const region = useRef(null);
  const stop = journeyStops[stopIndex];
  useEffect(() => {
    if (!open) return;
    function key(event) {
      if (event.key === "Escape") {
        setOpen(false);
        trigger.current?.focus();
      }
    }
    function outside(event) {
      if (!region.current?.contains(event.target)) setOpen(false);
    }
    document.addEventListener("keydown", key);
    document.addEventListener("pointerdown", outside);
    return () => {
      document.removeEventListener("keydown", key);
      document.removeEventListener("pointerdown", outside);
    };
  }, [open]);
  return (
    <div className="journey-map" ref={region}>
      {open && (
        <nav
          className="journey-map__panel"
          id="castle-map"
          aria-label="Castle journey"
        >
          <div className="map-heading">
            <span>YOUR WAY THROUGH</span>
            <h2>A map of the castle</h2>
            <p>Follow the path, or choose your own chapter.</p>
          </div>
          <ol>
            {journeyStops.map((place, index) => (
              <li key={place.id}>
                <a
                  href={`#${place.id}`}
                  aria-current={stopIndex === index ? "location" : undefined}
                  onClick={() => setOpen(false)}
                >
                  <span className="map-node">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span>
                    <strong>{place.place}</strong>
                    <small>{place.subject}</small>
                  </span>
                  <i aria-hidden="true">↗</i>
                </a>
              </li>
            ))}
          </ol>
        </nav>
      )}
      <button
        className="journey-map__trigger"
        ref={trigger}
        aria-expanded={open}
        aria-controls="castle-map"
        onClick={() => setOpen(!open)}
      >
        <span className="map-compass" aria-hidden="true">
          ⌖
        </span>
        <span>
          <small>
            {String(stopIndex + 1).padStart(2, "0")} / 06 · CASTLE MAP
          </small>
          <strong>{stop.place}</strong>
        </span>
        <span aria-hidden="true">{open ? "−" : "+"}</span>
      </button>
      <span className="journey-map__progress" aria-hidden="true" />
    </div>
  );
}
