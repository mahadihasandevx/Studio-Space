"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ArrowUpRight,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react";
import { useReducedMotion } from "motion/react";
import { Autoplay, EffectFade } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { z } from "zod";
import "swiper/css";
import "swiper/css/effect-fade";
import { ApiError, apiRequest } from "@/lib/api";
import { imageUnoptimized } from "@/lib/image";
import {
  studioCardSchema,
  studioCategories,
  type StudioCardData,
} from "@/lib/studios";

const featuredResponseSchema = z.object({
  data: z.array(studioCardSchema).max(6),
});

const editorialSlides = [
  {
    category: "Photo studios",
    title: "Find your light.",
    description: "Spaces made for the stories you want to tell.",
    image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1600&q=85",
    href: "/studios?category=Photo%20Studios",
  },
  {
    category: "Film stages",
    title: "Make room for the big idea.",
    description: "Production-ready spaces for your next scene.",
    image: "https://images.unsplash.com/photo-1503428593586-e225b39bddfe?auto=format&fit=crop&w=1600&q=85",
    href: "/studios?category=Film%20Stages",
  },
  {
    category: "Podcast rooms",
    title: "A quieter place to be heard.",
    description: "Discover a room that sounds like your next project.",
    image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1600&q=85",
    href: "/studios?category=Podcast%20Rooms",
  },
];

export function HeroSlider() {
  const router = useRouter();
  const reducedMotion = useReducedMotion();
  const [studios, setStudios] = useState<StudioCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  useEffect(() => {
    let active = true;
    apiRequest("/api/v1/studios/featured", featuredResponseSchema)
      .then((result) => {
        if (active) setStudios(result.data);
      })
      .catch((error: unknown) => {
        if (!active) return;
        if (!(error instanceof ApiError)) console.warn(error);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const slides = useMemo(() => studios.filter((studio) => studio.imageUrl), [studios]);
  const hasEnoughStudios = slides.length >= editorialSlides.length;

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (category) params.set("category", category);
    const query = params.toString();
    router.push(query ? `/studios?${query}` : "/studios");
  }

  return (
    <section className="hero-section" aria-labelledby="hero-title">
      <div className="hero-aurora" aria-hidden="true" />
      <div className="hero-content">
        <div className="hero-copy">
          <span className="hero-kicker">
            <span />
            The creative space marketplace
          </span>
          <h1 id="hero-title">
            Find the room
            <br />
            to make <em>more.</em>
          </h1>
          <p>
            Distinctive photo studios, film stages, podcast rooms, and workshops
            from independent hosts — reserved by the hour, without the back-and-forth.
          </p>

          <form className="hero-search" onSubmit={submitSearch} role="search">
            <label className="hero-search-field">
              <Search size={17} aria-hidden="true" />
              <span className="sr-only">Search studios</span>
              <input
                type="search"
                name="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Studio, neighborhood, or city"
              />
            </label>
            <label className="hero-search-field hero-search-select">
              <span className="sr-only">Studio category</span>
              <select
                name="category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
              >
                <option value="">All categories</option>
                {studioCategories.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <button className="button button-accent hero-search-submit" type="submit">
              Search
              <ArrowRight size={16} aria-hidden="true" />
            </button>
          </form>

          <div className="hero-actions">
            <Link className="button button-dark" href="/studios">
              Explore studios
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <Link className="hero-host-link" href="/studios">
              Host your space
              <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          </div>

          <div className="hero-trust">
            <span>
              <ShieldCheck size={15} aria-hidden="true" />
              Host-reviewed requests
            </span>
            <span>
              <Sparkles size={15} aria-hidden="true" />
              Clear hourly pricing
            </span>
          </div>
        </div>

        <div className="hero-showcase" aria-label="Featured studios available to book">
          {loading ? (
            <div className="hero-showcase-loading" aria-hidden="true">
              <span className="skeleton-line skeleton-short" />
              <span className="skeleton-line skeleton-medium" />
            </div>
          ) : hasEnoughStudios ? (
            <Swiper
              className="hero-swiper"
              modules={[EffectFade, ...(reducedMotion ? [] : [Autoplay])]}
              effect="fade"
              fadeEffect={{ crossFade: true }}
              autoplay={
                reducedMotion
                  ? false
                  : { delay: 4600, disableOnInteraction: false, pauseOnMouseEnter: true }
              }
              loop={slides.length > 1}
              speed={900}
            >
              {slides.map((studio, index) => (
                <SwiperSlide key={studio.id}>
                  <Link className="hero-feature" href={`/studios/${studio.id}`}>
                    <Image
                      src={studio.imageUrl ?? ""}
                      alt={`${studio.title}, a ${studio.category.toLowerCase()} in ${studio.location}`}
                      fill
                      priority={index === 0}
                      sizes="(max-width: 900px) 100vw, 46vw"
                      className="hero-feature-image"
                      unoptimized={imageUnoptimized(studio.imageUrl ?? "")}
                    />
                    <span className="hero-feature-shade" aria-hidden="true" />
                    <span className="hero-feature-top">
                      <span className="hero-feature-badge">{studio.category}</span>
                      {studio.isDemo && (
                        <span className="hero-feature-badge">Demo listing</span>
                      )}
                      {studio.rating !== null && (
                        <span className="hero-feature-rating">
                          <Star size={13} fill="currentColor" aria-hidden="true" />
                          {studio.rating.toFixed(1)}
                        </span>
                      )}
                    </span>
                    <span className="hero-feature-copy">
                      <strong>{studio.title}</strong>
                      <span className="hero-feature-meta">
                        <MapPin size={13} aria-hidden="true" />
                        {studio.location}
                        <em>${studio.hourlyRate} / hour</em>
                      </span>
                    </span>
                  </Link>
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <Swiper
              className="hero-swiper"
              modules={[EffectFade, ...(reducedMotion ? [] : [Autoplay])]}
              effect="fade"
              fadeEffect={{ crossFade: true }}
              autoplay={
                reducedMotion
                  ? false
                  : { delay: 4600, disableOnInteraction: false, pauseOnMouseEnter: true }
              }
              loop
              speed={900}
            >
              {editorialSlides.map((slide, index) => (
                <SwiperSlide key={slide.category}>
                  <Link className="hero-feature" href={slide.href}>
                    <Image
                      src={slide.image}
                      alt=""
                      fill
                      priority={index === 0}
                      sizes="(max-width: 900px) 100vw, 46vw"
                      className="hero-feature-image"
                    />
                    <span className="hero-feature-shade" aria-hidden="true" />
                    <span className="hero-feature-top">
                      <span className="hero-feature-badge">{slide.category}</span>
                    </span>
                    <span className="hero-feature-copy">
                      <strong>{slide.title}</strong>
                      <span className="hero-feature-meta">{slide.description}</span>
                    </span>
                  </Link>
                </SwiperSlide>
              ))}
            </Swiper>
          )}

          <span className="hero-showcase-note">
            <Sparkles size={14} aria-hidden="true" />
            {hasEnoughStudios
              ? `${studios.length} studio${studios.length === 1 ? "" : "s"} featured this week`
              : "Explore creative spaces"}
          </span>
        </div>
      </div>

      <a className="hero-scroll" href="#featured">
        Scroll to explore
        <span aria-hidden="true">
          <ArrowRight size={13} />
        </span>
      </a>
    </section>
  );
}
