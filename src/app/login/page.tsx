import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthRoute } from "@/components/auth-route";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="auth-page auth-page-loading" aria-label="Loading sign-in form" />}>
      <AuthRoute mode="login" />
    </Suspense>
  );
}
