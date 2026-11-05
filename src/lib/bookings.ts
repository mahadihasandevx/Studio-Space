import { z } from "zod";

export const bookingSchema = z.object({
  id: z.string(),
  studioId: z.string(),
  studioTitle: z.string(),
  studioImage: z.string().url().nullable(),
  studioLocation: z.string().default(""),
  hostId: z.string(),
  customerId: z.string(),
  customerName: z.string(),
  customerEmail: z.string().email(),
  date: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  totalHours: z.number(),
  hourlyRate: z.number(),
  totalAmount: z.number(),
  status: z.enum(["pending", "confirmed", "completed", "cancelled"]),
  createdAt: z.string(),
});

export type BookingData = z.infer<typeof bookingSchema>;
