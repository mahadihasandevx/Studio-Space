"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, RotateCw, Search, SlidersHorizontal } from "lucide-react";
import { ApiError, apiRequest } from "@/lib/api";
import { StudioCard } from "@/components/studio-card";
import { studioCardSchema } from "@/lib/studios";
import { z } from "zod";

const studioListResponseSchema = z.object({
  data: z.array(studioCardSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});

type Filters = {
  search: string;
  category: string;
  location: string;
  minPrice: string;
  maxPrice: string;
  sort: string;
  page: number;
};

const defaultFilters: Filters = {
  search: "",
  category: "",
  location: "",
  minPrice: "",
  maxPrice: "",
  sort: "newest",
  page: 1,
};

export function StudioExplorer({ initialCategory = "" }: { initialCategory?: string }) {
  const searchParams = useSearchParams();
  const [retry, setRetry] = useState(0);
  const [filters, setFilters] = useState<Filters>({
    ...defaultFilters,
    category: initialCategory || searchParams.get("category") || "",
  });
  const [studios, setStudios] = useState<z.infer<typeof studioCardSchema>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      const params = new URLSearchParams();
      for (const key of ["search", "category", "location", "minPrice", "maxPrice", "sort"] as const) {
        const value = filters[key];
        if (value) params.set(key, value);
      }
      params.set("page", String(filters.page));
      params.set("limit", "12");

      const query = params.toString();
      window.history.replaceState(null, "", query ? `/studios?${query}` : "/studios");

      try {
        const result = await apiRequest(
          `/api/v1/studios?${query}`,
          studioListResponseSchema,
          { signal: controller.signal },
        );
        setStudios(result.data);
        setTotal(result.pagination.total);
        setTotalPages(result.pagination.totalPages);
        setError(null);
      } catch (requestError) {
        if (controller.signal.aborted) return;
        setError(
          requestError instanceof ApiError
            ? requestError.message
            : requestError instanceof Error
              ? requestError.message
              : "Studios could not be loaded.",
        );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 180);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [filters, retry]);

  function updateFilter<Key extends keyof Filters>(key: Key, value: Filters[Key]) {
    setLoading(true);
    setFilters((current) => ({
      ...current,
      [key]: value,
      page: key === "page" && typeof value === "number" ? value : 1,
    }));
  }

  return (
    <main className="explore-page">
      <section className="explore-intro">
        <div className="section-wrap">
          <p className="eyebrow">A good place to get started</p>
          <h1>Find your next<br /><em>creative space.</em></h1>
          <p>Thoughtful studios and production spaces, ready when inspiration strikes.</p>
          <span className="explore-intro-mark" aria-hidden="true"><SlidersHorizontal size={22} /></span>
        </div>
      </section>

      <section className="section-wrap explore-results">
        <div className="explore-toolbar">
          <div className="explore-result-count">
            <strong>{loading ? "Finding spaces…" : `${total} ${total === 1 ? "space" : "spaces"}`}</strong>
            <span>to make something good</span>
          </div>
          <label className="explore-search">
            <Search size={16} aria-hidden="true" />
            <span className="sr-only">Search studios</span>
            <input
              onChange={(event) => updateFilter("search", event.target.value)}
              placeholder="Search by name or location"
              value={filters.search}
            />
          </label>
          <select
            aria-label="Sort studios"
            className="filter-select"
            onChange={(event) => updateFilter("sort", event.target.value)}
            value={filters.sort}
          >
            <option value="newest">Newest first</option>
            <option value="price-low">Price: low to high</option>
            <option value="price-high">Price: high to low</option>
            <option value="rating">Top rated</option>
          </select>
        </div>

        <div className="explore-filters">
          <label>
            <span>Category</span>
            <select onChange={(event) => updateFilter("category", event.target.value)} value={filters.category}>
              <option value="">All spaces</option>
              <option value="Photo Studios">Photo studios</option>
              <option value="Film Stages">Film stages</option>
              <option value="Podcast Rooms">Podcast rooms</option>
              <option value="Music Suites">Music suites</option>
              <option value="Art Workshops">Art workshops</option>
            </select>
          </label>
          <label>
            <span>Location</span>
            <input
              onChange={(event) => updateFilter("location", event.target.value)}
              placeholder="City or neighborhood"
              value={filters.location}
            />
          </label>
          <label>
            <span>Min. hourly price</span>
            <input
              min="0"
              onChange={(event) => updateFilter("minPrice", event.target.value)}
              placeholder="$0"
              type="number"
              value={filters.minPrice}
            />
          </label>
          <label>
            <span>Max. hourly price</span>
            <input
              min="0"
              onChange={(event) => updateFilter("maxPrice", event.target.value)}
              placeholder="Any"
              type="number"
              value={filters.maxPrice}
            />
          </label>
        </div>

        {error ? (
          <div className="data-state explore-state" role="alert">
            <div><strong>We couldn’t find those spaces.</strong><p>{error}</p></div>
            <button
              className="button button-outline"
              onClick={() => setRetry((count) => count + 1)}
              type="button"
            >
              Try again <RotateCw size={15} aria-hidden="true" />
            </button>
          </div>
        ) : loading ? (
          <div className="studio-grid explore-grid" aria-label="Loading studios">
            {Array.from({ length: 6 }, (_, index) => (
              <div className="studio-skeleton" key={index}>
                <div className="skeleton-image" />
                <div className="skeleton-line skeleton-short" />
                <div className="skeleton-line" />
                <div className="skeleton-line skeleton-medium" />
              </div>
            ))}
          </div>
        ) : studios.length === 0 ? (
          <div className="data-state data-state-empty explore-state">
            <div><strong>No spaces match those filters yet.</strong><p>Try a different search or clear a filter to see more studios.</p></div>
            <button
              className="button button-outline"
              onClick={() => {
                setLoading(true);
                setFilters({ ...defaultFilters });
              }}
              type="button"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <>
            <div className="studio-grid explore-grid">
              {studios.map((studio) => <StudioCard key={studio.id} studio={studio} />)}
            </div>
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  aria-label="Previous page"
                  disabled={filters.page <= 1 || loading}
                  onClick={() => updateFilter("page", filters.page - 1)}
                  type="button"
                >
                  <ArrowLeft size={16} />
                </button>
                <span>Page <strong>{filters.page}</strong> of <strong>{totalPages}</strong></span>
                <button
                  aria-label="Next page"
                  disabled={filters.page >= totalPages || loading}
                  onClick={() => updateFilter("page", filters.page + 1)}
                  type="button"
                >
                  <ArrowRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </section>
      <section className="explore-host-cta">
        <p>Have a space that sparks ideas?</p>
        <Link href="/add-studio">Share it with the community <ArrowRight size={16} /></Link>
      </section>
    </main>
  );
}
