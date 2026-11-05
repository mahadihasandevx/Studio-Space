import Link from "next/link";
import { ArrowLeft, ArrowRight, Compass, House, LifeBuoy, Search } from "lucide-react";

export default function NotFound() {
  return (
    <main className="not-found-page">
      <svg
        className="not-found-illustration"
        viewBox="0 0 640 360"
        role="img"
        aria-labelledby="illustration-title"
      >
        <title id="illustration-title">
          An empty creative studio with a wandering spotlight
        </title>
        <defs>
          <linearGradient id="studioGlow" x1="0" x2="1" y1="0" y2="1">
            <stop stopColor="#635BFF" stopOpacity=".75" />
            <stop offset="1" stopColor="#FF647C" stopOpacity=".12" />
          </linearGradient>
        </defs>
        <rect
          x="70"
          y="46"
          width="500"
          height="270"
          rx="28"
          fill="var(--surface)"
          stroke="var(--line)"
          strokeWidth="2"
        />
        <path
          d="M95 250h450M155 250V112h115v138M295 250V92h115v158"
          fill="none"
          stroke="var(--line)"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <path d="M340 93 465 248H215z" fill="url(#studioGlow)" className="not-found-beam" />
        <circle cx="340" cy="94" r="13" fill="#FF647C" className="not-found-light" />
        <path d="M218 282h205" stroke="var(--accent)" strokeWidth="8" strokeLinecap="round" />
        <text
          x="320"
          y="220"
          textAnchor="middle"
          fill="var(--ink)"
          fontSize="68"
          fontFamily="var(--font-display)"
          fontWeight="700"
        >
          404
        </text>
      </svg>
      <p className="eyebrow">Wrong room, right idea</p>
      <h1>This page isn’t on set.</h1>
      <p>
        It may have moved, or the link may have taken a wrong turn. Let’s find
        your way back to the studios.
      </p>
      <div className="not-found-actions">
        <Link className="button button-accent" href="/studios">
          <Search size={16} aria-hidden="true" /> Explore studios
        </Link>
        <Link className="button button-outline" href="/">
          <House size={16} aria-hidden="true" /> Return home
        </Link>
      </div>
      <div className="not-found-links">
        <Link href="/how-it-works">
          <Compass size={15} aria-hidden="true" /> How it works
        </Link>
        <Link href="/about">
          <LifeBuoy size={15} aria-hidden="true" /> About StudioSpace
        </Link>
        <Link href="/login">
          <ArrowRight size={15} aria-hidden="true" /> Sign in
        </Link>
      </div>
      <Link className="not-found-back" href="/studios">
        <ArrowLeft size={14} aria-hidden="true" /> Back to all studios
      </Link>
    </main>
  );
}
