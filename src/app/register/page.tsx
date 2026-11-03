import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthRoute } from "@/components/auth-route";

export const metadata: Metadata = {
  title: "Create an account",
};

export default function RegisterPage() {
  return (
    <Suspense fallback={<main className="auth-page auth-page-loading" aria-label="Loading registration form" />}>
      <AuthRoute mode="register" />
    </Suspense>
  );
}
