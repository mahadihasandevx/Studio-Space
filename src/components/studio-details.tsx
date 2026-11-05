"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { z } from "zod";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  MapPin,
  ShieldCheck,
  Star,
  UsersRound,
} from "lucide-react";
import { ApiError, apiRequest } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import { imageUnoptimized } from "@/lib/image";
import { BookingModal } from "@/components/booking-modal";
import { studioSchema, type StudioData } from "@/lib/studios";

export function StudioDetails({ studioId }: { studioId: string }) {
  const [studio, setStudio] = useState<StudioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingMinDate, setBookingMinDate] = useState("");
  const [activeImage, setActiveImage] = useState(0);
  const { data: session, isPending: sessionPending } = authClient.useSession();

  useEffect(() => {
    const controller = new AbortController();
    async function fetchStudio() {
      try {
        const result = await apiRequest(
          `/api/v1/studios/${encodeURIComponent(studioId)}`,
          studioResponseSchema,
          { signal: controller.signal },
        );
        setStudio(result.data);
      } catch (requestError) {
        if (controller.signal.aborted) return;
        setError(
          requestError instanceof ApiError
            ? requestError.message
            : requestError instanceof Error
              ? requestError.message
              : "This studio could not be loaded.",
        );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void fetchStudio();
    return () => controller.abort();
  }, [studioId]);

  if (loading) {
    return (
      <main className="details-loading section-wrap" aria-label="Loading studio details">
        <div className="details-skeleton" />
        <div className="details-skeleton details-skeleton-copy" />
      </main>
    );
  }

  if (error || !studio) {
    return (
      <main className="section-wrap details-state" role="alert">
        <p className="eyebrow">A little detour</p>
        <h1>{error?.includes("not found") || error?.includes("Invalid studio ID") ? "This space has moved on." : "We couldn’t open this studio."}</h1>
        <p>{error ?? "The studio is not available right now."}</p>
        <Link className="button button-dark" href="/studios">
          <ArrowLeft size={16} /> Back to studios
        </Link>
      </main>
    );
  }

  const openBooking = () => {
    setBookingMinDate(new Date().toISOString().slice(0, 10));
    setBookingOpen(true);
  };

  const imageCount = studio.images.length;
  const showImage = (index: number) => {
    if (imageCount === 0) return;
    setActiveImage((index + imageCount) % imageCount);
  };

  return (
    <main className="studio-details-page">
      <div className="section-wrap">
        <nav className="details-breadcrumb" aria-label="Breadcrumb">
          <Link href="/studios">Studios</Link>
          <ChevronRight size={13} aria-hidden="true" />
          <span>{studio.category}</span>
          <ChevronRight size={13} aria-hidden="true" />
          <span aria-current="page">{studio.title}</span>
        </nav>

        <div className="studio-gallery">
          {imageCount > 0 ? (
            <>
              <figure className="gallery-main">
                <Image
                  key={studio.images[activeImage]}
                  alt={`${studio.title} studio photo ${activeImage + 1}`}
                  fill
                  priority
                  sizes="(max-width: 900px) 100vw, 74vw"
                  src={studio.images[activeImage] ?? studio.images[0] ?? ""}
                  unoptimized={imageUnoptimized(studio.images[activeImage] ?? studio.images[0] ?? "")}
                />
                <span className="gallery-count">
                  {activeImage + 1} / {imageCount}
                </span>
                {imageCount > 1 && (
                  <>
                    <button
                      aria-label="Previous photo"
                      className="gallery-nav gallery-nav-prev"
                      onClick={() => showImage(activeImage - 1)}
                      type="button"
                    >
                      <ChevronLeft size={18} aria-hidden="true" />
                    </button>
                    <button
                      aria-label="Next photo"
                      className="gallery-nav gallery-nav-next"
                      onClick={() => showImage(activeImage + 1)}
                      type="button"
                    >
                      <ChevronRight size={18} aria-hidden="true" />
                    </button>
                  </>
                )}
              </figure>
              {imageCount > 1 && (
                <div className="gallery-thumbs" role="tablist" aria-label="Studio photos">
                  {studio.images.map((image, index) => (
                    <button
                      aria-label={`Show photo ${index + 1}`}
                      aria-selected={index === activeImage}
                      className={`gallery-thumb${index === activeImage ? " is-active" : ""}`}
                      key={image}
                      onClick={() => setActiveImage(index)}
                      role="tab"
                      type="button"
                    >
                      <Image alt="" fill sizes="120px" src={image} unoptimized={imageUnoptimized(image)} />
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="gallery-no-image">StudioSpace</div>
          )}
        </div>

        <div className="details-layout">
          <div className="details-main">
            <div className="details-title-row">
              <div>
                <p className="eyebrow">
                  {studio.category}
                  {studio.isDemo && " · Demo listing"}
                </p>
                <h1>{studio.title}</h1>
                <p className="details-location">
                  <MapPin size={16} aria-hidden="true" />
                  {studio.location}
                </p>
              </div>
              <div className="details-rating">
                <Star size={16} fill="currentColor" aria-hidden="true" />
                <span>{studio.rating?.toFixed(1) ?? "New"}</span>
                <small>
                  {studio.isDemo
                    ? "Sample rating"
                    : studio.rating
                      ? "Guest rating"
                      : "No reviews yet"}
                </small>
              </div>
            </div>

            <div className="details-highlights">
              <div>
                <UsersRound size={18} aria-hidden="true" />
                <span>
                  <strong>Up to {studio.capacity}</strong>
                  <small>people</small>
                </span>
              </div>
              <div>
                <ShieldCheck size={18} aria-hidden="true" />
                <span>
                  <strong>${studio.securityDeposit.toFixed(0)}</strong>
                  <small>refundable deposit</small>
                </span>
              </div>
              <div>
                <Clock3 size={18} aria-hidden="true" />
                <span>
                  <strong>By the hour</strong>
                  <small>flexible sessions</small>
                </span>
              </div>
            </div>

            <section className="details-block">
              <h2>About this space</h2>
              <p>{studio.description}</p>
            </section>

            <section className="details-block reviews-section" id="reviews">
              <div className="reviews-heading">
                <div>
                  <h2>{studio.isDemo ? "Sample creator notes" : "Creator notes"}</h2>
                  <p>
                    {studio.isDemo
                      ? "Example feedback for this demo listing."
                      : "Thoughts from people who have made something here."}
                  </p>
                </div>
                <span>
                  <Star size={15} fill="currentColor" aria-hidden="true" />{" "}
                  {studio.rating?.toFixed(1) ?? "New"}
                </span>
              </div>
              {studio.reviews.length ? (
                <div className="review-grid">
                  {studio.reviews.map((review) => (
                    <article className="review-card" key={`${review.author}-${review.createdAt}`}>
                      <div>
                        <strong>{review.author}</strong>
                        <span>
                          <Star size={13} fill="currentColor" aria-hidden="true" />{" "}
                          {review.rating.toFixed(1)}
                        </span>
                      </div>
                      <p>“{review.comment}”</p>
                      <small>
                        {studio.isDemo ? "Sample review · " : ""}
                        {new Date(review.createdAt).toLocaleDateString(undefined, {
                          month: "long",
                          year: "numeric",
                        })}
                      </small>
                    </article>
                  ))}
                </div>
              ) : (
                <p>No creator reviews yet. Be the first to book this space.</p>
              )}
            </section>

            <section className="details-block">
              <h2>What you’ll find here</h2>
              <div className="amenity-list">
                {studio.amenities.map((amenity) => (
                  <span key={amenity}>
                    <Check size={15} aria-hidden="true" />
                    {amenity}
                  </span>
                ))}
              </div>
            </section>

            <section className="host-card">
              <span className="host-avatar">
                {studio.host.name.trim().charAt(0).toUpperCase()}
              </span>
              <div>
                <small>Your host</small>
                <strong>{studio.host.name}</strong>
                <span>Replies to booking requests through StudioSpace</span>
              </div>
            </section>
          </div>

          <aside className="booking-aside">
            <div className="booking-aside-price">
              <strong>${studio.hourlyRate}</strong>
              <span>/ hour</span>
            </div>
            <ul className="booking-aside-facts">
              <li>
                <Check size={14} aria-hidden="true" /> Request reviewed by the host
              </li>
              <li>
                <Check size={14} aria-hidden="true" /> Confirmed hours are protected
              </li>
              <li>
                <Check size={14} aria-hidden="true" /> Invoice available after confirmation
              </li>
            </ul>
            {sessionPending ? (
              <div className="booking-aside-loading" aria-label="Checking your sign-in status" />
            ) : session ? (
              <button
                className="button button-accent booking-open-button"
                onClick={openBooking}
                type="button"
              >
                Book this space <ArrowRight size={16} aria-hidden="true" />
              </button>
            ) : (
              <Link
                className="button button-accent booking-open-button"
                href={`/login?redirect=${encodeURIComponent(`/studios/${studio.id}`)}`}
              >
                Sign in to book <ArrowRight size={16} aria-hidden="true" />
              </Link>
            )}
            <div className="booking-aside-note">
              <ShieldCheck size={16} aria-hidden="true" />
              You won’t be charged until the host confirms your hours.
            </div>
            <div className="booking-aside-total">
              <span>Security deposit</span>
              <strong>${studio.securityDeposit.toFixed(2)}</strong>
            </div>
            <Link className="booking-aside-host" href={`/studios?location=${encodeURIComponent(studio.location)}`}>
              More spaces in {studio.location}
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </aside>
        </div>
      </div>
      {bookingOpen && (
        <BookingModal
          minDate={bookingMinDate}
          onClose={() => setBookingOpen(false)}
          studio={studio}
        />
      )}
    </main>
  );
}

const studioResponseSchema = z.object({
  data: studioSchema,
});
