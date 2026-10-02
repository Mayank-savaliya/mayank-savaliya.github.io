import { useEffect, useRef, useState } from "react";
import DeathlyHallows from "./DeathlyHallows.jsx";
import { createHallowsSpell } from "../lib/hallowsSpell.js";
import {
  INTRO_AUDIO,
  INTRO_DURATION,
  playIntroTheme,
} from "../lib/introScore.js";

export default function MagicalIntro({
  ready,
  reducedMotion,
  onReveal,
  onComplete,
}) {
  const [stage, setStage] = useState("waiting");
  const [elapsed, setElapsed] = useState(false);
  const panel = useRef(null),
    canvas = useRef(null),
    audio = useRef(null);
  const active = useRef(true),
    startRequested = useRef(false),
    skipped = useRef(false);
  const callbacks = useRef({ onReveal, onComplete });
  callbacks.current = { onReveal, onComplete };

  useEffect(() => {
    active.current = true;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.current?.querySelector("button")?.focus({ preventScroll: true });
    const music = audio.current;
    const hide = () => {
      if (document.hidden) music?.pause();
    };
    document.addEventListener("visibilitychange", hide);
    return () => {
      active.current = false;
      music?.pause();
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("visibilitychange", hide);
    };
  }, []);

  useEffect(() => {
    if (stage !== "casting") return;
    panel.current?.focus({ preventScroll: true });
    const timer = setTimeout(() => {
      audio.current?.pause();
      setElapsed(true);
    }, INTRO_DURATION);
    return () => clearTimeout(timer);
  }, [stage]);

  useEffect(() => {
    if (stage !== "casting" || reducedMotion) return;
    return createHallowsSpell(canvas.current);
  }, [stage, reducedMotion]);

  useEffect(() => {
    if (!ready || !elapsed || stage === "leaving") return;
    setStage("leaving");
    callbacks.current.onReveal();
  }, [ready, elapsed, stage]);

  useEffect(() => {
    if (stage !== "leaving") return;
    const timer = setTimeout(
      () => callbacks.current.onComplete(),
      reducedMotion ? 100 : 750,
    );
    return () => clearTimeout(timer);
  }, [stage, reducedMotion]);

  async function begin() {
    if (startRequested.current) return;
    startRequested.current = true;
    setStage("starting");
    await playIntroTheme(audio.current);
    if (active.current && !skipped.current) setStage("casting");
  }
  function skip() {
    startRequested.current = true;
    skipped.current = true;
    audio.current?.pause();
    setElapsed(true);
    setStage("holding");
    panel.current?.focus({ preventScroll: true });
  }
  function onKeyDown(event) {
    if (event.key === "Escape") {
      event.preventDefault();
      skip();
      return;
    }
    if (event.key.toLowerCase() === "m" && stage === "casting") {
      event.preventDefault();
      audio.current.muted = !audio.current.muted;
      return;
    }
    if (event.key === "Tab") {
      // The whole invitation is the only entry. Behind it the site is inert.
      event.preventDefault();
      (stage === "waiting"
        ? panel.current.querySelector("button")
        : panel.current
      )?.focus();
    } else if (
      stage === "waiting" &&
      !event.metaKey &&
      !event.ctrlKey &&
      !event.altKey &&
      !["Shift", "Control", "Alt", "Meta"].includes(event.key)
    ) {
      event.preventDefault();
      void begin();
    }
  }
  return (
    <div
      ref={panel}
      tabIndex={-1}
      className={
        "magical-intro magical-intro--" +
        stage +
        (reducedMotion ? " magical-intro--still" : "")
      }
      role="dialog"
      aria-modal="true"
      aria-label={
        stage === "waiting"
          ? "Begin the magical introduction. Click anywhere or press a key to start music and animation. Escape skips."
          : "Deathly Hallows introduction. Press M to mute or Escape to skip."
      }
      onKeyDown={onKeyDown}
    >
      <audio ref={audio} src={INTRO_AUDIO} preload="auto" aria-hidden="true" />
      <div className="intro-mist intro-mist--one" aria-hidden="true" />
      <div className="intro-mist intro-mist--two" aria-hidden="true" />
      <div className="intro-center" aria-hidden="true">
        <div className="intro-art">
          <canvas ref={canvas} className="intro-sparks" />
          <DeathlyHallows />
          <div className="intro-reflection" />
        </div>
      </div>
      {stage === "waiting" && (
        <button
          className="intro-invitation"
          onClick={() => void begin()}
          aria-label="Begin the ten-second introduction with Hedwig’s Theme"
        >
          <span className="intro-first-spark" aria-hidden="true" />
          <span className="intro-poem">
            There is magic
            <br />
            in what comes <em>next.</em>
          </span>
          <span className="intro-touch">Click anywhere to begin</span>
        </button>
      )}
    </div>
  );
}
