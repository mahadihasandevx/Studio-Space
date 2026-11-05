"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Building2, MapPin, Quote, Shapes, Star } from "lucide-react";
import { animate, useInView, useReducedMotion } from "motion/react";
import { z } from "zod";
import { ApiError, apiRequest } from "@/lib/api";
import {
  marketplaceHighlightsSchema,
  type MarketplaceHighlights,
} from "@/lib/studios";

const highlightsResponseSchema = z.object({
  data: marketplaceHighlightsSchema.shape.data,
});

type DemoMetrics = Pick<
  MarketplaceHighlights,
  "studios" | "cities" | "categories" | "reviews" | "averageRating"
>;

function createDemoMetrics(): DemoMetrics {
  return {
    studios: Math.floor(Math.random() * 25) + 12,
    cities: Math.floor(Math.random() * 9) + 4,
    categories: Math.floor(Math.random() * 3) + 3,
    reviews: Math.floor(Math.random() * 79) + 18,
    averageRating: Number((4.2 + Math.random() * 0.8).toFixed(1)),
  };
}

function Counter({
  value,
  suffix = "",
  decimals = 0,
}: {
  value: number;
  suffix?: string;
  decimals?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const visible = useInView(ref, { once: true, margin: "-80px" });
  const reducedMotion = useReducedMotion();
  const [count, setCount] = useState(0);
  // Show the real value immediately; animate once the stat scrolls into view.
  const settled = reducedMotion || !visible ? value : count;

  useEffect(() => {
    if (!visible || reducedMotion) return;
    const controls = animate(0, value, {
      duration: 1.1,
      ease: "easeOut",
      onUpdate: (latest) => setCount(latest),
    });
    return () => controls.stop();
  }, [reducedMotion, value, visible]);

  return (
    <span className="proof-stat-value" ref={ref}>
      {settled.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  );
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="testimonial-stars" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          size={14}
          aria-hidden="true"
          className={index < Math.round(rating) ? "is-filled" : undefined}
        />
      ))}
    </span>
  );
}

export function HomepageStats() {
  const [highlights, setHighlights] = useState<MarketplaceHighlights | null>(null);
  const [demoMetrics, setDemoMetrics] = useState<DemoMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    apiRequest("/api/v1/studios/highlights", highlightsResponseSchema)
      .then((result) => {
        if (!active) return;
        setHighlights(result.data);
        if (result.data.studios === 0) setDemoMetrics(createDemoMetrics());
      })
      .catch((loadError: unknown) => {
        if (!active) return;
        setError(
          loadError instanceof ApiError || loadError instanceof Error
            ? loadError.message
            : "Marketplace highlights are unavailable.",
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const displayedMetrics =
    highlights && demoMetrics ? { ...highlights, ...demoMetrics } : highlights;

  return (
    <section className="proof-section section-wrap" aria-labelledby="proof-title">
      <div className="proof-heading">
        <div>
          <p className="eyebrow">Good work happens here</p>
          <h2 id="proof-title">Creative spaces, thoughtfully found.</h2>
        </div>
        <p className="section-intro">
          {demoMetrics
            ? "Illustrative demo numbers, randomly generated because the marketplace has no live listings yet."
            : "Live numbers from the StudioSpace marketplace, and reviews written by guests who booked these rooms."}
        </p>
      </div>

      {loading ? (
        <div className="proof-stats" aria-hidden="true">
          {Array.from({ length: 4 }, (_, index) => (
            <article className="proof-stat-skeleton" key={index}>
              <span className="skeleton-line skeleton-short" />
              <span className="skeleton-line skeleton-medium" />
            </article>
          ))}
        </div>
      ) : highlights && displayedMetrics ? (
        <div className="proof-stats">
          <article>
            <span className="proof-stat-icon" aria-hidden="true">
              <Building2 size={18} />
            </span>
            <strong>
              <Counter value={displayedMetrics.studios} />
            </strong>
            <span>studios ready to book</span>
          </article>
          <article>
            <span className="proof-stat-icon" aria-hidden="true">
              <MapPin size={18} />
            </span>
            <strong>
              <Counter value={displayedMetrics.cities} />
            </strong>
            <span>cities and neighborhoods</span>
          </article>
          <article>
            <span className="proof-stat-icon" aria-hidden="true">
              <Shapes size={18} />
            </span>
            <strong>
              <Counter value={displayedMetrics.categories} />
            </strong>
            <span>creative disciplines</span>
          </article>
          <article>
            <span className="proof-stat-icon" aria-hidden="true">
              <Star size={18} />
            </span>
            <strong>
              <Counter value={displayedMetrics.averageRating} decimals={1} />
              <em>/5</em>
            </strong>
            <span>
              average rating across {displayedMetrics.reviews.toLocaleString()}{" "}
              {displayedMetrics.reviews === 1 ? "review" : "reviews"}
            </span>
          </article>
        </div>
      ) : (
        <div className="data-state data-state-empty" role="status">
          <div>
            <strong>Marketplace numbers are taking a break.</strong>
            <p>{error ?? "Please refresh the page to try again."}</p>
          </div>
          <Link className="button button-outline" href="/studios">
            Browse studios
          </Link>
        </div>
      )}

      {highlights && highlights.testimonials.length > 0 && (
        <>
          <div className="testimonial-grid">
            {highlights.testimonials.map((testimonial) => (
              <blockquote key={`${testimonial.studioId}-${testimonial.author}-${testimonial.createdAt}`}>
                <Quote className="testimonial-quote" size={20} aria-hidden="true" />
                <Stars rating={testimonial.rating} />
                <p>“{testimonial.comment}”</p>
                <footer>
                  <strong>{testimonial.author}</strong>
                  <span>
                    Guest review ·{" "}
                    <Link href={`/studios/${testimonial.studioId}`}>
                      {testimonial.studioTitle}
                    </Link>
                  </span>
                </footer>
              </blockquote>
            ))}
          </div>
          <p className="proof-source">
            Reviews published on StudioSpace studio pages.{" "}
            <Link href="/studios">Find your own room to make something in.</Link>
          </p>
        </>
      )}
    </section>
  );
}
