"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Heart, MapPin, Star } from "lucide-react";
import type { StudioCardData } from "@/lib/studios";
import { imageUnoptimized } from "@/lib/image";
import { useWishlist } from "@/components/wishlist-provider";

export function StudioCard({ studio }: { studio: StudioCardData }) {
  const { isPending, isSaved, toggleStudio } = useWishlist();
  const saved = isSaved(studio.id);
  return (
    <article className="studio-card" data-category={studio.category}>
      <Link
        className="studio-image"
        href={`/studios/${studio.id}`}
        aria-label={`View ${studio.title}`}
      >
        {studio.imageUrl && (
          <Image
            alt={`${studio.title} creative studio`}
            className="studio-card-image"
            fill
            sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw"
            src={studio.imageUrl}
            unoptimized={imageUnoptimized(studio.imageUrl)}
          />
        )}
        {!studio.imageUrl && <span className="studio-no-image">StudioSpace</span>}
        <span className="studio-category">{studio.category}</span>
        {studio.isDemo && <span className="studio-demo-badge">Demo listing</span>}
      </Link>
      <button
        className={`wishlist-link ${saved ? "is-saved" : ""}`}
        disabled={isPending(studio.id)}
        onClick={() => void toggleStudio(studio.id)}
        type="button"
        aria-label={saved ? `Remove ${studio.title} from saved studios` : `Save ${studio.title}`}
        aria-pressed={saved}
      >
        <Heart size={17} fill={saved ? "currentColor" : "none"} aria-hidden="true" />
      </button>
      <div className="studio-card-content">
        <div className="studio-title-row">
          <h3><Link href={`/studios/${studio.id}`}>{studio.title}</Link></h3>
          <span className="studio-rating">
            <Star size={14} fill="currentColor" aria-hidden="true" />
            {studio.rating?.toFixed(1) ?? "New"}
          </span>
        </div>
        <p className="studio-location"><MapPin size={14} aria-hidden="true" />{studio.location}</p>
        <div className="studio-card-bottom">
          <span><strong>${studio.hourlyRate}</strong> / hour</span>
          <Link href={`/studios/${studio.id}`} aria-label={`View details for ${studio.title}`}>
            View details <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}
