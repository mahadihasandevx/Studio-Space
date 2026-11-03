"use client";

import Link from "next/link";
import { ArrowRight, MoveDownRight } from "lucide-react";
import { EffectFade, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/navigation";
import "swiper/css/pagination";

const slides = [
  {
    kicker: "A space to see it differently",
    title: <>Find the room<br />to make <em>more.</em></>,
    description: "Distinctive creative spaces for the work you can’t wait to make.",
    image:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=2400&q=88",
    position: "center 52%",
  },
  {
    kicker: "Make something worth sharing",
    title: <>Your next idea<br />needs a <em>stage.</em></>,
    description: "From first take to final frame, find a space that feels like yours.",
    image:
      "https://images.unsplash.com/photo-1503428593586-e225b39bddfe?auto=format&fit=crop&w=2400&q=88",
    position: "center 54%",
  },
  {
    kicker: "A little space goes a long way",
    title: <>Good things<br />happen <em>here.</em></>,
    description: "Book a thoughtful studio and get on with making something great.",
    image:
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=2400&q=88",
    position: "center 50%",
  },
];

export function HeroSlider() {
  return (
    <section className="hero-section" aria-label="Featured creative spaces">
      <Swiper
        className="hero-swiper"
        modules={[EffectFade, Navigation, Pagination]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        navigation
        pagination={{ clickable: true }}
        loop
        speed={850}
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.kicker}>
            <div
              className="hero-slide"
              style={{
                backgroundImage: `linear-gradient(90deg, rgba(20, 20, 19, .74) 0%, rgba(20, 20, 19, .48) 45%, rgba(20, 20, 19, .1) 100%), url("${slide.image}")`,
                backgroundPosition: slide.position,
              }}
            >
              <div className="hero-content">
                <span className="hero-kicker"><span />{slide.kicker}</span>
                <h1>{slide.title}</h1>
                <p>{slide.description}</p>
                <div className="hero-actions">
                  <Link className="button button-accent" href="/studios">
                    Explore studios <ArrowRight size={17} aria-hidden="true" />
                  </Link>
                  <Link className="button button-ghost" href="/add-studio">
                    List your space <MoveDownRight size={16} aria-hidden="true" />
                  </Link>
                </div>
              </div>
              <span className="hero-index">0{slides.indexOf(slide) + 1} <span>/ 0{slides.length}</span></span>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      <a className="hero-scroll" href="#featured">
        Scroll to explore <span><MoveDownRight size={14} aria-hidden="true" /></span>
      </a>
    </section>
  );
}
