"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, RotateCw } from "lucide-react";
import { ApiError, apiRequest } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import { StudioForm } from "@/components/studio-form";
import { studioSchema, type StudioData } from "@/lib/studios";
import { z } from "zod";

const responseSchema = z.object({ data: studioSchema });

export function StudioEditRoute({ studioId }: { studioId: string }) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [studio, setStudio] = useState<StudioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    if (!isPending && !session) {
      router.replace(`/login?redirect=${encodeURIComponent(`/studios/edit/${studioId}`)}`);
    }
  }, [isPending, router, session, studioId]);

  useEffect(() => {
    if (isPending || !session) return;
    const userId = session.user.id;
    const controller = new AbortController();
    async function loadStudio() {
      try {
        const result = await apiRequest(
          `/api/v1/studios/${encodeURIComponent(studioId)}`,
          responseSchema,
          { signal: controller.signal },
        );
        if (result.data.host.id !== userId) {
          setError("You can only edit a studio that belongs to your account.");
        } else {
          setStudio(result.data);
        }
      } catch (loadError) {
        if (controller.signal.aborted) return;
        setError(
          loadError instanceof ApiError || loadError instanceof Error
            ? loadError.message
            : "This studio could not be loaded.",
        );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void loadStudio();
    return () => controller.abort();
  }, [isPending, retry, session, studioId]);

  if (isPending || !session || loading) {
    return <main className="section-wrap form-loading" aria-label="Loading studio editor"><div className="details-skeleton" /></main>;
  }
  if (studio) return <StudioForm initialStudio={studio} studioId={studioId} />;

  return (
    <main className="section-wrap details-state" role="alert">
      <p className="eyebrow">Studio listing</p>
      <h1>We couldn’t open this listing.</h1>
      <p>{error ?? "The studio is not available."}</p>
      {error?.includes("only edit") ? (
        <Link className="button button-dark" href="/my-listings"><ArrowLeft size={16} /> My listings</Link>
      ) : (
        <button className="button button-dark" onClick={() => {
          setLoading(true);
          setError(null);
          setRetry((value) => value + 1);
        }} type="button">
          <RotateCw size={15} /> Try again
        </button>
      )}
    </main>
  );
}
