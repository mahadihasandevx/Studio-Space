import Link from "next/link";
import { ArrowLeft, KeyRound } from "lucide-react";

export default function ForgotPasswordPage() {
  return (
    <main className="forgot-page section-wrap">
      <section className="forgot-card">
        <span className="forgot-mark"><KeyRound size={25} aria-hidden="true" /></span>
        <p className="eyebrow">Account access</p>
        <h1>Password reset email isn’t available.</h1>
        <p>
          Email delivery for password resets is not configured on this StudioSpace installation.
          Contact the person who manages your account for help signing in.
        </p>
        <Link className="button button-accent" href="/login"><ArrowLeft size={16} /> Back to login</Link>
      </section>
    </main>
  );
}
