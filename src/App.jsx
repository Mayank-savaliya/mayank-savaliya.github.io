import { useEffect, useMemo, useState } from "react";
import World from "./components/World.jsx";
import MagicalIntro from "./components/MagicalIntro.jsx";
import { preloadPortfolio } from "./lib/preloadPortfolio.js";
import AtmosphereControls from "./components/AtmosphereControls.jsx";
import Transfiguration from "./components/Transfiguration.jsx";
import LivingNewspaper from "./components/LivingNewspaper.jsx";
import ProjectGallery from "./components/ProjectGallery.jsx";
import {
  ChapterNote,
  JourneyMap,
  JourneyPassage,
} from "./components/Journey.jsx";
import { journeyStops } from "./data/journey.js";
import { useJourney } from "./lib/useJourney.js";
import { Corners, Ornament } from "./components/Ornament.jsx";
import { LIGHTS, SEASONS, resolveAtmosphere } from "./lib/atmosphere.js";
import {
  profile,
  experience,
  projects,
  skills,
  fieldNotes,
} from "./data/portfolio.js";

function Star({ className = "" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="m20 1 4 15 15 4-15 4-4 15-4-15L1 20l15-4Z"
        stroke="currentColor"
      />
      <path d="m20 10 2 8 8 2-8 2-2 8-2-8-8-2 8-2Z" fill="currentColor" />
    </svg>
  );
}
function Crest({ className = "" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 74"
      fill="none"
      aria-hidden="true"
    >
      <path d="M9 12h46v35L32 65 9 47Z" stroke="currentColor" />
      <path d="M13 16h38v29L32 59 13 45Z" stroke="currentColor" opacity=".45" />
      <path
        d="m21 41 3-18 8 13 8-13 3 18M22 48h20"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="m32 0 2 5 5 2-5 2-2 5-2-5-5-2 5-2Z" fill="currentColor" />
      <path d="M3 31 0 36l4 6M61 31l3 5-4 6" stroke="currentColor" />
    </svg>
  );
}
function Arrow({ down = false }) {
  return (
    <span aria-hidden="true" className="arrow">
      {down ? "↓" : "↗"}
    </span>
  );
}
const chapters = [
  { id: "transfiguration", label: "Transfiguration" },
  { id: "story", label: "The story" },
  { id: "work", label: "The Chronicle" },
  { id: "spellbook", label: "The spellbook" },
];

