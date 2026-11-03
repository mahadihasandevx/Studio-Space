"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { z } from "zod";
import { ArrowLeft, ArrowRight, Check, MapPin, ShieldCheck, Star, UsersRound } from "lucide-react";
import { Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { ApiError, apiRequest } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import { BookingModal } from "@/components/booking-modal";
import { studioSchema, type StudioData } from "@/lib/studios";

export function StudioDetails({ studioId }: { studioId: string }) {
  const [studio, setStudio] = useState<StudioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingMinDate, setBookingMinDate] = useState("");
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
    return <main className="details-loading section-wrap" aria-label="Loading studio details"><div className="details-skeleton" /><div className="details-skeleton details-skeleton-copy" /></main>;
  }

  if (error || !studio) {
    return (
      <main className="section-wrap details-state" role="alert">
        <p className="eyebrow">A little detour</p>
        <h1>{error?.includes("not found") ? "This space has moved on." : "We couldn’t open this studio."}</h1>
        <p>{error ?? "The studio is not available right now."}</p>
        <Link className="button button-dark" href="/studios"><ArrowLeft size={16} /> Back to studios</Link>
      </main>
    );
  }

  const openBooking = () => {
    setBookingMinDate(new Date().toISOString().slice(0, 10));
    setBookingOpen(true);
  };

  return (
    <main className="studio-details-page">
      <div className="section-wrap">
        <Link className="details-back" href="/studios"><ArrowLeft size={15} /> All studios</Link>
        <Swiper
          aria-label={`${studio.title} photo gallery`}
          className="studio-gallery"
          modules={[Navigation, Pagination]}
          navigation
          pagination={{ clickable: true }}
          spaceBetween={12}
          slidesPerView={1}
          breakpoints={{ 760: { slidesPerView: Math.min(studio.images.length, 2) }, 1100: { slidesPerView: Math.min(studio.images.length, 3) } }}
        >
          {studio.images.map((image, index) => (
            <SwiperSlide key={image}>
              <div className={`gallery-image gallery-image-${index + 1}`}>
                <Image
                  alt={`${studio.title} studio photo ${index + 1}`}
                  fill
                  sizes="(max-width: 760px) 100vw, 33vw"
                  src={image}
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
          {studio.images.length === 0 && <div className="gallery-no-image">StudioSpace</div>}
        <div className="details-layout">
          <div className="details-main">
            <div className="details-title-row">
              <div>
                <p className="eyebrow">{studio.category}</p>
                <h1>{studio.title}</h1>
                <p className="details-location"><MapPin size={16} aria-hidden="true" />{studio.location}</p>
              </div>
              <div className="details-rating">
                <Star size={16} fill="currentColor" aria-hidden="true" />
                <span>{studio.rating?.toFixed(1) ?? "New"}</span>
                <small>{studio.rating ? "Guest rating" : "No reviews yet"}</small>
              </div>
            </div>

            <div className="details-highlights">
              <div><UsersRound size={18} /><span><strong>Up to {studio.capacity}</strong><small>people</small></span></div>
              <div><ShieldCheck size={18} /><span><strong>${studio.securityDeposit.toFixed(2)}</strong><small>security deposit</small></span></div>
            </div>

            <section className="details-block">
              <h2>About this space</h2>
              <p>{studio.description}</p>
            </section>

            <section className="details-block reviews-section">
              <div className="reviews-heading">
                <div><h2>Creator notes</h2><p>Thoughts from people who have made something here.</p></div>
                <span><Star size={15} fill="currentColor" /> {studio.rating?.toFixed(1) ?? "New"}</span>
              </div>
              {studio.reviews.length ? (
                <div className="review-grid">
                  {studio.reviews.map((review) => (
                    <article className="review-card" key={`${review.author}-${review.createdAt}`}>
                      <div><strong>{review.author}</strong><span><Star size={13} fill="currentColor" /> {review.rating.toFixed(1)}</span></div>
                      <p>“{review.comment}”</p>
                      <small>{new Date(review.createdAt).toLocaleDateString(undefined, { month: "long", year: "numeric" })}</small>
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
                  <span key={amenity}><Check size={15} aria-hidden="true" />{amenity}</span>
                ))}
              </div>
            </section>

            <section className="host-card">
              <span className="host-avatar">{studio.host.name.trim().charAt(0).toUpperCase()}</span>
              <div><small>Your host</small><strong>{studio.host.name}</strong><span>Space shared with StudioSpace</span></div>
            </section>
          </div>

          <aside className="booking-aside">
            <div className="booking-aside-price"><strong>${studio.hourlyRate}</strong><span>/ hour</span></div>
            <p>Choose your time and send a request to the host.</p>
            {sessionPending ? (
              <div className="booking-aside-loading" aria-label="Checking your sign-in status" />
            ) : session ? (
              <button className="button button-accent booking-open-button" onClick={openBooking} type="button">
                Book workspace now <ArrowRight size={16} aria-hidden="true" />
              </button>
            ) : (
              <Link
                className="button button-accent booking-open-button"
                href={`/login?redirect=${encodeURIComponent(`/studios/${studio.id}`)}`}
              >
                Sign in to book <ArrowRight size={16} aria-hidden="true" />
              </Link>
            )}
            <div className="booking-aside-note"><ShieldCheck size={16} />Your request is confirmed by the host.</div>
            <div className="booking-aside-total"><span>Security deposit</span><strong>${studio.securityDeposit.toFixed(2)}</strong></div>
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
