import { useEffect, useRef, useState } from "react";
import { showcases } from "../data/showcases.js";

export default function ProjectGallery({
  open,
  onClose,
  reducedMotion,
  initialIndex = 0,
}) {
  const dialog = useRef(null);
  const video = useRef(null);
  const [index, setIndex] = useState(0);
  const project = showcases[index];
  useEffect(() => {
    if (open) setIndex(initialIndex);
  }, [open, initialIndex]);
  useEffect(() => {
    const element = dialog.current;
    if (open && !element.open) element.showModal();
    if (!open && element.open) element.close();
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);
  useEffect(() => {
    const element = video.current;
    if (!element) return;
    const update = () => {
      if (!open || reducedMotion || document.hidden) element.pause();
      else element.play().catch(() => {});
    };
    update();
    document.addEventListener("visibilitychange", update);
    return () => {
      document.removeEventListener("visibilitychange", update);
      element.pause();
    };
  }, [open, index, reducedMotion]);
  return (
    <dialog
      className="project-gallery"
      ref={dialog}
      aria-labelledby="gallery-title"
      onCancel={onClose}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === dialog.current) onClose();
      }}
    >
      <div className="project-gallery__body">
        <div className="project-gallery__heading">
          <div>
            <span className="eyebrow">THE MOVING WINDOWS</span>
            <h2 id="gallery-title">A closer look at the work.</h2>
          </div>
          <button
            className="gallery-close"
            onClick={onClose}
            aria-label="Close project previews"
            autoFocus
          >
            ×
          </button>
        </div>
        <nav
          aria-label="Choose a project preview"
          className="project-gallery__tabs"
        >
          {showcases.map((item, i) => (
            <button
              key={item.id}
              aria-pressed={i === index}
              onClick={() => setIndex(i)}
            >
              {item.title}
            </button>
          ))}
        </nav>
        {open && (
          <video
            ref={video}
            key={project.id}
            className="project-gallery__video"
            src={project.video}
            poster={project.poster}
            muted
            loop
            playsInline
            controls
            preload="metadata"
            aria-label={`Scrolling design preview of ${project.title}`}
          />
        )}
        <div className="project-gallery__caption">
          <div>
            <h3>{project.title}</h3>
            <p>{project.subtitle}</p>
          </div>
          <a href={project.url} target="_blank" rel="noreferrer">
            Visit the website <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
    </dialog>
  );
}
