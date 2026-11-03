"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { createApiSession } from "@/lib/session";

function safeRedirect(value: string | null) {
  return value?.startsWith("/") && !value.startsWith("//") ? value : "/dashboard";
}

export function AuthCallback() {
  const router = useRouter();
  const params = useSearchParams();
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    void createApiSession()
      .then(() => {
        router.replace(safeRedirect(params.get("redirect")));
        router.refresh();
      })
      .catch((error: unknown) => {
        toast.error(error instanceof Error ? error.message : "Google sign-in could not be completed.");
        router.replace("/login");
      });
  }, [params, router]);

  return (
    <main className="section-wrap form-loading" aria-label="Completing sign-in">
      <div className="details-skeleton" />
    </main>
  );
}
