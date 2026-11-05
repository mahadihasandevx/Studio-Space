import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  Compass,
  HelpCircle,
  WandSparkles,
} from "lucide-react";

const steps = [
  {
    icon: Compass,
    number: "01",
    title: "Discover spaces",
    text: "Search by creative discipline, neighborhood, and hourly budget. Compare details and see what each room is set up to do.",
  },
  {
    icon: CalendarDays,
    number: "02",
    title: "Select your shoot hours",
    text: "Choose a future date and a time window that works for your crew. The total is calculated before you send a request.",
  },
  {
    icon: CheckCircle2,
    number: "03",
    title: "Book with the host",
    text: "Your booking starts as a request. The host can review the details and confirm it; confirmed hours cannot overlap.",
  },
  {
    icon: WandSparkles,
    number: "04",
    title: "Create and produce",
    text: "Use the host’s notes to arrive prepared, get straight to your work, and download an invoice for a confirmed booking.",
  },
];

const creatorPoints = [
  "Compare real photos, amenities, and hourly rates",
  "Pick a date and time window before you commit",
  "Track pending and confirmed bookings in one place",
  "Download a PDF invoice once the host confirms",
];

const hostPoints = [
  "Publish a listing with your own photos and house notes",
  "Review every request before it becomes a confirmed booking",
  "Confirmed hours are protected by a unique booking index",
  "Manage listings and bookings from a single dashboard",
];

const faqs = [
  {
    question: "When am I charged for a booking?",
    answer:
      "A booking starts as a request. The host reviews the date and hours, then confirms it. StudioSpace shows the full hourly total before you send the request, and the security deposit is listed separately.",
  },
  {
    question: "What happens if two people want the same hours?",
    answer:
      "Confirmed bookings cannot overlap. The API enforces this with a unique booking index, so a second overlapping confirmation is rejected with a clear conflict response.",
  },
  {
    question: "Can I cancel a booking?",
    answer:
      "You can cancel a booking from My bookings while it is still pending host confirmation. Cancelled bookings release the time slot for other guests.",
  },
  {
    question: "How do I become a host?",
    answer:
      "Create an account, choose Add studio, and add photos, amenities, capacity, pricing, and a description. Your listing appears in the marketplace as soon as it is saved.",
  },
];

export default function HowItWorksPage() {
  return (
    <main className="story-page">
      <section className="story-hero section-wrap">
        <p className="eyebrow">A better production day</p>
        <h1>
          Less logistics.
          <br />
          <span>More making.</span>
        </h1>
        <p>
          From finding a room to wrapping the final take, StudioSpace keeps the
          details clear so your creative energy stays on the project.
        </p>
        <div className="story-hero-actions">
          <Link className="button button-accent" href="/studios">
            Find a space <ArrowRight size={16} aria-hidden="true" />
          </Link>
          <Link className="button button-outline" href="/add-studio">
            List your studio
          </Link>
        </div>
      </section>

      <section className="section-wrap process-grid" aria-label="How booking works">
        {steps.map(({ icon: Icon, number, title, text }) => (
          <article className="process-card" key={number}>
            <span className="process-number">{number}</span>
            <Icon size={24} aria-hidden="true" />
            <h2>{title}</h2>
            <p>{text}</p>
          </article>
        ))}
      </section>

      <section className="story-split story-split-reverse section-wrap">
        <div className="story-split-media">
          <Image
            src="https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=1100&q=82"
            alt="A recording studio control room ready for a session"
            fill
            sizes="(max-width: 900px) 100vw, 50vw"
          />
        </div>
        <div className="story-split-copy">
          <p className="eyebrow">For creators</p>
          <h2>Book the room, not the runaround.</h2>
          <p>
            Filter by discipline, city, and hourly budget. See exactly what the
            space includes, then send a request with the hours that fit your
            schedule.
          </p>
          <ul className="check-list">
            {creatorPoints.map((point) => (
              <li key={point}>
                <Check size={15} aria-hidden="true" />
                {point}
              </li>
            ))}
          </ul>
          <Link className="text-link" href="/studios">
            Browse the marketplace <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section className="story-split section-wrap">
        <div className="story-split-media">
          <Image
            src="https://images.unsplash.com/photo-1503428593586-e225b39bddfe?auto=format&fit=crop&w=1100&q=82"
            alt="A production stage with lighting rigged above the floor"
            fill
            sizes="(max-width: 900px) 100vw, 50vw"
          />
        </div>
        <div className="story-split-copy">
          <p className="eyebrow">For hosts</p>
          <h2>Share the space. Keep the control.</h2>
          <p>
            Set your hourly rate and house notes, then decide which requests
            become bookings. Your listing, your rules, your calendar.
          </p>
          <ul className="check-list">
            {hostPoints.map((point) => (
              <li key={point}>
                <Check size={15} aria-hidden="true" />
                {point}
              </li>
            ))}
          </ul>
          <Link className="text-link" href="/add-studio">
            Add your first studio <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section className="faq-section" id="faq">
        <div className="section-wrap">
          <div className="section-heading">
            <div>
              <p className="eyebrow">
                <HelpCircle size={14} aria-hidden="true" /> Good to know
              </p>
              <h2>Questions, answered plainly.</h2>
            </div>
          </div>
          <div className="faq-list">
            {faqs.map((faq) => (
              <details key={faq.question}>
                <summary>{faq.question}</summary>
                <p>{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="story-cta">
        <p className="eyebrow">Your next session starts here</p>
        <h2>Find the room that fits your idea.</h2>
        <div>
          <Link className="button button-accent" href="/studios">
            Explore studios <ArrowRight size={16} aria-hidden="true" />
          </Link>
          <Link className="button button-ghost" href="/how-it-works#faq">
            Read the details
          </Link>
        </div>
      </section>
    </main>
  );
}
