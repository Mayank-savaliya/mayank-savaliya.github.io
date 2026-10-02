import { journeyStops, approachWaypoints } from "../data/journey.js";
import { entrance, entranceFloor } from "./entrance.js";

const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
const mix = (a, b, t) => a.map((value, i) => value + (b[i] - value) * t);

export function journeyProgress(scroll, viewportHeight, passages) {
  for (let i = 0; i < passages.length; i++) {
    const start = passages[i].top - viewportHeight * 0.62;
    const end = passages[i].top + passages[i].height - viewportHeight * 0.55;
    if (scroll < start) return i;
    if (scroll <= end) return i + clamp((scroll - start) / (end - start), 0, 1);
  }
  return passages.length;
}

export function journeyPose(progress, still = false) {
  const value = clamp(progress, 0, journeyStops.length - 1);
  if (still) return journeyStops[Math.round(value)];
  let from, to, fraction;
  if (value < 1) {
    const next = approachWaypoints.findIndex((point) => point.at > value);
    from = approachWaypoints[Math.max(0, next - 1)];
    to = approachWaypoints[next];
    fraction = (value - from.at) / (to.at - from.at);
  } else {
    const index = Math.floor(value);
    from = journeyStops[index];
    to = journeyStops[Math.min(index + 1, journeyStops.length - 1)];
    fraction = value - index;
  }
  // A gentle ease at each landing prevents abrupt camera turns.
  const eased = fraction * fraction * (3 - 2 * fraction);
  const pose = {
    camera: mix(from.camera, to.camera, eased),
    look: mix(from.look, to.look, eased),
  };
  if (value >= 0.23 && value < 1)
    pose.camera[1] = entranceFloor(pose.camera[2]) + entrance.eyeHeight;
  return pose;
}
