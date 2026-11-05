"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, CalendarPlus, Edit3, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ApiError, apiRequest } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import { studioSchema, type StudioData } from "@/lib/studios";
import { useEscapeToClose } from "@/lib/use-escape-close";
import { z } from "zod";

const listingsResponseSchema = z.object({ data: z.array(studioSchema) });
const emptyResponseSchema = z.null();

export function MyListings() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [studios, setStudios] = useState<StudioData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);
  const [selectedStudio, setSelectedStudio] = useState<StudioData | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!isPending && !session) {
      router.replace(`/login?redirect=${encodeURIComponent("/my-listings")}`);
    }
  }, [isPending, router, session]);

  useEffect(() => {
    if (isPending || !session) return;
    const controller = new AbortController();
    async function loadListings() {
      try {
        const result = await apiRequest(
          "/api/v1/studios/mine",
          listingsResponseSchema,
          { signal: controller.signal },
        );
        setStudios(result.data);
      } catch (requestError) {
        if (controller.signal.aborted) return;
        setError(
          requestError instanceof ApiError || requestError instanceof Error
            ? requestError.message
            : "Your listings could not be loaded.",
        );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void loadListings();
    return () => controller.abort();
  }, [isPending, retry, session]);

  async function deleteStudio() {
    if (!selectedStudio) return;
    setDeleting(true);
    try {
      await apiRequest(
        `/api/v1/studios/${encodeURIComponent(selectedStudio.id)}`,
        emptyResponseSchema,
        { method: "DELETE" },
      );
      setStudios((current) => current.filter((studio) => studio.id !== selectedStudio.id));
      toast.success("Studio listing deleted.");
      setSelectedStudio(null);
    } catch (requestError) {
      toast.error(
        requestError instanceof Error
          ? requestError.message
          : "The studio could not be deleted.",
      );
    } finally {
      setDeleting(false);
    }
  }

  if (isPending || !session || loading) {
    return <main className="section-wrap form-loading" aria-label="Loading your studios"><div className="details-skeleton" /></main>;
  }

  return (
    <main className="account-page">
      <div className="section-wrap">
        <div className="account-heading">
          <div>
            <p className="eyebrow">Your creative corner</p>
            <h1>My listings<span>.</span></h1>
            <p>Keep your spaces up to date and ready for the next great project.</p>
          </div>
          <Link className="button button-accent" href="/add-studio"><Plus size={17} /> Add a studio</Link>
        </div>

        {error ? (
          <div className="data-state" role="alert">
            <div><strong>We couldn’t load your listings.</strong><p>{error}</p></div>
            <button className="button button-outline" onClick={() => {
              setLoading(true);
              setError(null);
              setRetry((value) => value + 1);
            }} type="button">Try again <ArrowRight size={15} /></button>
          </div>
        ) : studios.length === 0 ? (
          <div className="account-empty">
            <span className="account-empty-icon"><CalendarPlus size={24} /></span>
            <h2>Your studio story starts here.</h2>
            <p>Share a creative space and help someone find the perfect place to make their next idea real.</p>
            <Link className="button button-dark" href="/add-studio">Create your first listing <ArrowRight size={16} /></Link>
          </div>
        ) : (
          <div className="listing-list">
            {studios.map((studio) => (
              <article className="listing-row" key={studio.id}>
                <Link
                  aria-label={`View ${studio.title}`}
                  className="listing-thumb"
                  href={`/studios/${studio.id}`}
                  style={studio.imageUrl ? { backgroundImage: `url("${studio.imageUrl}")` } : undefined}
                />
                <div className="listing-row-main">
                  <span className="listing-category">
                    {studio.category}{studio.isDemo ? " · Demo listing" : ""}
                  </span>
                  <Link className="listing-title" href={`/studios/${studio.id}`}>{studio.title}</Link>
                  <span className="listing-location">{studio.location}</span>
                </div>
                <div className="listing-row-price"><strong>${studio.hourlyRate}</strong><span>per hour</span></div>
                <div className="listing-row-actions">
                  <Link className="icon-action" href={`/studios/edit/${studio.id}`} aria-label={`Edit ${studio.title}`}><Edit3 size={16} /></Link>
                  <button className="icon-action danger-action" onClick={() => setSelectedStudio(studio)} type="button" aria-label={`Delete ${studio.title}`}><Trash2 size={16} /></button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {selectedStudio && (
        <DeleteStudioDialog
          studio={selectedStudio}
          deleting={deleting}
          onClose={() => setSelectedStudio(null)}
          onConfirm={() => void deleteStudio()}
        />
      )}
    </main>
  );
}

function DeleteStudioDialog({
  studio,
  deleting,
  onClose,
  onConfirm,
}: {
  studio: StudioData;
  deleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const dialogRef = useRef<HTMLElement | null>(null);
  useEscapeToClose(onClose, dialogRef);
  return (
    <div className="dialog-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget && !deleting) onClose();
    }}>
      <section aria-labelledby="delete-studio-title" aria-modal="true" className="confirm-dialog" ref={dialogRef} role="alertdialog" tabIndex={-1}>
        <span className="confirm-icon"><Trash2 size={20} /></span>
        <h2 id="delete-studio-title">Remove this studio?</h2>
        <p><strong>{studio.title}</strong> will no longer appear in studio search. This can’t be undone.</p>
        <div className="confirm-actions">
          <button className="button button-outline" disabled={deleting} onClick={onClose} type="button">Keep listing</button>
          <button className="button button-danger" disabled={deleting} onClick={onConfirm} type="button">
            {deleting ? "Removing…" : "Delete studio"}
          </button>
        </div>
      </section>
    </div>
  );
}
