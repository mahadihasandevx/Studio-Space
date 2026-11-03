import { z } from "zod";

export const studioCardSchema = z.object({
  id: z.string(),
  title: z.string(),
  category: z.string(),
  location: z.string(),
  hourlyRate: z.number(),
  imageUrl: z.string().url().nullable(),
  rating: z.number().nullable(),
});

export const studioSchema = studioCardSchema.extend({
  securityDeposit: z.number(),
  capacity: z.number(),
  images: z.array(z.string().url()),
  amenities: z.array(z.string()),
  description: z.string(),
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

export type StudioCardData = z.infer<typeof studioCardSchema>;
export type StudioData = z.infer<typeof studioSchema>;
