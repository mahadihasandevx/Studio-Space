import Link from "next/link";
import { Aperture, ArrowUpRight } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div className="footer-brand-column">
          <Link className="brand brand-footer" href="/">
            <span className="brand-mark"><Aperture size={23} strokeWidth={1.8} aria-hidden="true" /></span>
            <span>studio<span>space</span></span>
          </Link>
          <p>A little more room for the ideas that move us forward.</p>
          <a className="social-link" href="https://x.com" target="_blank" rel="noreferrer" aria-label="StudioSpace on X">𝕏</a>
        </div>
        <div className="footer-links">
          <div><h3>Discover</h3><Link href="/studios">Explore studios</Link><Link href="/studios?category=Photo%20Studios">Photo studios</Link><Link href="/studios?category=Film%20Stages">Film stages</Link><Link href="/studios?category=Podcast%20Rooms">Podcast rooms</Link></div>
          <div><h3>StudioSpace</h3><Link href="/#how-it-works">How it works</Link><Link href="/#about">Our story</Link><Link href="/add-studio">Become a host <ArrowUpRight size={13} aria-hidden="true" /></Link><Link href="/dashboard">Your dashboard</Link></div>
          <div><h3>Need a hand?</h3><a href="mailto:hello@studiospace.example">Get in touch</a><Link href="/terms">Terms of service</Link><Link href="/privacy">Privacy policy</Link></div>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© StudioSpace. Made for makers.</span>
        <span>Find a space. Make a thing.</span>
      </div>
    </footer>
  );
}
