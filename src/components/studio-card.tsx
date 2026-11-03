"use client";

import Link from "next/link";
import { ArrowRight, Heart, MapPin, Star } from "lucide-react";
import type { StudioCardData } from "@/lib/studios";
import { useWishlist } from "@/components/wishlist-provider";

export function StudioCard({ studio }: { studio: StudioCardData }) {
  const { isPending, isSaved, toggleStudio } = useWishlist();
  const saved = isSaved(studio.id);
  return (
    <article className="studio-card">
      <Link
        className="studio-image"
        href={`/studios/${studio.id}`}
        style={studio.imageUrl ? { backgroundImage: `url("${studio.imageUrl}")` } : undefined}
        aria-label={`View ${studio.title}`}
      >
        {!studio.imageUrl && <span className="studio-no-image">StudioSpace</span>}
        <span className="studio-category">{studio.category}</span>
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
            <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}
