"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { jsPDF } from "jspdf";
import { ArrowRight, CalendarDays, Download, MapPin, X } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { ApiError, apiRequest } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import { bookingSchema, type BookingData } from "@/lib/bookings";

const bookingsResponseSchema = z.object({ data: z.array(bookingSchema) });
const cancelledBookingResponseSchema = z.object({ data: bookingSchema });

function formatBookingDate(date: string) {
  const [year, month, day] = date.split("-");
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthName = monthNames[Number(month) - 1] ?? month;
  return `${monthName} ${Number(day)}, ${year}`;
}

export function MyBookings() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);
  const [selectedBooking, setSelectedBooking] = useState<BookingData | null>(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!isPending && !session) {
      router.replace(`/login?redirect=${encodeURIComponent("/my-bookings")}`);
    }
  }, [isPending, router, session]);

  useEffect(() => {
    if (isPending || !session) return;
    const controller = new AbortController();
    async function loadBookings() {
      try {
        const result = await apiRequest(
          "/api/v1/bookings/mine",
          bookingsResponseSchema,
          { signal: controller.signal },
        );
        setBookings(result.data);
      } catch (requestError) {
        if (controller.signal.aborted) return;
        setError(
          requestError instanceof ApiError || requestError instanceof Error
            ? requestError.message
            : "Your bookings could not be loaded.",
        );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void loadBookings();
    return () => controller.abort();
  }, [isPending, retry, session]);

  async function cancelBooking() {
    if (!selectedBooking) return;
    setCancelling(true);
    try {
      const result = await apiRequest(
        `/api/v1/bookings/${encodeURIComponent(selectedBooking.id)}/cancel`,
        cancelledBookingResponseSchema,
        { method: "PATCH" },
      );
      setBookings((current) =>
        current.map((booking) => booking.id === result.data.id ? result.data : booking),
      );
      setSelectedBooking(null);
      toast.success("Your booking request was cancelled.");
    } catch (requestError) {
      toast.error(
        requestError instanceof Error
          ? requestError.message
          : "Your booking could not be cancelled.",
      );
    } finally {
      setCancelling(false);
    }
  }

  function downloadInvoice(booking: BookingData) {
    const document = new jsPDF();
    document.setFillColor(36, 35, 33);
    document.rect(0, 0, 210, 45, "F");
    document.setTextColor(255, 255, 255);
    document.setFontSize(22);
    document.text("StudioSpace", 18, 22);
    document.setFontSize(10);
    document.text("BOOKING INVOICE", 18, 33);
    document.setTextColor(35, 35, 33);
    document.setFontSize(12);
    document.text(`Invoice: ${booking.id}`, 18, 62);
    document.text(`Customer: ${booking.customerName}`, 18, 75);
    document.text(`Email: ${booking.customerEmail}`, 18, 86);
    document.text(`Studio: ${booking.studioTitle}`, 18, 104);
    document.text(`Date: ${formatBookingDate(booking.date)}`, 18, 117);
    document.text(`Time: ${booking.startTime} – ${booking.endTime}`, 18, 128);
    document.text(`Duration: ${booking.totalHours} ${booking.totalHours === 1 ? "hour" : "hours"}`, 18, 139);
    document.text(`Hourly rate: $${booking.hourlyRate.toFixed(2)}`, 18, 150);
    document.setDrawColor(225, 222, 216);
    document.line(18, 160, 192, 160);
    document.setFontSize(15);
    document.text(`Total: $${booking.totalAmount.toFixed(2)}`, 18, 174);
    document.setFontSize(9);
    document.setTextColor(120, 118, 112);
    document.text(`Status: ${booking.status}`, 18, 188);
    document.text("StudioSpace · Find a space. Make a thing.", 18, 275);
    document.save(`studiospace-invoice-${booking.id.slice(-8)}.pdf`);
  }

  if (isPending || !session || loading) {
    return <main className="section-wrap form-loading" aria-label="Loading your bookings"><div className="details-skeleton" /></main>;
  }

  return (
    <main className="account-page">
      <div className="section-wrap">
        <div className="account-heading">
          <div>
            <p className="eyebrow">Your next creative day</p>
            <h1>My bookings<span>.</span></h1>
            <p>Every request and confirmed space, all in one place.</p>
          </div>
          <Link className="button button-accent" href="/studios">Find a studio <ArrowRight size={16} /></Link>
        </div>

        {error ? (
          <div className="data-state" role="alert">
            <div><strong>We couldn’t load your bookings.</strong><p>{error}</p></div>
            <button className="button button-outline" onClick={() => {
              setLoading(true);
              setError(null);
              setRetry((value) => value + 1);
            }} type="button">Try again <ArrowRight size={15} /></button>
          </div>
        ) : bookings.length === 0 ? (
          <div className="account-empty">
            <span className="account-empty-icon"><CalendarDays size={24} /></span>
            <h2>A good work day is waiting.</h2>
            <p>You haven’t requested a booking yet. Find the right room for the thing you’re ready to make.</p>
            <Link className="button button-dark" href="/studios">Explore studios <ArrowRight size={16} /></Link>
          </div>
        ) : (
          <div className="booking-list">
            {bookings.map((booking) => (
              <article className="my-booking-card" key={booking.id}>
                <Link
                  aria-label={`View ${booking.studioTitle}`}
                  className="my-booking-image"
                  href={`/studios/${booking.studioId}`}
                  style={booking.studioImage ? { backgroundImage: `url("${booking.studioImage}")` } : undefined}
                />
                <div className="my-booking-main">
                  <div className="my-booking-title">
                    <Link href={`/studios/${booking.studioId}`}>{booking.studioTitle}</Link>
                    <span className={`status-badge status-${booking.status}`}>{booking.status}</span>
                  </div>
                  <span className="booking-date"><CalendarDays size={14} />{formatBookingDate(booking.date)}</span>
                  <span className="booking-time">{booking.startTime} – {booking.endTime} · {booking.totalHours} {booking.totalHours === 1 ? "hour" : "hours"}</span>
                  <span className="booking-location"><MapPin size={14} />Studio booking</span>
                </div>
                <div className="my-booking-total"><small>Total</small><strong>${booking.totalAmount.toFixed(2)}</strong><span>${booking.hourlyRate} / hour</span></div>
                <div className="my-booking-actions">
                  {booking.status === "confirmed" && (
                    <button className="button button-outline invoice-button" onClick={() => downloadInvoice(booking)} type="button">
                      <Download size={15} /> Invoice
                    </button>
                  )}
                  {booking.status === "pending" && (
                    <button className="button button-outline cancel-booking-button" onClick={() => setSelectedBooking(booking)} type="button">
                      <X size={15} /> Cancel request
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {selectedBooking && (
        <div className="dialog-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget && !cancelling) setSelectedBooking(null);
        }}>
          <section aria-labelledby="cancel-booking-title" aria-modal="true" className="confirm-dialog" role="alertdialog">
            <span className="confirm-icon"><X size={20} /></span>
            <h2 id="cancel-booking-title">Cancel this request?</h2>
            <p>Your pending request for <strong>{selectedBooking.studioTitle}</strong> will be cancelled.</p>
            <div className="confirm-actions">
              <button className="button button-outline" disabled={cancelling} onClick={() => setSelectedBooking(null)} type="button">Keep request</button>
              <button className="button button-danger" disabled={cancelling} onClick={() => void cancelBooking()} type="button">
                {cancelling ? "Cancelling…" : "Cancel request"}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
