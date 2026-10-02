// Locally drawn vector artwork: the Cloak, Stone, and Elder Wand.
export default function DeathlyHallows() {
  return (
    <svg
      className="hallows-mark"
      viewBox="0 0 600 600"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id="hallows-metal"
          x1="44"
          y1="40"
          x2="279"
          y2="282"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#fff2cc" />
          <stop offset=".28" stopColor="#b3cbd2" />
          <stop offset=".54" stopColor="#f4e3b7" />
          <stop offset=".76" stopColor="#b29c71" />
          <stop offset="1" stopColor="#f0ddb0" />
        </linearGradient>
        <linearGradient
          id="wand-metal"
          x1="154"
          y1="140"
          x2="165"
          y2="140"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#665b49" />
          <stop offset=".42" stopColor="#f7e5b7" />
          <stop offset=".68" stopColor="#b6c2be" />
          <stop offset="1" stopColor="#6c685a" />
        </linearGradient>
        <filter id="hallows-halo" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>
      <g transform="translate(84 70.5) scale(1.35)">
        <g
          className="hallows-aura"
          stroke="#c8e2e9"
          strokeWidth="3"
          filter="url(#hallows-halo)"
        >
          <path
            className="hallows-triangle"
            pathLength="1"
            d="M160 52 38 264h244L160 52Z"
          />
          <circle
            className="hallows-circle"
            pathLength="1"
            cx="160"
            cy="193.5"
            r="70.5"
            transform="rotate(-90 160 193.5)"
          />
          <path className="hallows-wand-trace" pathLength="1" d="M160 26v263" />
        </g>
        <g stroke="url(#hallows-metal)" strokeLinejoin="round">
          <path
            className="hallows-triangle"
            pathLength="1"
            strokeWidth="3.2"
            d="M160 52 38 264h244L160 52Z"
          />
          <path
            className="hallows-triangle hallows-fine"
            pathLength="1"
            strokeWidth=".7"
            d="M160 65 49 257h222L160 65Z"
          />
          <circle
            className="hallows-circle"
            pathLength="1"
            strokeWidth="2.8"
            cx="160"
            cy="193.5"
            r="70.5"
            transform="rotate(-90 160 193.5)"
          />
          <circle
            className="hallows-circle hallows-fine"
            pathLength="1"
            strokeWidth=".65"
            cx="160"
            cy="193.5"
            r="65.5"
            transform="rotate(-90 160 193.5)"
          />
        </g>
        <path
          className="hallows-wand-trace"
          pathLength="1"
          stroke="#e5eaf0"
          strokeWidth="1.2"
          d="M160 26v263"
        />
        <g
          className="hallows-elder-wand"
          fill="url(#wand-metal)"
          stroke="#e9dbb9"
          strokeWidth=".45"
        >
          <path d="M159.3 23h1.4l.4 30 1.1 9-.5 13 1.9 8-1.6 11.5.1 20.5 2.1 8.5-1.8 9.5-.4 25 1.9 8.5-.9 10.5 1.5 16-1.1 10 .6 27 2.1 8-1.8 11.5-.6 12.5-2.1 10-.9 13h-1.4l-.9-13-2.1-10-.6-12.5-1.8-11.5 2.1-8 .6-27-1.1-10 1.5-16-.9-10.5 1.9-8.5-.4-25-1.8-9.5 2.1-8.5.1-20.5-1.6-11.5 1.9-8-.5-13 1.1-9 .4-30Z" />
          <g stroke="#574d3e" strokeWidth=".8">
            <path d="m158 82 4 1m-4 3 4 1m-4 3 4 1m-4 32 4 1m-4 3 4 1m-4 3 4 1m-4 35 4 1m-4 3 4 1m-4 3 4 1m-5 61 6 1m-6 3 6 1m-6 3 6 1m-5 15 4 1m-4 3 4 1" />
          </g>
        </g>
      </g>
    </svg>
  );
}
