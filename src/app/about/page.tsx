import Link from "next/link";
import { ArrowRight, Aperture, HeartHandshake, Lightbulb, UsersRound } from "lucide-react";

export default function AboutPage() {
  return (
    <main className="story-page">
      <section className="story-hero section-wrap">
        <p className="eyebrow">A little room for everyone</p>
        <h1>Space to make<br /><span>something matter.</span></h1>
        <p>StudioSpace brings independent creators and thoughtful space owners together. We believe the right room can turn a good idea into the thing people remember.</p>
      </section>
      <section className="about-values section-wrap">
        <article><Aperture /><h2>Built around making</h2><p>Our marketplace is for the messy, joyful, collaborative work that needs a room of its own.</p></article>
        <article><HeartHandshake /><h2>Good hosts, clear details</h2><p>Useful listing information and direct host ownership help every booking begin with trust.</p></article>
        <article><UsersRound /><h2>Independent by nature</h2><p>We celebrate local studios, rehearsal rooms, workshops, and the people who keep them open.</p></article>
        <article><Lightbulb /><h2>Room for the next idea</h2><p>Whether it is a first interview or a full production, every creative project deserves a place to start.</p></article>
      </section>
      <section className="story-cta"><p className="eyebrow">Creators and hosts, together</p><h2>Find your next space or share one of your own.</h2><div><Link className="button button-accent" href="/studios">Explore spaces <ArrowRight size={16} /></Link><Link className="button button-outline" href="/add-studio">Become a host</Link></div></section>
    </main>
  );
}
