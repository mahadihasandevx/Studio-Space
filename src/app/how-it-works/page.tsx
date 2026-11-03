import Link from "next/link";
import { ArrowRight, CalendarDays, CheckCircle2, Compass, WandSparkles } from "lucide-react";

const steps = [
  { icon: Compass, number: "01", title: "Discover spaces", text: "Search by creative discipline, neighborhood, and hourly budget. Compare details and see what each room is set up to do." },
  { icon: CalendarDays, number: "02", title: "Select your shoot hours", text: "Choose a future date and a time window that works for your crew. The total is calculated before you send a request." },
  { icon: CheckCircle2, number: "03", title: "Book with the host", text: "Your booking starts as a request. The host can review the details and confirm it; confirmed hours cannot overlap." },
  { icon: WandSparkles, number: "04", title: "Create and produce", text: "Use the host’s notes to arrive prepared, get straight to your work, and download an invoice for a confirmed booking." },
];

export default function HowItWorksPage() {
  return (
    <main className="story-page">
      <section className="story-hero section-wrap">
        <p className="eyebrow">A better production day</p>
        <h1>Less logistics.<br /><span>More making.</span></h1>
        <p>From finding a room to wrapping the final take, StudioSpace keeps the details clear so your creative energy stays on the project.</p>
      </section>
      <section className="section-wrap process-grid">
        {steps.map(({ icon: Icon, number, title, text }) => (
          <article className="process-card" key={number}><span className="process-number">{number}</span><Icon size={24} /><h2>{title}</h2><p>{text}</p></article>
        ))}
      </section>
      <section className="story-cta"><p className="eyebrow">Your next session starts here</p><h2>Find the room that fits your idea.</h2><Link className="button button-accent" href="/studios">Explore studios <ArrowRight size={16} /></Link></section>
    </main>
  );
}
