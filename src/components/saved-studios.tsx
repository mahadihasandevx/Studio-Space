"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Heart } from "lucide-react";
import { z } from "zod";
import { ApiError, apiRequest } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import { StudioCard } from "@/components/studio-card";
import { useWishlist } from "@/components/wishlist-provider";
import { studioSchema, type StudioData } from "@/lib/studios";

const savedResponseSchema = z.object({ data: z.array(studioSchema) });

export function SavedStudios() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const { isSaved, isLoaded: wishlistLoaded } = useWishlist();
  const [studios, setStudios] = useState<StudioData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    if (!isPending && !session) {
      router.replace(`/login?redirect=${encodeURIComponent("/saved-studios")}`);
    }
  }, [isPending, router, session]);

  useEffect(() => {
    if (isPending || !session) return;
    const controller = new AbortController();
    async function loadSavedStudios() {
      try {
        const result = await apiRequest(
          "/api/v1/wishlist",
          savedResponseSchema,
          { signal: controller.signal },
        );
        setStudios(result.data);
      } catch (requestError) {
        if (controller.signal.aborted) return;
        setError(
          requestError instanceof ApiError || requestError instanceof Error
            ? requestError.message
            : "Your saved studios could not be loaded.",
        );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void loadSavedStudios();
    return () => controller.abort();
  }, [isPending, retry, session]);

  if (isPending || !session || loading) {
    return <main className="section-wrap form-loading" aria-label="Loading saved studios"><div className="details-skeleton" /></main>;
  }

  return (
    <main className="account-page">
      <div className="section-wrap">
        <div className="account-heading">
          <div>
            <p className="eyebrow">Saved for later</p>
            <h1>Your shortlist<span>.</span></h1>
            <p>Spaces you’ve bookmarked for the right project or production day.</p>
          </div>
          <Link className="button button-accent" href="/studios">Explore studios <ArrowRight size={16} /></Link>
        </div>

        {error ? (
          <div className="data-state" role="alert">
            <div><strong>We couldn’t load your saved studios.</strong><p>{error}</p></div>
            <button className="button button-outline" onClick={() => {
              setLoading(true);
              setError(null);
              setRetry((value) => value + 1);
            }} type="button">Try again <ArrowRight size={15} /></button>
          </div>
        ) : studios.length === 0 ? (
          <div className="account-empty">
            <span className="account-empty-icon"><Heart size={23} /></span>
            <h2>Keep a few good spaces close.</h2>
            <p>Tap the heart on any studio to add it to your shortlist.</p>
            <Link className="button button-dark" href="/studios">Explore spaces <ArrowRight size={16} /></Link>
          </div>
        ) : (
          <div className="studio-grid">
            {/* Once the wishlist ids have loaded, un-saved studios drop off
                the shortlist immediately instead of lingering until reload. */}
            {(wishlistLoaded
              ? studios.filter((studio) => isSaved(studio.id))
              : studios
            ).map((studio) => <StudioCard key={studio.id} studio={studio} />)}
          </div>
        )}
      </div>
    </main>
  );
}
