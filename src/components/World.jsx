import { useEffect, useRef, useState } from "react";

export default function World({ atmosphere, reducedMotion }) {
  const host = useRef(null);
  const world = useRef(null);
  const current = useRef({ ...atmosphere, reducedMotion });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let instance;
    import("../lib/createWorld.js")
      .then(({ createWorld }) => {
        if (cancelled) return;
        try {
          instance = createWorld(host.current, current.current);
          world.current = instance;
          setReady(true);
        } catch (error) {
          // Content and the CSS landscape remain usable when WebGL is unavailable.
          console.info("Using the still landscape:", error.message);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      instance?.dispose();
      world.current = null;
    };
  }, []);

  useEffect(() => {
    current.current = { ...atmosphere, reducedMotion };
    world.current?.update(current.current);
  }, [atmosphere.light, atmosphere.season, reducedMotion]);

  return (
    <div className={`world ${ready ? "world--ready" : ""}`} aria-hidden="true">
      <div className="still-landscape">
        <div className="still-moon" />
        <div className="still-mountains" />
        <div className="still-castle">
          {Array.from({ length: 9 }, (_, i) => (
            <i key={i} style={{ "--tower": i }} />
          ))}
        </div>
      </div>
      <div className="world-canvas" ref={host} />
      <div className="world-shade" />
      <div className="world-grain" />
    </div>
  );
}
