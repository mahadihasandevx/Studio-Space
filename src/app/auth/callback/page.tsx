import { Suspense } from "react";
import { AuthCallback } from "@/components/auth-callback";

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<main className="section-wrap form-loading" aria-label="Completing sign-in" />}>
      <AuthCallback />
    </Suspense>
  );
}
