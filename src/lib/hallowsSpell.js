const clamp = (v) => Math.max(0, Math.min(1, v));
const ease = (v) => {
  const t = clamp(v);
  return t * t * (3 - 2 * t);
};
const triangle = [
  [160, 52],
  [38, 264],
  [282, 264],
  [160, 52],
];
function trianglePoint(t) {
  const position = Math.min(2.9999, clamp(t) * 3),
    index = Math.floor(position);
  const a = triangle[index],
    b = triangle[index + 1],
    f = position - index;
  return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
}
const circlePoint = (t) => {
  const angle = clamp(t) * Math.PI * 2 - Math.PI / 2;
  return [160 + Math.cos(angle) * 70.5, 193.5 + Math.sin(angle) * 70.5];
};

// Sparks follow the actual paths, arrive from darkness, then fall away.
// All motion is confined to a small canvas and stops after the ten-second cue.
export function createHallowsSpell(canvas) {
  const context = canvas.getContext("2d");
  if (!context) return () => {};
  const size = 600,
    ratio = Math.min(window.devicePixelRatio || 1, 1.5);
  canvas.width = canvas.height = size * ratio;
  context.scale(ratio, ratio);
  let seed = 7161,
    frame;
  const random = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  const particles = Array.from({ length: 190 }, (_, i) => {
    const target =
      i % 3 === 0
        ? circlePoint(random())
        : i % 3 === 1
          ? trianglePoint(random())
          : [160, 26 + random() * 263];
    return {
      x: random() * 800 - 100,
      y: random() * 750 - 75,
      target,
      delay: random() * 1.5,
      size: 0.45 + random() * 1.5,
      speed: 0.5 + random(),
    };
  });
  const sparks = [];
  const start = performance.now();
  const point = ([x, y]) => [(x - 160) * 1.35 + 300, (y - 170) * 1.35 + 300];
  const glow = (x, y, radius, alpha, color = "204,226,238") => {
    const gradient = context.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, "rgba(" + color + "," + alpha + ")");
    gradient.addColorStop(0.16, "rgba(" + color + "," + alpha * 0.3 + ")");
    gradient.addColorStop(1, "rgba(" + color + ",0)");
    context.fillStyle = gradient;
    context.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  };
  function draw(now) {
    // Slow the same coordinated paths to the ten-second music excerpt.
    const time = (now - start) / 2000;
    context.clearRect(0, 0, size, size);
    context.globalCompositeOperation = "lighter";
    const fade = 1 - ease((time - 4.3) / 0.7);
    for (const p of particles) {
      const t = ease((time - p.delay) / 2.8),
        [tx, ty] = point(p.target);
      const x =
        p.x + (tx - p.x) * t + Math.sin(time * p.speed + p.x) * (1 - t) * 16;
      const y = p.y + (ty - p.y) * t;
      const opacity =
        Math.sin(clamp((time - p.delay) / 4.4) * Math.PI) * 0.65 * fade;
      if (opacity <= 0) continue;
      glow(x, y, p.size * 4, opacity, "221,209,163");
    }
    for (const [begin, duration, path] of [
      [0.42, 1.9, trianglePoint],
      [1.35, 1.8, circlePoint],
      [2.7, 0.98, (t) => [160, 26 + 263 * t]],
    ]) {
      const t = (time - begin) / duration;
      if (t < 0 || t > 1) continue;
      const [x, y] = point(path(t));
      glow(x, y, 29, 0.9);
      glow(x, y, 7, 1, "255,245,213");
      for (let i = 0; i < 3; i++)
        sparks.push({
          x,
          y,
          born: time,
          vx: (random() - 0.5) * 65,
          vy: (random() - 0.5) * 50,
          life: 0.3 + random() * 0.6,
        });
    }
    for (let i = sparks.length - 1; i >= 0; i--) {
      const p = sparks[i],
        age = time - p.born;
      if (age > p.life) {
        sparks.splice(i, 1);
        continue;
      }
      glow(
        p.x + p.vx * age,
        p.y + p.vy * age + age * age * 23,
        3.2,
        (1 - age / p.life) * 0.7,
      );
    }
    const bloom = Math.sin(clamp((time - 3.65) / 1.2) * Math.PI) * 0.12;
    if (bloom > 0) glow(300, 300, 190, bloom);
    if (time < 5) frame = requestAnimationFrame(draw);
    else context.clearRect(0, 0, size, size);
  }
  frame = requestAnimationFrame(draw);
  return () => {
    cancelAnimationFrame(frame);
    context.clearRect(0, 0, size, size);
  };
}
