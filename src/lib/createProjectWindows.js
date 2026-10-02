import * as THREE from "three";
import { showcases } from "../data/showcases.js";

export function createProjectWindows(invalidate, loadingManager) {
  let disposed = false;
  const loader = new THREE.TextureLoader(loadingManager);
  const records = showcases.map((project) => {
    const poster = loader.load(project.poster, () => {
      if (disposed) poster.dispose();
      else invalidate();
    });
    poster.colorSpace = THREE.SRGBColorSpace;
    const material = new THREE.MeshBasicMaterial({
      map: poster,
      toneMapped: false,
    });
    const video = document.createElement("video");
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = "none";
    video.dataset.showcase = project.id;
    const texture = new THREE.VideoTexture(video);
    texture.colorSpace = THREE.SRGBColorSpace;
    const record = {
      project,
      material,
      poster,
      video,
      texture,
      requested: false,
      playing: false,
    };
    video.addEventListener("loadeddata", () => {
      if (disposed) return;
      if (record.playing) {
        material.map = texture;
        material.needsUpdate = true;
      }
      invalidate();
    });
    return record;
  });
  function pause() {
    records.forEach((record) => {
      record.playing = false;
      record.video.pause();
    });
  }
  return {
    records,
    mount(frame, index, box, brass, wood) {
      const { project, material } = records[index % records.length];
      const width = 3.7,
        height = width * 0.625;
      box(frame, 0, 2.04, 0.11, width + 0.24, height + 0.24, 0.16, wood);
      for (const side of [-1, 1]) {
        box(
          frame,
          side * (width / 2 + 0.05),
          2.04,
          0.22,
          0.08,
          height + 0.2,
          0.07,
          brass,
        );
        box(
          frame,
          0,
          2.04 + side * (height / 2 + 0.05),
          0.22,
          width + 0.2,
          0.08,
          0.07,
          brass,
        );
      }
      const picture = new THREE.Mesh(
        new THREE.PlaneGeometry(width, height),
        material,
      );
      picture.position.set(0, 2.04, 0.215);
      frame.add(picture);
      const canvas = document.createElement("canvas");
      canvas.width = 1024;
      canvas.height = 176;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#192322";
      ctx.fillRect(0, 0, 1024, 176);
      ctx.strokeStyle = "#9a8050";
      ctx.strokeRect(8, 8, 1008, 160);
      ctx.textAlign = "center";
      ctx.fillStyle = "#e8d6ac";
      ctx.font = "42px Georgia";
      ctx.fillText(project.title, 512, 75);
      ctx.fillStyle = "#b6ad8f";
      ctx.font = "22px sans-serif";
      ctx.fillText(project.subtitle.toUpperCase(), 512, 124);
      const label = new THREE.CanvasTexture(canvas);
      label.colorSpace = THREE.SRGBColorSpace;
      const plaque = new THREE.Mesh(
        new THREE.PlaneGeometry(3.9, 0.67),
        new THREE.MeshBasicMaterial({ map: label, toneMapped: false }),
      );
      plaque.position.set(0, 0.43, 0.17);
      frame.add(plaque);
    },
    update({ progress, reducedMotion, exploring }) {
      const visible = progress > 0.78 && progress < 4.8;
      const playing =
        visible && exploring && !reducedMotion && !document.hidden;
      records.forEach((record) => {
        if (playing && !record.requested) {
          record.video.src = record.project.video;
          record.requested = true;
        }
        if (record.playing !== playing) {
          record.playing = playing;
          if (playing) record.video.play().catch(() => {});
          else record.video.pause();
        }
        const map =
          reducedMotion || record.video.readyState < 2
            ? record.poster
            : record.texture;
        if (record.material.map !== map) {
          record.material.map = map;
          record.material.needsUpdate = true;
        }
      });
    },
    pause,
    dispose() {
      disposed = true;
      pause();
      records.forEach(({ video, texture, poster }) => {
        video.removeAttribute("src");
        video.load();
        texture.dispose();
        poster.dispose();
      });
    },
  };
}
