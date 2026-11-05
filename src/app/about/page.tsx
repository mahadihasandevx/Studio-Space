import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Aperture,
  HeartHandshake,
  Lightbulb,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";

const values = [
  {
    icon: Aperture,
    title: "Built around making",
    text: "Our marketplace is for the messy, joyful, collaborative work that needs a room of its own.",
  },
  {
    icon: HeartHandshake,
    title: "Good hosts, clear details",
    text: "Useful listing information and direct host ownership help every booking begin with trust.",
  },
  {
    icon: UsersRound,
    title: "Independent by nature",
    text: "We celebrate local studios, rehearsal rooms, workshops, and the people who keep them open.",
  },
  {
    icon: Lightbulb,
    title: "Room for the next idea",
    text: "Whether it is a first interview or a full production, every creative project deserves a place to start.",
  },
];

const principles = [
  {
    number: "01",
    title: "Real spaces, real hosts",
    text: "Every listing belongs to a named host. No stock showrooms, no mystery operators.",
  },
  {
    number: "02",
    title: "Clear hourly pricing",
    text: "Rates, deposits, and booking totals are shown before a request leaves your screen.",
  },
  {
    number: "03",
    title: "Respect for the work",
    text: "Confirmed hours are protected, so the room you booked is the room you arrive to.",
  },
];

export default function AboutPage() {
  return (
    <main className="story-page">
      <section className="story-hero section-wrap">
        <p className="eyebrow">A little room for everyone</p>
        <h1>
          Space to make
          <br />
          <span>something matter.</span>
        </h1>
        <p>
          StudioSpace brings independent creators and thoughtful space owners
          together. We believe the right room can turn a good idea into the thing
          people remember.
        </p>
        <div className="story-hero-actions">
          <Link className="button button-accent" href="/studios">
            Explore studios <ArrowRight size={16} aria-hidden="true" />
          </Link>
          <Link className="button button-outline" href="/add-studio">
            Share your space
          </Link>
        </div>
        <div className="story-hero-facts">
          <span>
            <Sparkles size={15} aria-hidden="true" /> Five creative disciplines
          </span>
          <span>
            <ShieldCheck size={15} aria-hidden="true" /> Host-reviewed bookings
          </span>
          <span>
            <UsersRound size={15} aria-hidden="true" /> Independent studios
          </span>
        </div>
      </section>

      <section className="story-split section-wrap">
        <div className="story-split-media">
          <Image
            src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1100&q=82"
            alt="A bright creative studio prepared for a shoot"
            fill
            sizes="(max-width: 900px) 100vw, 50vw"
          />
          <span className="story-split-badge">
            <strong>StudioSpace</strong>
            <span>every listing is hosted by its owner</span>
          </span>
        </div>
        <div className="story-split-copy">
          <p className="eyebrow">Why we built this</p>
          <h2>The logistics should never outshine the work.</h2>
          <p>
            Finding a room used to mean group chats, stale PDFs, and a dozen
            messages before anyone confirmed a date. StudioSpace puts the
            details in one place: honest photos, clear amenities, hourly
            pricing, and a host who knows the space.
          </p>
          <p>
            We built it for photographers, producers, musicians, podcasters,
            and workshop hosts — the people who need a room that fits the idea,
            not the other way around.
          </p>
        </div>
      </section>

      <section className="about-values section-wrap">
        {values.map(({ icon: Icon, title, text }) => (
          <article key={title}>
            <Icon aria-hidden="true" />
            <h2>{title}</h2>
            <p>{text}</p>
          </article>
        ))}
      </section>

      <section className="principles-section">
        <div className="section-wrap">
          <div className="section-heading">
            <div>
              <p className="eyebrow">How we work</p>
              <h2>Three promises we can keep.</h2>
            </div>
            <p className="section-intro">
              Practical commitments, not marketing lines. They shape every part
              of the marketplace.
            </p>
          </div>
          <div className="principles-grid">
            {principles.map((principle) => (
              <article key={principle.number}>
                <span>{principle.number}</span>
                <h3>{principle.title}</h3>
                <p>{principle.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="story-cta">
        <p className="eyebrow">Creators and hosts, together</p>
        <h2>Find your next space or share one of your own.</h2>
        <div>
          <Link className="button button-accent" href="/studios">
            Explore spaces <ArrowRight size={16} aria-hidden="true" />
          </Link>
          <Link className="button button-ghost" href="/add-studio">
            Become a host
          </Link>
        </div>
      </section>
    </main>
  );
}
