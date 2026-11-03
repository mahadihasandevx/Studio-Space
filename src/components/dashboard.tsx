"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, CalendarDays, Check, Clock3, Plus, Store, UsersRound } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { ApiError, apiRequest } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import { bookingSchema, type BookingData } from "@/lib/bookings";
import { StudioCard } from "@/components/studio-card";
import { studioSchema, type StudioData } from "@/lib/studios";

const dashboardSchema = z.object({
  data: z.object({
    stats: z.object({
      totalListings: z.number(),
      totalBookings: z.number(),
      pendingBookings: z.number(),
      hostPendingBookings: z.number(),
    }),
    recentBookings: z.array(bookingSchema),
    recentHostBookings: z.array(bookingSchema),
    recentListings: z.array(studioSchema),
  }),
});

const confirmResponseSchema = z.object({ data: bookingSchema });

type DashboardData = z.infer<typeof dashboardSchema>["data"];

function formatShortDate(value: string) {
  const [year, month, day] = value.split("-");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[Number(month) - 1] ?? month} ${Number(day)}, ${year}`;
}

export function Dashboard() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isPending && !session) {
      router.replace(`/login?redirect=${encodeURIComponent("/dashboard")}`);
    }
  }, [isPending, router, session]);

  useEffect(() => {
    if (isPending || !session) return;
    const controller = new AbortController();
    async function loadDashboard() {
      try {
        const result = await apiRequest(
          "/api/v1/dashboard/summary",
          dashboardSchema,
          { signal: controller.signal },
        );
        setDashboard(result.data);
      } catch (requestError) {
        if (controller.signal.aborted) return;
        setError(
          requestError instanceof ApiError || requestError instanceof Error
            ? requestError.message
            : "Your dashboard could not be loaded.",
        );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void loadDashboard();
    return () => controller.abort();
  }, [isPending, retry, session]);

  async function confirmBooking(booking: BookingData) {
    setConfirmingId(booking.id);
    try {
      const result = await apiRequest(
        `/api/v1/bookings/${encodeURIComponent(booking.id)}/confirm`,
        confirmResponseSchema,
        { method: "PATCH" },
      );
      setDashboard((current) => current && ({
        ...current,
        stats: {
          ...current.stats,
          hostPendingBookings: Math.max(0, current.stats.hostPendingBookings - 1),
        },
        recentHostBookings: current.recentHostBookings.map((item) =>
          item.id === result.data.id ? result.data : item,
        ),
      }));
      toast.success("Booking confirmed. The time is now reserved.");
    } catch (requestError) {
      toast.error(
        requestError instanceof Error
          ? requestError.message
          : "This booking could not be confirmed.",
      );
    } finally {
      setConfirmingId(null);
    }
  }

  if (isPending || !session || loading) {
    return <main className="section-wrap form-loading" aria-label="Loading dashboard"><div className="details-skeleton" /></main>;
  }

  if (error || !dashboard) {
    return (
      <main className="section-wrap details-state" role="alert">
        <p className="eyebrow">Your dashboard</p>
        <h1>We couldn’t open your dashboard.</h1>
        <p>{error ?? "Dashboard data is not available right now."}</p>
        <button className="button button-dark" onClick={() => {
          setLoading(true);
          setError(null);
          setRetry((value) => value + 1);
        }} type="button">Try again <ArrowRight size={16} /></button>
      </main>
    );
  }

  const stats = [
    { label: "Studio listings", value: dashboard.stats.totalListings, icon: Store, href: "/my-listings" },
    { label: "Your bookings", value: dashboard.stats.totalBookings, icon: CalendarDays, href: "/my-bookings" },
    { label: "Requests to you", value: dashboard.stats.hostPendingBookings, icon: Clock3, href: "#host-requests" },
    { label: "Your pending", value: dashboard.stats.pendingBookings, icon: UsersRound, href: "/my-bookings" },
  ];
  const activity = [
    { label: "Studio listings", value: dashboard.stats.totalListings },
    { label: "All bookings", value: dashboard.stats.totalBookings },
    { label: "New requests", value: dashboard.stats.hostPendingBookings },
  ];
  const activityMax = Math.max(1, ...activity.map((item) => item.value));

  return (
    <main className="dashboard-page">
      <div className="section-wrap">
        <section className="dashboard-welcome">
          <div>
            <p className="eyebrow">Your StudioSpace</p>
            <h1>Welcome back, <em>{session.user.name.split(" ")[0]}.</em></h1>
            <p>Your spaces, plans, and the next good thing you’re making.</p>
          </div>
          <Link className="button button-accent" href="/add-studio"><Plus size={16} /> Add a studio</Link>
        </section>

        <section className="dashboard-stats" aria-label="Account overview">
          {stats.map(({ label, value, icon: Icon, href }) => (
            <Link className="dashboard-stat" href={href} key={label}>
              <span className="dashboard-stat-icon"><Icon size={18} /></span>
              <span className="dashboard-stat-value">{value}</span>
              <span className="dashboard-stat-label">{label}</span>
              <ArrowRight className="dashboard-stat-arrow" size={15} />
            </Link>
          ))}
        </section>

        <section className="dashboard-activity" aria-label="Account activity chart">
          <div className="dashboard-panel-heading">
            <div><p className="eyebrow">At a glance</p><h2>Your activity</h2></div>
            <span>Current totals</span>
          </div>
          <div className="activity-bars">
            {activity.map((item, index) => (
              <div className="activity-bar-row" key={item.label}>
                <span>{item.label}</span>
                <div className="activity-bar-track">
                  <i className={`activity-bar-fill activity-bar-${index + 1}`} style={{ width: `${Math.max(4, item.value / activityMax * 100)}%` }} />
                </div>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="dashboard-two-column">
          <div className="dashboard-panel">
            <div className="dashboard-panel-heading">
              <div><p className="eyebrow">Creator side</p><h2>Recent bookings</h2></div>
              <Link href="/my-bookings">View all <ArrowRight size={14} /></Link>
            </div>
            {dashboard.recentBookings.length ? (
              <div className="dashboard-compact-list">
                {dashboard.recentBookings.slice(0, 4).map((booking) => (
                  <article className="compact-booking" key={booking.id}>
                    <span className="compact-booking-date">{formatShortDate(booking.date)}</span>
                    <div><Link href={`/studios/${booking.studioId}`}>{booking.studioTitle}</Link><small>{booking.startTime} – {booking.endTime}</small></div>
                    <span className={`status-badge status-${booking.status}`}>{booking.status}</span>
                  </article>
                ))}
              </div>
            ) : (
              <div className="dashboard-panel-empty"><p>No bookings yet. Find a space that feels right for your next project.</p><Link href="/studios">Explore studios <ArrowRight size={14} /></Link></div>
            )}
          </div>

          <div className="dashboard-panel" id="host-requests">
            <div className="dashboard-panel-heading">
              <div><p className="eyebrow">Host side</p><h2>Requests for your spaces</h2></div>
              <span className="dashboard-count">{dashboard.stats.hostPendingBookings} pending</span>
            </div>
            {dashboard.recentHostBookings.length ? (
              <div className="dashboard-compact-list">
                {dashboard.recentHostBookings.slice(0, 4).map((booking) => (
                  <article className="compact-booking host-compact-booking" key={booking.id}>
                    <span className="compact-booking-date">{formatShortDate(booking.date)}</span>
                    <div><strong>{booking.studioTitle}</strong><small>{booking.customerName} · {booking.startTime}–{booking.endTime}</small></div>
                    {booking.status === "pending" ? (
                      <button
                        aria-label={`Confirm booking for ${booking.studioTitle}`}
                        className="confirm-booking-button"
                        disabled={confirmingId === booking.id}
                        onClick={() => void confirmBooking(booking)}
                        type="button"
                      >
                        <Check size={14} />{confirmingId === booking.id ? "…" : "Confirm"}
                      </button>
                    ) : (
                      <span className={`status-badge status-${booking.status}`}>{booking.status}</span>
                    )}
                  </article>
                ))}
              </div>
            ) : (
              <div className="dashboard-panel-empty"><p>When creators request a time at your studio, you’ll see it here.</p><Link href="/add-studio">Share a studio <ArrowRight size={14} /></Link></div>
            )}
          </div>
        </section>

        <section className="dashboard-listings">
          <div className="dashboard-panel-heading">
            <div><p className="eyebrow">Your creative corner</p><h2>Recent studio listings</h2></div>
            <Link href="/my-listings">Manage listings <ArrowRight size={14} /></Link>
          </div>
          {dashboard.recentListings.length ? (
            <div className="studio-grid">
              {dashboard.recentListings.map((studio: StudioData) => <StudioCard key={studio.id} studio={studio} />)}
            </div>
          ) : (
            <div className="dashboard-panel-empty dashboard-listing-empty"><p>You don’t have a studio listing yet.</p><Link href="/add-studio">Create your first listing <ArrowRight size={14} /></Link></div>
          )}
        </section>
      </div>
    </main>
  );
}
