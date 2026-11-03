"use client";

import Link from "next/link";
import { ArrowRight, MoveDownRight, Star } from "lucide-react";
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
    images: [
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1400&q=88",
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=900&q=88",
      "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=900&q=88",
    ],
    rating: "4.9",
    price: "$78 / hour",
    sticker: "BOOK THE ROOM",
  },
  {
    kicker: "Make something worth sharing",
    title: <>Your next idea<br />needs a <em>stage.</em></>,
    description: "From first take to final frame, find a space that feels like yours.",
    images: [
      "https://images.unsplash.com/photo-1503428593586-e225b39bddfe?auto=format&fit=crop&w=1400&q=88",
      "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=900&q=88",
      "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=900&q=88",
    ],
    rating: "5.0",
    price: "$195 / hour",
    sticker: "READY FOR THE TAKE",
  },
  {
    kicker: "A little space goes a long way",
    title: <>Good things<br />happen <em>here.</em></>,
    description: "Book a thoughtful studio and get on with making something great.",
    images: [
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1400&q=88",
      "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&w=900&q=88",
      "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=900&q=88",
    ],
    rating: "4.8",
    price: "$62 / hour",
    sticker: "MAKE A LITTLE NOISE",
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
            <div className="hero-slide">
              <div className="hero-content">
                <span className="hero-kicker"><span />{slide.kicker}</span>
                <h1>{slide.title}</h1>
                <p>{slide.description}</p>
                <div className="hero-actions">
                  <Link className="button button-accent" href="/studios">
                    Explore studios <ArrowRight size={17} aria-hidden="true" />
                  </Link>
                  <Link className="button button-ghost" href="/add-studio">
                    Host your space <MoveDownRight size={16} aria-hidden="true" />
                  </Link>
                </div>
              </div>
              <div className="hero-collage" aria-label="Creative studios available to book">
                <div className="hero-photo hero-photo-main" style={{ backgroundImage: `url("${slide.images[0]}")` }} />
                <div className="hero-photo hero-photo-top" style={{ backgroundImage: `url("${slide.images[1]}")` }} />
                <div className="hero-photo hero-photo-bottom" style={{ backgroundImage: `url("${slide.images[2]}")` }} />
                <span className="hero-sticker hero-sticker-rating"><Star size={15} fill="currentColor" /> {slide.rating} <small>CREATOR RATING</small></span>
                <span className="hero-sticker hero-sticker-price">{slide.price}</span>
                <span className="hero-sticker hero-sticker-label">{slide.sticker}</span>
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
