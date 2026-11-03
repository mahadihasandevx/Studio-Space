"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Aperture, ArrowRight, Eye, EyeOff, KeyRound, UserRound } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { authClient } from "@/lib/auth-client";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});

const registrationSchema = z.object({
  name: z.string().trim().min(2, "Your name must be at least 2 characters."),
  email: z.string().email("Enter a valid email address."),
  image: z.union([z.literal(""), z.string().url("Enter a valid photo URL.")]),
  password: z
    .string()
    .min(6, "Use at least 6 characters.")
    .regex(/[A-Z]/, "Include at least one uppercase letter.")
    .regex(/[a-z]/, "Include at least one lowercase letter."),
});

type LoginValues = z.infer<typeof loginSchema>;
type RegistrationValues = z.infer<typeof registrationSchema>;

function GoogleSignInButton({ redirectTo }: { redirectTo: string }) {
  const [isLoading, setIsLoading] = useState(false);

  async function signInWithGoogle() {
    setIsLoading(true);
    try {
      const result = await authClient.signIn.social({
        provider: "google",
        callbackURL: `${window.location.origin}${redirectTo}`,
      });
      if (result.error) {
        toast.error(result.error.message ?? "Google sign-in is unavailable.");
        setIsLoading(false);
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Google sign-in could not be started.",
      );
      setIsLoading(false);
    }
  }

  return (
    <button className="google-button" disabled={isLoading} onClick={signInWithGoogle} type="button">
      <span className="google-g" aria-hidden="true">G</span>
      {isLoading ? "Connecting…" : "Continue with Google"}
    </button>
  );
}

export function LoginForm({ redirectTo }: { redirectTo: string }) {
  const router = useRouter();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginValues) {
    try {
      const result = await authClient.signIn.email({
        email: values.email,
        password: values.password,
        callbackURL: `${window.location.origin}${redirectTo}`,
      });
      if (result.error) {
        toast.error(result.error.message ?? "We couldn’t sign you in.");
        return;
      }

      toast.success("You’re signed in. Welcome back.");
      router.replace(redirectTo);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "We couldn’t sign you in.");
    }
  }

  return (
    <AuthPanel
      eyebrow="Welcome back"
      title={<>Good to see<br />you again.</>}
      description="Sign in to pick up where your next good idea left off."
      footer={<>New to StudioSpace? <Link href="/register">Create an account <ArrowRight size={14} /></Link></>}
    >
      <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <label className="field-label" htmlFor="login-email">Email address</label>
        <input
          autoComplete="email"
          className={`auth-input ${errors.email ? "has-error" : ""}`}
          id="login-email"
          placeholder="you@example.com"
          type="email"
          {...register("email")}
        />
        {errors.email && <span className="field-error">{errors.email.message}</span>}

        <div className="field-label-row">
          <label className="field-label" htmlFor="login-password">Password</label>
        </div>
        <div className={`password-field ${errors.password ? "has-error" : ""}`}>
          <KeyRound size={16} aria-hidden="true" />
          <input
            autoComplete="current-password"
            id="login-password"
            placeholder="Your password"
            type={passwordVisible ? "text" : "password"}
            {...register("password")}
          />
          <button
            aria-label={passwordVisible ? "Hide password" : "Show password"}
            onClick={() => setPasswordVisible((visible) => !visible)}
            type="button"
          >
            {passwordVisible ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.password && <span className="field-error">{errors.password.message}</span>}

        <button className="button button-accent auth-submit" disabled={isSubmitting} type="submit">
          {isSubmitting ? "Signing in…" : "Sign in"} <ArrowRight size={16} aria-hidden="true" />
        </button>
      </form>
      <div className="auth-divider"><span>or</span></div>
      <GoogleSignInButton redirectTo={redirectTo} />
    </AuthPanel>
  );
}

