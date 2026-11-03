import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main className="not-found-page">
      <svg className="not-found-illustration" viewBox="0 0 640 360" role="img" aria-labelledby="illustration-title">
        <title id="illustration-title">An empty creative studio with a wandering spotlight</title>
        <defs>
          <linearGradient id="studioGlow" x1="0" x2="1" y1="0" y2="1"><stop stopColor="#b74cff" stopOpacity=".8" /><stop offset="1" stopColor="#ff784f" stopOpacity=".15" /></linearGradient>
        </defs>
        <rect x="70" y="46" width="500" height="270" rx="28" fill="var(--surface)" stroke="var(--line)" strokeWidth="2" />
        <path d="M95 250h450M155 250V112h115v138M295 250V92h115v158" fill="none" stroke="var(--line)" strokeWidth="8" strokeLinecap="round" />
        <path d="M340 93 465 248H215z" fill="url(#studioGlow)" className="not-found-beam" />
        <circle cx="340" cy="94" r="13" fill="#ff784f" className="not-found-light" />
        <path d="M218 282h205" stroke="var(--accent)" strokeWidth="8" strokeLinecap="round" />
        <text x="320" y="220" textAnchor="middle" fill="var(--ink)" fontSize="68" fontFamily="var(--font-display)" fontWeight="700">404</text>
      </svg>
      <p className="eyebrow">Wrong room, right idea</p>
      <h1>This page isn’t on set.</h1>
      <p>It may have moved, or the link may have taken a wrong turn. Let’s find your way back to the studios.</p>
      <Link className="button button-accent" href="/"><ArrowLeft size={16} /> Return to Home</Link>
    </main>
  );
}
