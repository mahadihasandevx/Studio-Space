"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "motion/react";

function Counter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const visible = useInView(ref, { once: true, margin: "-80px" });
  const reducedMotion = useReducedMotion();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!visible || reducedMotion) return;
    const controls = animate(0, value, {
      duration: 1.25,
      ease: "easeOut",
      onUpdate: (latest) => setCount(Math.round(latest)),
    });
    return () => controls.stop();
  }, [reducedMotion, value, visible]);

  return <span ref={ref}>{(reducedMotion ? value : count).toLocaleString()}{suffix}</span>;
}

export function HomepageStats() {
  return (
    <section className="proof-section section-wrap">
      <div className="proof-heading">
        <p className="eyebrow">Good work happens here</p>
        <h2>Creative spaces, thoughtfully found.</h2>
      </div>
      <div className="proof-stats">
        <article><strong><Counter value={420} suffix="+" /></strong><span>spaces to discover</span></article>
        <article><strong><Counter value={38} /></strong><span>cities and neighborhoods</span></article>
        <article><strong><Counter value={96} suffix="%" /></strong><span>creators book again</span></article>
      </div>
      <div className="testimonial-grid">
        <blockquote><p>“The studio was ready before our crew arrived. We got straight to the work and wrapped on time.”</p><footer><strong>Riley James</strong><span>Independent photographer</span></footer></blockquote>
        <blockquote><p>“I found a rehearsal room that felt like it belonged to us. Booking the hours was the easy part.”</p><footer><strong>Amara Davis</strong><span>Musician and producer</span></footer></blockquote>
        <blockquote><p>“Our podcast guests felt at home, and the sound was clean from the very first take.”</p><footer><strong>Jules Bennett</strong><span>Podcast host</span></footer></blockquote>
      </div>
    </section>
  );
}
