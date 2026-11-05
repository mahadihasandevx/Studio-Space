import { z } from "zod";

export const studioCardSchema = z.object({
  id: z.string(),
  title: z.string(),
  category: z.string(),
  location: z.string(),
  hourlyRate: z.number(),
  imageUrl: z.string().url().nullable(),
  rating: z.number().nullable(),
  isDemo: z.boolean().default(false),
});

export const studioSchema = studioCardSchema.extend({
  securityDeposit: z.number(),
  capacity: z.number(),
  images: z.array(z.string().url()),
  amenities: z.array(z.string()),
  description: z.string(),
  reviews: z.array(
    z.object({
      author: z.string(),
      rating: z.number(),
      comment: z.string(),
      createdAt: z.string(),
    }),
  ).default([]),
  host: z.object({
    id: z.string(),
    name: z.string(),
    image: z.string().nullable(),
  }),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const studioCategories = [
  "Photo Studios",
  "Film Stages",
  "Podcast Rooms",
  "Music Suites",
  "Art Workshops",
] as const;

export const marketplaceHighlightsSchema = z.object({
  data: z.object({
    studios: z.number(),
    cities: z.number(),
    categories: z.number(),
    reviews: z.number(),
    averageRating: z.number(),
    topCategories: z.array(
      z.object({ name: z.string(), count: z.number() }),
    ),
    testimonials: z.array(
      z.object({
        author: z.string(),
        rating: z.number(),
        comment: z.string(),
        studioTitle: z.string(),
        studioId: z.string(),
        createdAt: z.string(),
      }),
    ),
  }),
});

export type MarketplaceHighlights = z.infer<
  typeof marketplaceHighlightsSchema
>["data"];
export type MarketplaceTestimonial = MarketplaceHighlights["testimonials"][number];

export type StudioCardData = z.infer<typeof studioCardSchema>;
export type StudioData = z.infer<typeof studioSchema>;
