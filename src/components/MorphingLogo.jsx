import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";
import shapes from "../data/technologyShapes.json";

gsap.registerPlugin(MorphSVGPlugin);

export default function MorphingLogo({
  technology,
  running,
  reducedMotion,
  reverse,
}) {
  const pathRef = useRef(null);
  const tweenRef = useRef(null);
  const current = useRef(technology.id);
  // Keep React's initial d stable; MorphSVG owns this same path thereafter.
  const initialPath = useRef(shapes[technology.id]);

  useLayoutEffect(() => {
    const path = pathRef.current;
    const shape = shapes[technology.id];
    const changed = current.current !== technology.id;

    if (changed || reducedMotion) {
      tweenRef.current?.kill();
      tweenRef.current = null;
      current.current = technology.id;
      path.dataset.morphing = "false";

      if (!running || reducedMotion) {
        path.setAttribute("d", shape);
      } else {
        // The CodePen morphs the actual SVG contour with MorphSVG, using
        // linear point mapping and power3 easing. Its yoyo reverses the ease.
        tweenRef.current = gsap.to(path, {
          duration: 2,
          ease: reverse ? "power3.in" : "power3.out",
          morphSVG: {
            shape,
            type: "linear",
            map: "position",
            shapeIndex: "auto",
          },
          onStart: () => {
            path.dataset.morphing = "true";
          },
          onComplete: () => {
            path.dataset.morphing = "false";
            path.setAttribute("d", shape);
          },
        });
      }
    }

    // Preserve the in-between outline when paused or scrolled out of view.
    // Resuming continues the same tween instead of starting it over.
    tweenRef.current?.paused(!running);
  }, [technology.id, running, reducedMotion, reverse]);

  useLayoutEffect(() => () => tweenRef.current?.kill(), []);

  return (
    <div className="morph-visual">
      <svg
        className="morph-svg"
        viewBox="0 0 303 230"
        role="img"
        aria-label={`${technology.name} logo`}
      >
        <path
          ref={pathRef}
          className="morph-shape"
          d={initialPath.current}
          data-morphing="false"
        />
      </svg>
    </div>
  );
}
