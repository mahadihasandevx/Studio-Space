import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  AudioLines,
  Camera,
  Clapperboard,
  Disc3,
  Paintbrush2,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { FeaturedStudios } from "@/components/featured-studios";
import { HeroSlider } from "@/components/hero-slider";

const categories = [
  {
    name: "Photo studios",
    value: "Photo Studios",
    detail: "Natural light to full production",
    icon: Camera,
    tone: "peach",
  },
  {
    name: "Film stages",
    value: "Film Stages",
    detail: "Room to bring big ideas to life",
    icon: Clapperboard,
    tone: "lavender",
  },
  {
    name: "Podcast rooms",
    value: "Podcast Rooms",
    detail: "Sound-treated and ready to record",
    icon: AudioLines,
    tone: "mint",
  },
  {
    name: "Music suites",
    value: "Music Suites",
    detail: "Find your next creative frequency",
    icon: Disc3,
    tone: "blue",
  },
  {
    name: "Art workshops",
    value: "Art Workshops",
    detail: "Make a little room for making",
    icon: Paintbrush2,
    tone: "yellow",
  },
];

const steps = [
  {
    number: "01",
    title: "Find your space",
    text: "Explore distinctive studios made for the way you create.",
  },
  {
    number: "02",
    title: "Make it yours",
    text: "Choose your date, set your hours, and see the price upfront.",
  },
  {
    number: "03",
    title: "Make something",
    text: "Show up, settle in, and get straight to the good part.",
  },
];

export default function Home() {
  return (
    <main>
      <HeroSlider />

      <section className="section-wrap featured-section" id="featured">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Good spaces. Great things.</p>
            <h2>Room for your next big idea.</h2>
          </div>
          <Link className="text-link" href="/studios">
            Explore all spaces <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </div>
        <FeaturedStudios />
      </section>

      <section className="category-section" id="categories">
        <div className="section-wrap">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Find your kind of room</p>
              <h2>Made for what you make.</h2>
            </div>
            <p className="section-intro">
              From a quiet corner to a full-scale production floor, your next
              set starts here.
            </p>
          </div>
          <div className="category-grid">
            {categories.map(({ name, value, detail, icon: Icon, tone }) => (
              <Link
                className="category-card"
                href={`/studios?category=${encodeURIComponent(value)}`}
                key={name}
              >
                <span className={`category-icon ${tone}`}>
                  <Icon size={22} strokeWidth={1.7} aria-hidden="true" />
                </span>
                <span className="category-copy">
                  <strong>{name}</strong>
                  <span>{detail}</span>
                </span>
                <ArrowRight className="category-arrow" size={18} aria-hidden="true" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section-wrap how-section" id="how-it-works">
        <div className="how-copy">
          <p className="eyebrow">Less searching, more making</p>
          <h2>Your next great work starts with a little room.</h2>
          <p>
            The right space can change everything. Find a studio that fits your
            project, your people, and the way you like to work.
          </p>
          <Link className="button button-dark" href="/studios">
            Find your space <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </div>
        <div className="steps-list">
          {steps.map(({ number, title, text }) => (
            <article className="step-card" key={number}>
              <span className="step-number">{number}</span>
              <div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
              <ArrowDown className="step-arrow" size={18} aria-hidden="true" />
            </article>
          ))}
        </div>
      </section>

      <section className="host-section" id="about">
        <div className="host-image" role="img" aria-label="A sunlit creative studio prepared for a shoot" />
        <div className="host-content">
          <p className="eyebrow">A better kind of production day</p>
          <h2>Good people. Good spaces. Good work.</h2>
          <p>
            StudioSpace brings independent creators and thoughtful space
            owners together, so the logistics feel lighter and the work gets
            all the attention.
          </p>
          <div className="host-points">
            <div>
              <span className="host-point-icon"><ShieldCheck size={19} aria-hidden="true" /></span>
              <span><strong>Clear from the start</strong><small>Transparent pricing and booking details.</small></span>
            </div>
            <div>
              <span className="host-point-icon"><UsersRound size={19} aria-hidden="true" /></span>
              <span><strong>Made for creatives</strong><small>Spaces and tools for every kind of project.</small></span>
            </div>
          </div>
          <Link className="text-link" href="/add-studio">
            Have a space to share? <span>Become a host</span>
            <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section className="closing-cta">
        <div className="closing-orbit" aria-hidden="true"><Sparkles size={25} /></div>
        <p className="eyebrow">The next frame is yours</p>
        <h2>Make room for something<br />worth making.</h2>
        <Link className="button button-light" href="/studios">
          Explore studios <ArrowRight size={17} aria-hidden="true" />
        </Link>
      </section>
    </main>
  );
}
