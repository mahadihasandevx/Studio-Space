"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, CalendarDays, Clock3, X } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { apiRequest, jsonBody } from "@/lib/api";
import { useEscapeToClose } from "@/lib/use-escape-close";
import type { StudioData } from "@/lib/studios";

const bookingSchema = z
  .object({
    date: z.string().min(1, "Choose a date."),
    startTime: z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/),
    endTime: z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/),
  })
  .superRefine((booking, context) => {
    const startMinutes = Number(booking.startTime.slice(0, 2)) * 60 + Number(booking.startTime.slice(3, 5));
    const endMinutes = Number(booking.endTime.slice(0, 2)) * 60 + Number(booking.endTime.slice(3, 5));
    if (endMinutes <= startMinutes) {
      context.addIssue({
        code: "custom",
        path: ["endTime"],
        message: "End time must be after the start time.",
      });
    } else if (startMinutes % 30 !== 0 || endMinutes % 30 !== 0) {
      context.addIssue({
        code: "custom",
        path: ["endTime"],
        message: "Choose times in 30-minute increments.",
      });
    }
  });

type BookingValues = z.infer<typeof bookingSchema>;

const bookingResponseSchema = z.object({
  data: z.object({
    id: z.string(),
    totalHours: z.number(),
    totalAmount: z.number(),
    status: z.literal("pending"),
  }),
});

const timeOptions = Array.from({ length: 48 }, (_, index) => {
  const minutes = index * 30;
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
});

function durationInHours(startTime: string, endTime: string) {
  if (!startTime || !endTime) return 0;
  const start = Number(startTime.slice(0, 2)) * 60 + Number(startTime.slice(3, 5));
  const end = Number(endTime.slice(0, 2)) * 60 + Number(endTime.slice(3, 5));
  return end > start ? (end - start) / 60 : 0;
}

export function BookingModal({
  studio,
  minDate,
  onClose,
}: {
  studio: StudioData;
  minDate: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const dialogRef = useRef<HTMLElement | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<BookingValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: { date: minDate, startTime: "09:00", endTime: "10:00" },
  });
  const startTime = useWatch({ control, name: "startTime" });
  const endTime = useWatch({ control, name: "endTime" });
  const hours = durationInHours(startTime, endTime);
  const estimate = studio.hourlyRate * hours;
  useEscapeToClose(onClose, dialogRef);

  async function onSubmit(values: BookingValues) {
    setFormError(null);
    try {
      await apiRequest(
        "/api/v1/bookings",
        bookingResponseSchema,
        {
          method: "POST",
          body: jsonBody({ studioId: studio.id, ...values }),
        },
      );
      toast.success("Booking request sent. The host will confirm your time.");
      onClose();
      router.push("/my-bookings");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Your booking request could not be sent.";
      setFormError(message);
      toast.error(message);
    }
  }

  return (
    <div className="dialog-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section
        aria-labelledby="booking-modal-title"
        aria-modal="true"
        className="booking-modal"
        ref={dialogRef}
        role="dialog"
        tabIndex={-1}
      >
        <div className="booking-modal-heading">
          <div>
            <p className="eyebrow">Make it a work day</p>
            <h2 id="booking-modal-title">Request a booking</h2>
          </div>
          <button aria-label="Close booking dialog" className="dialog-close" onClick={onClose} type="button">
            <X size={18} />
          </button>
        </div>
        <p className="booking-studio-name">{studio.title}</p>
        <form className="booking-form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <label>
            <span>Date</span>
            <span className="booking-input">
              <CalendarDays size={16} aria-hidden="true" />
              <input min={minDate} type="date" {...register("date")} />
            </span>
          </label>
          {errors.date && <span className="field-error">{errors.date.message}</span>}
          <div className="booking-time-grid">
            <label>
              <span>Start time</span>
              <span className="booking-input">
                <Clock3 size={16} aria-hidden="true" />
                <select {...register("startTime")}>
                  {timeOptions.map((time) => <option key={time} value={time}>{time}</option>)}
                </select>
              </span>
            </label>
            <label>
              <span>End time</span>
              <span className="booking-input">
                <Clock3 size={16} aria-hidden="true" />
                <select {...register("endTime")}>
                  {timeOptions.map((time) => <option key={time} value={time}>{time}</option>)}
                </select>
              </span>
            </label>
          </div>
          {errors.endTime && <span className="field-error">{errors.endTime.message}</span>}

          <div className="booking-estimate">
            <span>${studio.hourlyRate} × {hours} {hours === 1 ? "hour" : "hours"}</span>
            <strong>${estimate.toFixed(2)}</strong>
          </div>
          <p className="booking-note">
            The ${studio.securityDeposit.toFixed(2)} security deposit is listed separately. Your host will confirm this request.
          </p>
          {formError && <p className="booking-error" role="alert">{formError}</p>}
          <button className="button button-accent booking-submit" disabled={isSubmitting || hours <= 0} type="submit">
            {isSubmitting ? "Sending request…" : "Request this time"} <ArrowRight size={16} aria-hidden="true" />
          </button>
        </form>
      </section>
    </div>
  );
}
