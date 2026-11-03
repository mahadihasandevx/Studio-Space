"use client";

import { useState } from "react";
import Link from "next/link";
import { Aperture, ArrowUpRight } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { ApiError, apiRequest, jsonBody } from "@/lib/api";

const newsletterResponseSchema = z.object({
  data: z.object({ subscribed: z.literal(true) }),
});

export function SiteFooter() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function subscribe(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    try {
      await apiRequest("/api/v1/newsletter", newsletterResponseSchema, {
        method: "POST",
        body: jsonBody({ email }),
      });
      setEmail("");
      toast.success("You’re on the StudioSpace notes list.");
    } catch (error) {
      toast.error(error instanceof ApiError || error instanceof Error ? error.message : "We couldn’t save your email.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div className="footer-brand-column">
          <div className="footer-wordmark" aria-label="StudioSpace">Studio<span>Space</span><i>.</i></div>
          <Link className="brand brand-footer" href="/">
            <span className="brand-mark"><Aperture size={23} strokeWidth={1.8} aria-hidden="true" /></span>
            <span>studio<span>space</span></span>
          </Link>
          <p>A little more room for the ideas that move us forward.</p>
          <div className="footer-socials" aria-label="StudioSpace social links">
            <a className="social-link social-x" href="https://x.com" target="_blank" rel="noreferrer" aria-label="StudioSpace on X">𝕏</a>
            <a className="social-link social-text" href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">ig</a>
            <a className="social-link social-text" href="https://youtube.com" target="_blank" rel="noreferrer" aria-label="YouTube">yt</a>
            <a className="social-link social-text" href="https://github.com" target="_blank" rel="noreferrer" aria-label="GitHub">gh</a>
          </div>
        </div>
        <div className="footer-links">
          <div><h3>Discover</h3><Link href="/studios">Explore studios</Link><Link href="/studios?category=Photo%20Studios">Photo studios</Link><Link href="/studios?category=Film%20Stages">Film stages</Link><Link href="/studios?category=Podcast%20Rooms">Podcast rooms</Link><Link href="/studios?category=Music%20Suites">Music suites</Link><Link href="/studios?category=Art%20Workshops">Art workshops</Link></div>
          <div><h3>StudioSpace</h3><Link href="/how-it-works">How it works</Link><Link href="/about">Our story</Link><Link href="/add-studio">Become a host <ArrowUpRight size={13} aria-hidden="true" /></Link><Link href="/dashboard">Your dashboard</Link></div>
          <div className="footer-newsletter"><h3>Good things, occasionally</h3><p>New spaces, creator stories, and notes for your next project.</p><form onSubmit={subscribe}><label className="sr-only" htmlFor="newsletter-email">Your email address</label><input id="newsletter-email" autoComplete="email" onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required type="email" value={email} /><button disabled={submitting} type="submit">{submitting ? "Joining…" : "Join"}</button></form></div>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 StudioSpace. Made for makers.</span>
        <span>By booking a space, you agree to follow its host rules and safety requirements.</span>
      </div>
    </footer>
  );
}
