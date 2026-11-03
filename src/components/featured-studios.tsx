"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, RotateCw } from "lucide-react";
import { z } from "zod";
import { ApiError, apiRequest } from "@/lib/api";
import { studioCardSchema, type StudioCardData } from "@/lib/studios";
import { StudioCard } from "@/components/studio-card";

const featuredResponseSchema = z.object({
  data: z.array(studioCardSchema).max(6),
});

export function FeaturedStudios() {
  const [studios, setStudios] = useState<StudioCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    async function fetchStudios() {
      try {
        const result = await apiRequest(
          "/api/v1/studios/featured",
          featuredResponseSchema,
        );
        if (active) setStudios(result.data);
      } catch (loadError) {
        if (!active) return;
        setError(
          loadError instanceof ApiError
            ? loadError.message
            : loadError instanceof Error
              ? loadError.message
              : "Featured studios could not be loaded.",
        );
      } finally {
        if (active) setLoading(false);
      }
    }

    void fetchStudios();
    return () => {
      active = false;
    };
  }, [attempt]);

  if (loading) {
    return (
      <div className="studio-grid" aria-label="Loading featured studios">
        {Array.from({ length: 3 }, (_, index) => (
          <div className="studio-skeleton" key={index}>
            <div className="skeleton-image" />
            <div className="skeleton-line skeleton-short" />
            <div className="skeleton-line" />
            <div className="skeleton-line skeleton-medium" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="data-state" role="alert">
        <div>
          <strong>We couldn’t load the studios just now.</strong>
          <p>{error}</p>
        </div>
        <button
          className="button button-outline"
          onClick={() => {
            setLoading(true);
            setError(null);
            setAttempt((value) => value + 1);
          }}
          type="button"
        >
          Try again <RotateCw size={15} aria-hidden="true" />
        </button>
      </div>
    );
  }

  if (studios.length === 0) {
    return (
      <div className="data-state data-state-empty">
        <div>
          <strong>New spaces are on the way.</strong>
          <p>There aren’t any published studios yet. Check back soon or share your own space.</p>
        </div>
        <Link className="button button-outline" href="/add-studio">
          List a studio <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
    );
  }

  return (
    <div className="studio-grid">
      {studios.map((studio) => <StudioCard key={studio.id} studio={studio} />)}
    </div>
  );
}
