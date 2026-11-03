"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";
import { ApiError, apiRequest, jsonBody } from "@/lib/api";
import { authClient } from "@/lib/auth-client";

const idsResponseSchema = z.object({ data: z.array(z.string()) });
const toggleResponseSchema = z.object({
  data: z.object({ studioId: z.string(), saved: z.boolean() }),
});

type WishlistContextValue = {
  isSaved: (studioId: string) => boolean;
  isPending: (studioId: string) => boolean;
  toggleStudio: (studioId: string) => Promise<void>;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const [wishlist, setWishlist] = useState<{ userId: string; ids: Set<string> }>({
    userId: "",
    ids: new Set(),
  });
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (sessionPending || !session) return;
    const userId = session.user.id;
    const controller = new AbortController();
    async function loadIds() {
      try {
        const result = await apiRequest(
          "/api/v1/wishlist/ids",
          idsResponseSchema,
          { signal: controller.signal },
        );
        setWishlist({ userId, ids: new Set(result.data) });
      } catch (error) {
        if (controller.signal.aborted) return;
        toast.error(
          error instanceof ApiError
            ? error.message
            : error instanceof Error
              ? error.message
              : "Saved studios could not be loaded.",
        );
      }
    }
    void loadIds();
    return () => controller.abort();
  }, [session, sessionPending]);

  const isSaved = useCallback(
    (studioId: string) =>
      Boolean(session && wishlist.userId === session.user.id && wishlist.ids.has(studioId)),
    [session, wishlist],
  );
  const isPending = useCallback((studioId: string) => pendingIds.has(studioId), [pendingIds]);

  const toggleStudio = useCallback(async (studioId: string) => {
    if (!session) {
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname || "/studios")}`);
      return;
    }
    if (pendingIds.has(studioId)) return;

    setPendingIds((current) => new Set(current).add(studioId));
    try {
      const result = await apiRequest(
        "/api/v1/wishlist/toggle",
        toggleResponseSchema,
        { method: "POST", body: jsonBody({ studioId }) },
      );
      setWishlist((current) => {
        const ids = current.userId === session.user.id ? new Set(current.ids) : new Set<string>();
        if (result.data.saved) ids.add(studioId);
        else ids.delete(studioId);
        return { userId: session.user.id, ids };
      });
      toast.success(result.data.saved ? "Added to your saved studios." : "Removed from your saved studios.");
    } catch (error) {
      toast.error(
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Your saved studios could not be updated.",
      );
    } finally {
      setPendingIds((current) => {
        const next = new Set(current);
        next.delete(studioId);
        return next;
      });
    }
  }, [pendingIds, router, session]);

  const value = useMemo(
    () => ({ isSaved, isPending, toggleStudio }),
    [isPending, isSaved, toggleStudio],
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) throw new Error("useWishlist must be used within WishlistProvider.");
  return context;
}
