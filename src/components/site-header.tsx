"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Aperture, ArrowUpRight, CalendarDays, Heart, House, LayoutDashboard, LogOut, Menu, Moon, Sun, UserRound, X } from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "@/components/theme-provider";
import { authClient } from "@/lib/auth-client";
import { clearApiSession } from "@/lib/session";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Explore studios", href: "/studios" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "About Us", href: "/about" },
];

export function SiteHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { toggleTheme } = useTheme();
  const { data: session, isPending } = authClient.useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const isActive = (href: string) => href === "/" ? pathname === "/" : pathname.startsWith(href);

  async function signOut() {
    router.replace("/");
    setProfileOpen(false);
    let authSignOutError: string | null = null;
    let apiSessionError: string | null = null;
    try {
      await clearApiSession();
    } catch (error) {
      apiSessionError = error instanceof Error ? error.message : "Your API session could not be cleared.";
    }

    try {
      const result = await authClient.signOut();
      if (result.error) authSignOutError = result.error.message ?? "We couldn’t sign you out.";
    } catch (error) {
      authSignOutError = error instanceof Error ? error.message : "We couldn’t sign you out.";
    }

    if (apiSessionError) {
      toast.error(apiSessionError);
    } else if (authSignOutError) {
      toast.error(`${authSignOutError} API access has been cleared.`);
    } else {
      toast.success("You’ve been signed out.");
    }
    router.refresh();
  }

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link className="brand" href="/" aria-label="StudioSpace home" onClick={() => setMenuOpen(false)}>
          <span className="brand-mark"><Aperture size={23} strokeWidth={1.8} aria-hidden="true" /></span>
          <span>studio<span>space</span></span>
        </Link>

        <nav className={`main-nav ${menuOpen ? "is-open" : ""}`} aria-label="Main navigation">
          {navItems.map((item) => (
            <Link
              aria-current={isActive(item.href) ? "page" : undefined}
              className={isActive(item.href) ? "is-active" : ""}
              href={item.href}
              key={item.label}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
              {isActive(item.href) && <motion.span className="nav-active-indicator" layoutId="nav-active-indicator" />}
            </Link>
          ))}
          {!isPending && !session && (
            <div className="mobile-nav-actions">
              <Link href="/login" onClick={() => setMenuOpen(false)}>Login</Link>
              <Link className="button button-accent" href="/register" onClick={() => setMenuOpen(false)}>Register <ArrowUpRight size={15} aria-hidden="true" /></Link>
            </div>
          )}
        </nav>

        <div className="header-actions">
          <button className="theme-toggle" onClick={toggleTheme} type="button" aria-label="Toggle color theme">
            <Moon className="theme-icon-light" size={17} aria-hidden="true" />
            <Sun className="theme-icon-dark" size={17} aria-hidden="true" />
          </button>
          {!isPending && session ? (
            <div
              className="profile-menu"
              onMouseEnter={() => setProfileOpen(true)}
              onMouseLeave={() => setProfileOpen(false)}
            >
              <button
                className="profile-trigger"
                onClick={() => setProfileOpen(true)}
                type="button"
                aria-label="Open account menu"
                aria-expanded={profileOpen}
              >
                <span className="profile-avatar">{session.user.name.trim().charAt(0).toUpperCase() || <UserRound size={15} />}</span>
                <span className="profile-name">{session.user.name.split(" ")[0]}</span>
              </button>
              {profileOpen && (
                <div className="profile-dropdown">
                  <div className="profile-dropdown-heading">
                    <strong>{session.user.name}</strong>
                    <span>{session.user.email}</span>
                  </div>
                  <Link href="/dashboard" onClick={() => setProfileOpen(false)}><LayoutDashboard size={16} /> Dashboard</Link>
                  <Link href="/add-studio" onClick={() => setProfileOpen(false)}><Aperture size={16} /> Add New Studio</Link>
                  <Link href="/my-listings" onClick={() => setProfileOpen(false)}><House size={16} /> My Studio Listings</Link>
                  <Link href="/my-bookings" onClick={() => setProfileOpen(false)}><CalendarDays size={16} /> My Bookings</Link>
                  <Link href="/saved-studios" onClick={() => setProfileOpen(false)}><Heart size={16} /> Saved Studios</Link>
                  <button onClick={signOut} type="button"><LogOut size={16} /> Logout</button>
                </div>
              )}
            </div>
          ) : !isPending ? (
            <>
              <Link className="header-login" href="/login">Login</Link>
              <Link className="button button-accent header-cta" href="/register">
                Register <ArrowUpRight size={15} aria-hidden="true" />
              </Link>
            </>
          ) : null}
          <button
            className="mobile-menu-toggle"
            onClick={() => setMenuOpen((open) => !open)}
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </div>
    </header>
  );
}