export function RegistrationForm({ redirectTo }: { redirectTo: string }) {
  const router = useRouter();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegistrationValues>({ resolver: zodResolver(registrationSchema) });

  async function onSubmit(values: RegistrationValues) {
    try {
      const result = await authClient.signUp.email({
        name: values.name,
        email: values.email,
        password: values.password,
        image: values.image || undefined,
      });
      if (result.error) {
        toast.error(result.error.message ?? "We couldn’t create your account.");
        return;
      }

      toast.success("Your StudioSpace account is ready.");
      router.replace(redirectTo);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "We couldn’t create your account.");
    }
  }

  return (
    <AuthPanel
      eyebrow="A little room for you"
      title={<>Make space<br />for what’s next.</>}
      description="Create an account and find a good place to get started."
      footer={<>Already have an account? <Link href="/login">Sign in <ArrowRight size={14} /></Link></>}
    >
      <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <label className="field-label" htmlFor="register-name">Full name</label>
        <div className={`password-field ${errors.name ? "has-error" : ""}`}>
          <UserRound size={16} aria-hidden="true" />
          <input autoComplete="name" id="register-name" placeholder="Your name" {...register("name")} />
        </div>
        {errors.name && <span className="field-error">{errors.name.message}</span>}

        <label className="field-label" htmlFor="register-email">Email address</label>
        <input
          autoComplete="email"
          className={`auth-input ${errors.email ? "has-error" : ""}`}
          id="register-email"
          placeholder="you@example.com"
          type="email"
          {...register("email")}
        />
        {errors.email && <span className="field-error">{errors.email.message}</span>}

        <label className="field-label" htmlFor="register-image">Photo URL <span className="field-optional">optional</span></label>
        <input
          className={`auth-input ${errors.image ? "has-error" : ""}`}
          id="register-image"
          placeholder="https://example.com/your-photo.jpg"
          type="url"
          {...register("image")}
        />
        {errors.image && <span className="field-error">{errors.image.message}</span>}

        <label className="field-label" htmlFor="register-password">Password</label>
        <div className={`password-field ${errors.password ? "has-error" : ""}`}>
          <KeyRound size={16} aria-hidden="true" />
          <input
            autoComplete="new-password"
            id="register-password"
            placeholder="At least 6 characters"
            type={passwordVisible ? "text" : "password"}
            {...register("password")}
          />
          <button
            aria-label={passwordVisible ? "Hide password" : "Show password"}
            onClick={() => setPasswordVisible((visible) => !visible)}
            type="button"
          >
            {passwordVisible ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.password && <span className="field-error">{errors.password.message}</span>}
        <p className="password-hint">Use at least 6 characters, with an uppercase and a lowercase letter.</p>

        <button className="button button-accent auth-submit" disabled={isSubmitting} type="submit">
          {isSubmitting ? "Creating account…" : "Create account"} <ArrowRight size={16} aria-hidden="true" />
        </button>
      </form>
      <div className="auth-divider"><span>or</span></div>
      <GoogleSignInButton redirectTo={redirectTo} />
      <p className="auth-terms">By continuing, you agree to our <Link href="/terms">Terms</Link> and <Link href="/privacy">Privacy Policy</Link>.</p>
    </AuthPanel>
  );
}

function AuthPanel({
  children,
  description,
  eyebrow,
  footer,
  title,
}: {
  children: React.ReactNode;
  description: string;
  eyebrow: string;
  footer: React.ReactNode;
  title: React.ReactNode;
}) {
  return (
    <main className="auth-page">
      <section className="auth-visual">
        <div className="auth-visual-image" />
        <div className="auth-visual-shade" />
        <Link className="auth-brand" href="/">
          <Aperture size={23} strokeWidth={1.8} aria-hidden="true" />
          <span>studio<span>space</span></span>
        </Link>
        <div className="auth-visual-copy">
          <p>SPACE TO MAKE</p>
          <h2>“The right room<br />changes everything.”</h2>
          <span>A place for the work you can’t wait to make.</span>
        </div>
        <span className="auth-image-credit">A little more room for creativity.</span>
      </section>
      <section className="auth-content">
        <div className="auth-content-inner">
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p className="auth-description">{description}</p>
          {children}
          <div className="auth-footer">{footer}</div>
        </div>
      </section>
    </main>
  );
}
