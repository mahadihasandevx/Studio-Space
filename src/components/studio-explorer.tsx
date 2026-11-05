"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
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
  minCapacity: string;
  sort: string;
  page: number;
};

const defaultFilters: Filters = {
  search: "",
  category: "",
  location: "",
  minPrice: "",
  maxPrice: "",
  minCapacity: "",
  sort: "newest",
  page: 1,
};

const listQueryKeys = ["search", "category", "location", "minPrice", "maxPrice", "minCapacity", "sort"] as const;

function filtersFromParams(searchParams: URLSearchParams): Filters {
  const page = Number(searchParams.get("page"));
  return {
    search: searchParams.get("search") ?? "",
    category: searchParams.get("category") || "",
    location: searchParams.get("location") ?? "",
    minPrice: searchParams.get("minPrice") ?? "",
    maxPrice: searchParams.get("maxPrice") ?? "",
    minCapacity: searchParams.get("minCapacity") ?? "",
    sort: searchParams.get("sort") || defaultFilters.sort,
    page: Number.isFinite(page) && page > 0 ? page : 1,
  };
}

function filtersToQuery(filters: Filters): string {
  const params = new URLSearchParams();
  for (const key of listQueryKeys) {
    const value = filters[key];
    if (value) params.set(key, value);
  }
  params.set("page", String(filters.page));
  return params.toString();
}

export function StudioExplorer() {
  const searchParams = useSearchParams();
  const [retry, setRetry] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>(() => filtersFromParams(searchParams));
  const lastAppliedQuery = useRef<string>(filtersToQuery(filtersFromParams(searchParams)));
  const [studios, setStudios] = useState<z.infer<typeof studioCardSchema>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const activeFilterCount = [
    filters.category,
    filters.location,
    filters.minPrice,
    filters.maxPrice,
    filters.minCapacity,
  ].filter(Boolean).length;

  useEffect(() => {
    if (!filtersOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setFiltersOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [filtersOpen]);

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      const query = filtersToQuery(filters);
      lastAppliedQuery.current = query;
      window.history.replaceState(null, "", query ? `/studios?${query}` : "/studios");

      try {
        const result = await apiRequest(
          `/api/v1/studios?${query}&limit=12`,
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

  // Keep filter state in sync with search param changes driven by links
  // (e.g. category links in the footer while already on /studios). The
  // explorer's own fetch effect rewrites the URL first and records that
  // query, so self-inflicted updates are ignored.
  useEffect(() => {
    const nextFilters = filtersFromParams(searchParams);
    const nextQuery = filtersToQuery(nextFilters);
    if (nextQuery === lastAppliedQuery.current) return;
    lastAppliedQuery.current = nextQuery;
    setLoading(true);
    setFilters(nextFilters);
  }, [searchParams]);

  function updateFilter<Key extends keyof Filters>(key: Key, value: Filters[Key]) {
    setLoading(true);
    setFilters((current) => ({
      ...current,
      [key]: value,
      page: key === "page" && typeof value === "number" ? value : 1,
    }));
  }

  function clearFilters() {
    setLoading(true);
    setFilters({ ...defaultFilters });
    setFiltersOpen(false);
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
              type="search"
              value={filters.search}
            />
          </label>
          <button
            aria-controls="studio-filters"
            aria-expanded={filtersOpen}
            className={`filter-toggle${activeFilterCount > 0 ? " has-filters" : ""}`}
            onClick={() => setFiltersOpen((open) => !open)}
            type="button"
          >
            <SlidersHorizontal size={16} aria-hidden="true" />
            Filters
            {activeFilterCount > 0 && <span>{activeFilterCount}</span>}
          </button>
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

        {activeFilterCount > 0 && (
          <div className="active-filters">
            {filters.category && (
              <button onClick={() => updateFilter("category", "")} type="button">
                {filters.category} <X size={12} aria-hidden="true" />
              </button>
            )}
            {filters.location && (
              <button onClick={() => updateFilter("location", "")} type="button">
                {filters.location} <X size={12} aria-hidden="true" />
              </button>
            )}
            {(filters.minPrice || filters.maxPrice) && (
              <button
                onClick={() => {
                  setLoading(true);
                  setFilters((current) => ({ ...current, minPrice: "", maxPrice: "", page: 1 }));
                }}
                type="button"
              >
                ${filters.minPrice || "0"}–${filters.maxPrice || "any"} / hr{" "}
                <X size={12} aria-hidden="true" />
              </button>
            )}
            {filters.minCapacity && (
              <button
                onClick={() => updateFilter("minCapacity", "")}
                type="button"
              >
                {filters.minCapacity}+ people <X size={12} aria-hidden="true" />
              </button>
            )}
            <button className="active-filters-clear" onClick={clearFilters} type="button">
              Clear all
            </button>
          </div>
        )}

        {filtersOpen && (
          <button
            aria-label="Close filters"
            className="filters-backdrop"
            onClick={() => setFiltersOpen(false)}
            type="button"
          />
        )}

        <div
          className={`explore-filters${filtersOpen ? " is-open" : ""}`}
          id="studio-filters"
        >          <div className="explore-filters-heading">
            <strong>Fine-tune your search</strong>
            <button
              aria-label="Close filters"
              className="filters-close"
              onClick={() => setFiltersOpen(false)}
              type="button"
            >
              <X size={16} aria-hidden="true" />
            </button>
          </div>
          <label>
            <span>Category</span>
            <select className="category-filter-select" onChange={(event) => updateFilter("category", event.target.value)} value={filters.category}>
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
          <label>
            <span>Minimum capacity</span>
            <input
              min="1"
              max="1000"
              onChange={(event) => updateFilter("minCapacity", event.target.value)}
              placeholder="Any"
              type="number"
              value={filters.minCapacity}
            />
          </label>
          <button className="button button-accent filters-done" onClick={() => setFiltersOpen(false)} type="button">
            Show {loading ? "spaces" : `${total} ${total === 1 ? "space" : "spaces"}`}
          </button>
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
              onClick={clearFilters}
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
