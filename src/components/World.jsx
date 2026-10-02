import { useEffect, useRef, useState } from "react";

export default function World({
  atmosphere,
  reducedMotion,
  route,
  onReady,
  onProgress,
}) {
  const host = useRef(null);
  const world = useRef(null);
  const current = useRef({ ...atmosphere, reducedMotion, route });
  const [ready, setReady] = useState(false);
  const callbacks = useRef({ onReady, onProgress });
  callbacks.current = { onReady, onProgress };

  useEffect(() => {
    let cancelled = false;
    let instance;
    let settled = false;
    const finish = (rendered) => {
      if (cancelled || settled) return;
      settled = true;
      clearTimeout(deadline);
      setReady(rendered);
      callbacks.current.onReady?.();
    };
    // An unavailable asset or renderer must not trap visitors in the intro.
    const deadline = setTimeout(() => {
      if (settled || cancelled) return;
      instance?.dispose();
      instance = null;
      world.current = null;
      finish(false);
    }, 18000);
    import("../lib/createWorld.js")
      .then(({ createWorld }) => {
        if (cancelled || settled) return;
        try {
          instance = createWorld(host.current, {
            ...current.current,
            onProgress: (value) => callbacks.current.onProgress?.(value),
          });
          world.current = instance;
          instance.ready.then(() => finish(true));
        } catch (error) {
          // Content and the CSS landscape remain usable when WebGL is unavailable.
          console.info("Using the still landscape:", error.message);
          finish(false);
        }
      })
      .catch(() => finish(false));
    return () => {
      cancelled = true;
      clearTimeout(deadline);
      instance?.dispose();
      world.current = null;
    };
  }, []);

  useEffect(() => {
    current.current = { ...atmosphere, reducedMotion, route };
    world.current?.update(current.current);
  }, [atmosphere.light, atmosphere.season, reducedMotion, route]);

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
        <div className="still-corridor">
          <div className="still-depth">
            <div className="still-floor" />
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="css-arch" style={{ "--depth": i }}>
                <span />
                <span />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="world-canvas" ref={host} />
      <div className="world-shade" />
      <div className="world-grain" />
    </div>
  );
}
