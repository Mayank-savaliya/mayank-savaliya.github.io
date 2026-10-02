import plateSource from "../assets/enchanted-press-plates.png";

export { plateSource };
let imagePromise;
export function loadPressPlates() {
  if (!imagePromise)
    imagePromise = new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = plateSource;
    });
  return imagePromise;
}

const quadrants = { castle: [0, 0], train: [1, 0], owl: [0, 1], book: [1, 1] };

// A single image atlas becomes four independently moving photographic windows.
// Effects are painted inside each frame; newspaper text and source project images stay still.
export function createLivingPhotograph(canvas, image, kind) {
  const context = canvas.getContext("2d");
  if (!context) return null;
  const base = document.createElement("canvas");
  const baseContext = base.getContext("2d");
  if (!baseContext) return null;
  let width = 0,
    height = 0,
    ratio = 1,
    frame = 0;
  let running = false,
    disposed = false,
    last = 0,
    elapsed = 0;
  let crop = { x: 0, y: 0, width: 1, height: 1 };
  const [column, row] = quadrants[kind];
  const tileWidth = image.naturalWidth / 2;
  const tileHeight = image.naturalHeight / 2;

  function position(x, y) {
    return {
      x: ((x * tileWidth - crop.x) / crop.width) * width,
      y: ((y * tileHeight - crop.y) / crop.height) * height,
    };
  }
  function cloud(x, y, radiusX, radiusY, opacity) {
    context.save();
    context.translate(x, y);
    context.scale(radiusX, radiusY);
    const gradient = context.createRadialGradient(0, 0, 0.05, 0, 0, 1);
    gradient.addColorStop(0, `rgba(226, 214, 187, ${opacity})`);
    gradient.addColorStop(1, "rgba(226, 214, 187, 0)");
    context.fillStyle = gradient;
    context.fillRect(-1, -1, 2, 2);
    context.restore();
  }
  function paint() {
    if (!width || !height) return;
    const time = elapsed / 1000;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, width, height);
    context.save();
    context.translate(width / 2, height / 2);
    const breathing = 1.025 + Math.sin(time * 0.17 + column) * 0.009;
    context.scale(breathing, breathing);
    context.translate(-width / 2 + Math.sin(time * 0.12) * 1.3, -height / 2);
    context.drawImage(base, 0, 0, width, height);

    if (kind === "castle") {
      const waterStart = Math.max(height * 0.57, position(0.5, 0.63).y);
      for (let y = waterStart; y < height; y += 3) {
        const depth = (y - waterStart) / Math.max(1, height - waterStart);
        const offset = Math.sin(y * 0.12 + time * 1.2) * depth * 2.8;
        context.drawImage(
          base,
          0,
          y * ratio,
          base.width,
          Math.min(3 * ratio, base.height - y * ratio),
          offset,
          y,
          width,
          3,
        );
      }
      for (let i = 0; i < 4; i++)
        cloud(
          ((time * 6 + i * width * 0.34) % (width * 1.5)) - width * 0.2,
          height * (0.54 + i * 0.035),
          width * 0.48,
          height * 0.06,
          0.11,
        );
      const moon = position(0.71, 0.12);
      cloud(
        moon.x,
        moon.y,
        width * 0.1,
        width * 0.1,
        0.04 + Math.sin(time * 0.6) * 0.015,
      );
    }
    if (kind === "train") {
      const chimney = position(0.86, 0.42);
      for (let i = 0; i < 9; i++) {
        const age = (time * 0.16 + i / 9) % 1;
        cloud(
          chimney.x - age * width * 0.4,
          chimney.y - age * height * 0.52,
          12 + age * 68,
          10 + age * 42,
          Math.sin(age * Math.PI) * 0.24,
        );
      }
    }
    if (kind === "owl") {
      // Brief lids close over the owl's eyes; its frame has its own six-second rhythm.
      const phase = time % 6.3;
      const blink =
        phase > 4.8 && phase < 5.12
          ? Math.sin(((phase - 4.8) / 0.32) * Math.PI)
          : 0;
      if (blink > 0) {
        context.fillStyle = "#b2a890";
        for (const eye of [
          [0.39, 0.244],
          [0.482, 0.243],
        ]) {
          const point = position(...eye);
          context.beginPath();
          context.ellipse(
            point.x,
            point.y,
            width * 0.016,
            height * 0.019 * blink,
            -0.05,
            0,
            Math.PI * 2,
          );
          context.fill();
        }
      }
      for (let i = 0; i < 12; i++) {
        const x =
          width * ((i * 0.037 + Math.sin(time * 0.3 + i) * 0.006) % 0.22);
        const y = ((time * 8 + i * 31) % (height + 20)) - 10;
        context.fillStyle = `rgba(235,225,196,${0.15 + (i % 3) * 0.09})`;
        context.beginPath();
        context.arc(x, y, 0.7 + (i % 2), 0, Math.PI * 2);
        context.fill();
      }
      cloud(
        width * 0.82,
        height * 0.52,
        width * 0.14,
        height * 0.4,
        0.05 + Math.sin(time * 3.7) * 0.02,
      );
    }
    if (kind === "book") {
      for (let i = 0; i < 23; i++) {
        const age = (time * (0.08 + (i % 4) * 0.007) + i * 0.071) % 1;
        const x = width * (0.28 + (i % 11) * 0.035) + Math.sin(time + i) * 9;
        const y = height * (0.77 - age * 0.67);
        const alpha =
          Math.sin(age * Math.PI) * (0.45 + Math.sin(time * 2 + i) * 0.2);
        context.fillStyle = `rgba(243,222,162,${alpha})`;
        context.beginPath();
        context.arc(x, y, i % 6 === 0 ? 1.6 : 0.7, 0, Math.PI * 2);
        context.fill();
        if (i % 6 === 0) {
          context.fillRect(x - 3, y - 0.3, 6, 0.6);
          context.fillRect(x - 0.3, y - 3, 0.6, 6);
        }
      }
      cloud(
        width * 0.6,
        height * 0.68,
        width * 0.3,
        height * 0.16,
        0.04 + Math.sin(time * 1.7) * 0.02,
      );
    }
    context.restore();
  }
  function tick(time) {
    if (!running || disposed) return;
    if (!last) last = time;
    const delta = time - last;
    if (delta >= 1000 / 24) {
      elapsed += Math.min(delta, 100);
      last = time;
      paint();
    }
    frame = requestAnimationFrame(tick);
  }
  function resize() {
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    ratio = Math.min(devicePixelRatio || 1, 1.5);
    if (!width || !height) return;
    canvas.width = base.width = Math.round(width * ratio);
    canvas.height = base.height = Math.round(height * ratio);
    const aspect = width / height;
    const cropWidth = Math.min(tileWidth, tileHeight * aspect);
    const cropHeight = Math.min(tileHeight, tileWidth / aspect);
    // Keep faces and the train above the vertical midpoint when a frame is wide.
    const focus = kind === "owl" ? 0.22 : kind === "train" ? 0.39 : 0.5;
    crop = {
      x: (tileWidth - cropWidth) / 2,
      y: (tileHeight - cropHeight) * focus,
      width: cropWidth,
      height: cropHeight,
    };
    baseContext.setTransform(ratio, 0, 0, ratio, 0, 0);
    baseContext.drawImage(
      image,
      column * tileWidth + crop.x,
      row * tileHeight + crop.y,
      crop.width,
      crop.height,
      0,
      0,
      width,
      height,
    );
    paint();
  }
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  resize();
  return {
    setRunning(value) {
      if (running === value || disposed) return;
      running = value;
      canvas.dataset.playing = String(value);
      cancelAnimationFrame(frame);
      last = 0;
      if (value) frame = requestAnimationFrame(tick);
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
    },
  };
}