export default function App() {
  const [entered, setEntered] = useState(false);
  const [introVisible, setIntroVisible] = useState(true);
  const [worldReady, setWorldReady] = useState(false);
  const [contentReady, setContentReady] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const [overrides, setOverrides] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const light = params.get("light");
    const season = params.get("season");
    return {
      light: LIGHTS.includes(light) ? light : "auto",
      season: SEASONS.includes(season) ? season : "auto",
    };
  });
  const [systemReduced, setSystemReduced] = useState(
    () => matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const reducedMotion = systemReduced;
  const atmosphere = useMemo(
    () => resolveAtmosphere(now, overrides),
    [now, overrides],
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  function openGallery(index = 0) {
    setGalleryIndex(index);
    setGalleryOpen(true);
  }
  const { route, stopIndex, active } = useJourney();
  const [copyStatus, setCopyStatus] = useState("idle");

  useEffect(() => {
    let active = true;
    preloadPortfolio().then(() => {
      if (active) setContentReady(true);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    const query = matchMedia("(prefers-reduced-motion: reduce)");
    const handle = (event) => setSystemReduced(event.matches);
    query.addEventListener("change", handle);
    return () => {
      clearInterval(timer);
      query.removeEventListener("change", handle);
    };
  }, []);
  useEffect(() => {
    document.documentElement.dataset.light = atmosphere.light;
    document.documentElement.dataset.season = atmosphere.season;
    document.documentElement.dataset.motion = reducedMotion
      ? "reduced"
      : "full";
  }, [atmosphere, reducedMotion]);
  useEffect(() => {
    if (!menuOpen) return;
    const escape = (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        document.querySelector(".menu-toggle")?.focus();
      }
    };
    document.addEventListener("keydown", escape);
    return () => document.removeEventListener("keydown", escape);
  }, [menuOpen]);
  useEffect(() => {
    if (copyStatus === "idle") return;
    const timer = setTimeout(() => setCopyStatus("idle"), 2600);
    return () => clearTimeout(timer);
  }, [copyStatus]);
  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("unavailable");
    }
  }

  return (
    <>
      {introVisible && (
        <MagicalIntro
          ready={worldReady && contentReady}
          reducedMotion={reducedMotion}
          onReveal={() => setEntered(true)}
          onComplete={() => {
            setIntroVisible(false);
            requestAnimationFrame(() =>
              document.getElementById("main")?.focus({ preventScroll: true }),
            );
          }}
        />
      )}
      <div
        className={`portfolio-site ${!entered ? "portfolio-site--veiled" : ""}`}
        inert={!entered}
        aria-hidden={!entered ? "true" : undefined}
      >
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <World
          atmosphere={atmosphere}
          reducedMotion={reducedMotion || galleryOpen || !entered}
          route={route}
          onReady={() => setWorldReady(true)}
        />
        <header
          className={`site-header ${active !== "arrival" ? "site-header--scrolled" : ""}`}
        >
          <a
            className="brand"
            href="#arrival"
            aria-label="Mayank Savaliya, back to the beginning"
          >
            <Crest />
            <span>
              Mayank Savaliya<small>ENGINEER. BUILDER. CURIOUS MIND.</small>
            </span>
          </a>
          <button
            className="menu-toggle"
            aria-expanded={menuOpen}
            aria-controls="primary-nav"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? "Close" : "Explore"}
            <span aria-hidden="true">{menuOpen ? "−" : "+"}</span>
          </button>
          <nav
            id="primary-nav"
            className={menuOpen ? "nav-open" : ""}
            aria-label="Main navigation"
          >
            {chapters.map((chapter) => (
              <a
                key={chapter.id}
                href={`#${chapter.id}`}
                aria-current={active === chapter.id ? "location" : undefined}
                onClick={() => setMenuOpen(false)}
              >
                {chapter.label}
              </a>
            ))}
            <a
              className="nav-resume"
              href={profile.resume}
              download="Mayank-Savaliya-Resume.pdf"
            >
              Resume <Arrow />
            </a>
          </nav>
        </header>

        <main id="main" tabIndex={-1}>
          <section id="arrival" className="hero" aria-labelledby="hero-heading">
            <div className="arrival-stage">
              <div className="hero-content">
                <div className="eyebrow hero-eyebrow">
                  <span /> Associate Tech Lead · Full-stack engineer
                </div>
                <h1 id="hero-heading">
                  Real-world craft.
                  <br />
                  <em>A little magic.</em>
                </h1>
                <div className="hero-rule">
                  <Star />
                  <span />
                </div>
                <p className="hero-introduction">
                  I’m <strong>Mayank Savaliya.</strong> I turn ambitious ideas
                  into products and systems people can rely on.
                </p>
                <p className="hero-description">
                  Six years of building at AlmaConnect. A portfolio of real
                  work, told through a slightly enchanted world.
                </p>
                <div className="hero-actions">
                  <a className="button button-gold" href="#approach">
                    Enter the grounds <Arrow down />
                  </a>
                  <a className="text-link" href="#work">
                    Go straight to the work <Arrow />
                  </a>
                </div>
              </div>
              <ChapterNote stop={journeyStops[0]} intro />
            </div>
            <div className="hero-footer">
              <div className="hero-caption">
                <span className="eyebrow">01 / 06 — The castle</span>
                <span className="scene-caption">
                  A lantern-lit path through the work, the story, and the
                  toolkit.
                </span>
              </div>
              <a className="scroll-cue" href="#approach">
                <span>FOLLOW THE LANTERNS</span>
                <i aria-hidden="true" />
              </a>
            </div>
          </section>

          <JourneyPassage index={1} onExplore={() => openGallery()} />
          <Transfiguration reducedMotion={reducedMotion} />

          <JourneyPassage index={2} />
          <section
            id="story"
            className="story section-shell"
            aria-labelledby="story-heading"
          >
            <div className="chapter-label">
              <span>03</span>
              <i />
              The person behind the pages
            </div>
            <div className="story-opening">
              <div>
                <span className="eyebrow">A little about me</span>
                <h2 id="story-heading">
                  Curiosity started it.
                  <br />
                  <em>Craft keeps it going.</em>
                </h2>
              </div>
              <div className="story-copy">
                <p>
                  I’m a hands-on full-stack engineer who enjoys the whole
                  journey: making sense of a problem, designing the system, and
                  shipping something people can rely on.
                </p>
                <p>
                  Over six years at AlmaConnect, I’ve grown from intern to
                  Associate Tech Lead by owning products from the first data
                  model to the last production detail.
                </p>
                <p className="education-note">
                  B.Tech. in Information & Communication Technology
                  <br />
                  <strong>DA-IICT, Gandhinagar · 2016–2020</strong>
                </p>
              </div>
            </div>
            <div
              className="impact-strip"
              aria-label="Selected engineering outcomes"
            >
              <div>
                <strong>
                  1.2B<span>+</span>
                </strong>
                <span>Background jobs / month</span>
              </div>
              <div>
                <strong>37M</strong>
                <span>Records in optimized search</span>
              </div>
              <div>
                <strong>
                  41<span>%</span>
                </strong>
                <span>Less search index storage</span>
              </div>
              <div>
                <strong>
                  6<span>+</span>
                </strong>
                <span>Years of building & learning</span>
              </div>
            </div>
            <div className="career-heading">
              <h3>The story so far.</h3>
              <span className="eyebrow">Four chapters. AlmaConnect.</span>
            </div>
            <div className="career-ledger">
              {experience.map((job, index) => (
                <details
                  key={job.chapter}
                  className="career-entry"
                  open={index === 0 ? true : undefined}
                >
                  <summary>
                    <span className="chapter-numeral">{job.chapter}</span>
                    <span className="career-title">
                      <small>{job.short}</small>
                      <strong>{job.title}</strong>
                    </span>
                    <span className="career-dates">{job.dates}</span>
                    <span className="expand-mark" aria-hidden="true">
                      +
                    </span>
                  </summary>
                  <div className="career-details">
                    <p>{job.text}</p>
                    <ul>
                      {job.points.map((point) => (
                        <li key={point}>{point}</li>
                      ))}
                    </ul>
                    <span className="career-stack">{job.stack}</span>
                  </div>
                </details>
              ))}
            </div>
          </section>

          <JourneyPassage index={3} onExplore={() => openGallery()} />
          <section
            id="work"
            className="newspaper-section"
            aria-labelledby="work-heading"
          >
            <div className="paper-tab">
              <Star />
              <span>Dispatches from the real world</span>
              <Star />
            </div>
            <div className="newspaper">
              <div className="newspaper-topline">
                <span>INDEPENDENTLY BUILT. THOUGHTFULLY ENGINEERED.</span>
                <span>EST. 2020</span>
              </div>
              <div className="masthead">
                <div className="masthead-seal">
                  <Crest />
                </div>
                <h2 id="work-heading">The Mayank Chronicle</h2>
                <span className="masthead-price">
                  A PENNY
                  <br />
                  FOR YOUR
                  <br />
                  <strong>CURIOSITY</strong>
                </span>
              </div>
              <div className="edition-line">
                <span>VOL. VI · MY RECENT WORK</span>
                <time dateTime={now.toLocaleDateString("en-CA")}>
                  {now.toLocaleDateString("en-GB", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </time>
                <span>THE ENGINEERING EDITION</span>
              </div>
              <div className="front-page-title">
                <span className="eyebrow">Extra! Extra!</span>
                <h3>
                  Extraordinary things.
                  <br />
                  <em>Built in the real world.</em>
                </h3>
                <p>
                  A collection of products, platforms, and the engineering that
                  makes them possible.
                </p>
              </div>
              <LivingNewspaper
                reducedMotion={reducedMotion}
                suspended={galleryOpen || !entered}
                onExplore={openGallery}
              />
              <div className="work-column-heading">
                <Ornament />
                <h3>My Recent Work</h3>
                <Ornament />
              </div>
              <div className="news-grid">
                {projects.map((project, index) => (
                  <article className="news-article" key={project.id}>
                    <div className="article-kicker">
                      <span>{project.category}</span>
                      <span>NO. 0{index + 1}</span>
                    </div>
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="article-image-link"
                      aria-label={`Visit ${project.name}`}
                    >
                      <figure>
                        <div className="project-photo-mount">
                          <Corners />
                          <img
                            src={project.image}
                            alt={project.imageAlt}
                            loading="lazy"
                            decoding="async"
                            width="1200"
                            height="750"
                          />
                        </div>
                        <figcaption>{project.caption}</figcaption>
                      </figure>
                      <span className="photo-corner" aria-hidden="true">
                        <Arrow />
                      </span>
                    </a>
                    <span className="article-name">{project.name}</span>
                    <h4>
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {project.title}
                      </a>
                    </h4>
                    <p className="article-description">{project.description}</p>
                    <div className="article-footer">
                      <span>{project.tech}</span>
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Explore ${project.name}`}
                      >
                        Explore <Arrow />
                      </a>
                    </div>
                  </article>
                ))}
              </div>
              <div className="desk-heading">
                <span /> <Star />
                <h3>From the engineering desk</h3>
                <Star />
                <span />
              </div>
              <div className="field-notes">
                {fieldNotes.map((note) => (
                  <article key={note.title}>
                    <span className="eyebrow">{note.label}</span>
                    <h4>{note.title}</h4>
                    <p>{note.text}</p>
                  </article>
                ))}
              </div>
              <div className="newspaper-bottomline">
                <span>ALL THE WORK THAT’S FIT TO PRINT</span>
                <Star />
                <span>CONTINUED IN THE NEXT CHAPTER ↓</span>
              </div>
            </div>
          </section>

          <JourneyPassage index={4} />
          <section
            id="spellbook"
            className="spellbook section-shell"
            aria-labelledby="skills-heading"
          >
            <div className="chapter-label">
              <span>05</span>
              <i />
              Collected knowledge
            </div>
            <div className="spellbook-heading">
              <span className="eyebrow">The well-used spellbook</span>
              <h2 id="skills-heading">
                The tools change.
                <br />
                <em>The curiosity stays.</em>
              </h2>
              <p>
                A collection of languages, systems, and ideas gathered along the
                way.
                <br />
                Some used every day. Others, paths worth exploring.
              </p>
            </div>
            <div className="spellbook-grid">
              {skills.map((group) => (
                <article className="skill-page" key={group.number}>
                  <Corners />
                  <div className="skill-number">
                    <span>{group.number}</span>
                    <Star />
                  </div>
                  <span className="eyebrow">{group.subtitle}</span>
                  <h3>{group.name}</h3>
                  <ul>
                    {group.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
            <div className="book-colophon">
              <span>Knowledge grows best when shared.</span>
              <Star />
              <span>Always a work in progress.</span>
            </div>
          </section>

          <JourneyPassage index={5} />
          <section
            id="contact"
            className="contact-section section-shell"
            aria-labelledby="contact-heading"
          >
            <div className="chapter-label">
              <span>06</span>
              <i />
              The next chapter
            </div>
            <div className="contact-layout">
              <div>
                <span className="eyebrow">No owl required</span>
                <h2 id="contact-heading">
                  Good things begin
                  <br />
                  with a little <em>hello.</em>
                </h2>
                <p>
                  Have an interesting problem, a big idea, or simply a story to
                  share?
                  <br />
                  There’s always room for a good conversation.
                </p>
                <a className="contact-email" href={`mailto:${profile.email}`}>
                  {profile.email}
                  <Arrow />
                </a>
                <div className="contact-links">
                  <a
                    href={profile.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    LinkedIn <Arrow />
                  </a>
                  <a
                    href={profile.github}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    GitHub <Arrow />
                  </a>
                  <button onClick={copyEmail} aria-live="polite">
                    {copyStatus === "copied"
                      ? "Email copied ✓"
                      : copyStatus === "unavailable"
                        ? "Copy unavailable"
                        : "Copy email ⧉"}
                  </button>
                </div>
              </div>
              <a
                href={`mailto:${profile.email}`}
                className="letter"
                aria-label="Send Mayank an email"
              >
                <div className="letter-paper">
                  <span>
                    To the next
                    <br />
                    <em>great adventure.</em>
                  </span>
                  <Star />
                  <small>YOURS, MAYANK</small>
                </div>
                <div className="envelope-fold" />
                <div className="wax-seal">
                  <Crest />
                </div>
              </a>
            </div>
          </section>
        </main>

        <footer className="site-footer">
          <a href="#arrival" className="footer-brand">
            <Crest />
            <span>Mayank Savaliya</span>
          </a>
          <span>Made of code, curiosity & a little magic.</span>
          <a href="#arrival">Back to the beginning ↑</a>
          <small>© {now.getFullYear()} Mayank Savaliya</small>
        </footer>
        <JourneyMap stopIndex={stopIndex} />
        <ProjectGallery
          open={galleryOpen}
          initialIndex={galleryIndex}
          onClose={() => setGalleryOpen(false)}
          reducedMotion={reducedMotion}
        />
        <AtmosphereControls
          atmosphere={atmosphere}
          overrides={overrides}
          setOverrides={setOverrides}
        />
      </div>
    </>
  );
}
