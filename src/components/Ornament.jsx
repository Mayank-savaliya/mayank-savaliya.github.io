export function Ornament({ className = "" }) {
  return (
    <svg
      className={`ink-ornament ${className}`}
      viewBox="0 0 180 26"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3 13h56m62 0h56M31 13c11-15 29-10 29-3 0 6-10 6-10 1m99 2c-11-15-29-10-29-3 0 6 10 6 10 1M67 13l9-5 14 5-14 5-9-5Zm46 0-9-5-14 5 14 5 9-5Z"
        stroke="currentColor"
      />
      <path d="m90 3 3 7 7 3-7 3-3 7-3-7-7-3 7-3Z" fill="currentColor" />
    </svg>
  );
}

export function Corners() {
  return (
    <span className="engraved-corners" aria-hidden="true">
      {["tl", "tr", "bl", "br"].map((corner) => (
        <svg
          key={corner}
          className={`engraved-corner corner-${corner}`}
          viewBox="0 0 60 60"
          fill="none"
        >
          <path
            d="M3 55V3h52M9 46V9h37M5 39c24 0 32-10 32-29M12 33c16 0 22-8 22-21M13 24c12 1 13-11 5-10-7 1-3 10 3 4M3 53l7-6 4 3-5 7M53 3l-6 7 3 4 7-5"
            stroke="currentColor"
          />
          <path d="m4 4 9 3-6 6Z" fill="currentColor" />
        </svg>
      ))}
    </span>
  );
}
