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
    return "/";
  }
  return value;
}

export function AuthRoute({ mode }: { mode: "login" | "register" }) {
  const searchParams = useSearchParams();
  const redirectTo = safeRedirectPath(searchParams.get("redirect"));
  const registered = searchParams.get("registered") === "1";

  return mode === "login" ? (
    <LoginForm redirectTo={redirectTo} registered={registered} />
  ) : (
    <RegistrationForm redirectTo={redirectTo} />
  );
}
