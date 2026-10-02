import { useEffect, useRef, useState } from "react";
import { journeyProgress } from "./journey.js";
import { journeyStops } from "../data/journey.js";

export function useJourney() {
  const route = useRef({ progress: 0 });
  const [stopIndex, setStopIndex] = useState(0);
  useEffect(() => {
    const elements = [...document.querySelectorAll("[data-journey-leg]")];
    let passages = [],
      frame = 0;
    function update() {
      frame = 0;
      const progress = journeyProgress(window.scrollY, innerHeight, passages);
      route.current.progress = progress;
      route.current.exploring = passages.some(
        ({ top, height }) =>
          top - window.scrollY < innerHeight * 0.8 &&
          top + height - window.scrollY > innerHeight * 0.4,
      );
      const index = Math.min(
        journeyStops.length - 1,
        Math.floor(progress + 0.65),
      );
      setStopIndex((previous) => (previous === index ? previous : index));
      document.documentElement.style.setProperty(
        "--journey-progress",
        progress / (journeyStops.length - 1),
      );
      document.documentElement.dataset.room = journeyStops[index].id;
      elements.forEach((element, i) => {
        element.style.setProperty(
          "--travel",
          Math.max(0, Math.min(1, progress - i)),
        );
      });
    }
    function requestUpdate() {
      if (!frame) frame = requestAnimationFrame(update);
    }
    function measure() {
      passages = elements.map((element) => ({
        top: element.getBoundingClientRect().top + window.scrollY,
        height: element.offsetHeight,
      }));
      requestUpdate();
    }
    const observer = new ResizeObserver(measure);
    observer.observe(document.querySelector("main"));
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", measure);
    measure();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", measure);
    };
  }, []);
  return { route, stopIndex, active: journeyStops[stopIndex].id };
}
