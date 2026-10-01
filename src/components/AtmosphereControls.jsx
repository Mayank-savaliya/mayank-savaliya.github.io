import { useEffect, useRef, useState } from "react";
import { atmosphereLabels } from "../lib/atmosphere.js";

export default function AtmosphereControls({
  atmosphere,
  overrides,
  setOverrides,
  reducedMotion,
  toggleMotion,
}) {
  const [open, setOpen] = useState(false);
  const panel = useRef(null);
  const trigger = useRef(null);
  useEffect(() => {
    if (!open) return;
    const outside = (event) => {
      if (!panel.current?.contains(event.target)) setOpen(false);
    };
    const escape = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
        trigger.current?.focus();
      }
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);
  return (
    <div className="atmosphere" ref={panel}>
      {open && (
        <div
          id="atmosphere-panel"
          className="atmosphere-panel"
          role="region"
          aria-label="Atmosphere settings"
        >
          <span className="eyebrow">A world of your choosing</span>
          <h2>Change the atmosphere.</h2>
          <p>By default, the grounds follow your local time and the season.</p>
          <fieldset>
            <legend>The light</legend>
            <div className="choice-group">
              {["auto", "dawn", "day", "dusk", "night"].map((light) => (
                <button
                  key={light}
                  aria-pressed={(overrides.light || "auto") === light}
                  onClick={() =>
                    setOverrides((previous) => ({ ...previous, light }))
                  }
                >
                  {light === "auto" ? "Local time" : atmosphereLabels[light]}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend>The season</legend>
            <div className="choice-group">
              {["auto", "winter", "summer", "rain"].map((season) => (
                <button
                  key={season}
                  aria-pressed={(overrides.season || "auto") === season}
                  onClick={() =>
                    setOverrides((previous) => ({ ...previous, season }))
                  }
                >
                  {season === "auto" ? "Local date" : atmosphereLabels[season]}
                </button>
              ))}
            </div>
          </fieldset>
          <button
            className="motion-toggle"
            onClick={toggleMotion}
            aria-pressed={reducedMotion}
          >
            <span>
              {reducedMotion ? "Stillness is on" : "Gentle motion is on"}
            </span>
            <span aria-hidden="true">{reducedMotion ? "▶" : "Ⅱ"}</span>
          </button>
          <small>Snow Nov–Feb · Summer Mar–Jun · Rain Jul–Oct</small>
        </div>
      )}
      <button
        ref={trigger}
        className="atmosphere-trigger"
        aria-expanded={open}
        aria-controls="atmosphere-panel"
        aria-label={`Change atmosphere: ${atmosphereLabels[atmosphere.light]}, ${atmosphereLabels[atmosphere.season]}`}
        onClick={() => setOpen(!open)}
      >
        <span className="weather-symbol" aria-hidden="true">
          {atmosphere.season === "winter"
            ? "❄"
            : atmosphere.season === "rain"
              ? "☂"
              : "☼"}
        </span>
        <span>
          {atmosphereLabels[atmosphere.light]}
          <i>·</i>
          {atmosphereLabels[atmosphere.season]}
        </span>
        <span aria-hidden="true" className="settings-mark">
          {open ? "−" : "+"}
        </span>
      </button>
    </div>
  );
}
