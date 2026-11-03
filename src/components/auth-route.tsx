"use client";

import { useSearchParams } from "next/navigation";
import { LoginForm, RegistrationForm } from "@/components/auth-forms";

function safeRedirectPath(value: string | null) {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\") ||
    /[\r\n]/.test(value)
  ) {
    return "/dashboard";
  }
  return value;
}

export function AuthRoute({ mode }: { mode: "login" | "register" }) {
  const searchParams = useSearchParams();
  const redirectTo = safeRedirectPath(searchParams.get("redirect"));

  return mode === "login" ? (
    <LoginForm redirectTo={redirectTo} />
  ) : (
    <RegistrationForm redirectTo={redirectTo} />
  );
}
