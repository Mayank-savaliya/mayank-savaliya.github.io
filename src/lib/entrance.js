// Shared by the walkable scenery and the camera route, in metres.
export const entrance = {
  gardenY: -2.4,
  gateZ: 40,
  stairBottomZ: 12.2,
  stairTopZ: 5,
  steps: 12,
  doorZ: 0,
  doorHalfWidth: 4.8,
  eyeHeight: 3.4,
};

const clamp = (n) => Math.max(0, Math.min(1, n));

export function entranceFloor(z) {
  const ascent = clamp(
    (entrance.stairBottomZ - z) / (entrance.stairBottomZ - entrance.stairTopZ),
  );
  return entrance.gardenY + ascent * -entrance.gardenY;
}

export function interiorBlend(z) {
  const t = clamp((3 - z) / 11);
  return t * t * (3 - 2 * t);
}
