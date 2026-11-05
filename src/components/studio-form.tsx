"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, ImagePlus, LoaderCircle, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { ApiError, apiRequest, jsonBody } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import { studioCategories, studioSchema, type StudioData } from "@/lib/studios";

const amenityOptions = [
  "Natural light",
  "Cyclorama wall",
  "Lighting equipment",
  "Backdrops",
  "Makeup area",
  "Private parking",
  "Soundproofing",
  "Air conditioning",
  "Wi-Fi",
  "Kitchen access",
  "Restroom",
  "Freight elevator",
];

const studioFormSchema = z.object({
  title: z.string().trim().min(3, "Use at least 3 characters.").max(100),
  category: z.enum(studioCategories, { error: "Choose a studio category." }),
  hourlyRate: z.coerce.number().positive("Enter a rate greater than zero.").max(5000),
  securityDeposit: z.coerce.number().min(0).max(50000),
  capacity: z.coerce.number().int().positive("Capacity must be at least one.").max(1000),
  location: z.string().trim().min(3, "Add a city or neighborhood.").max(140),
  images: z.array(z.string().url()).min(1, "Add at least one studio image.").max(10),
  amenities: z.array(z.string().trim().min(2).max(40)).max(30),
  description: z.string().trim().min(40, "Add at least 40 characters.").max(5000),
});

type StudioFormInput = z.input<typeof studioFormSchema>;
type StudioFormOutput = z.output<typeof studioFormSchema>;

const studioResponseSchema = z.object({ data: studioSchema });

const emptyValues: StudioFormInput = {
  title: "",
  category: "Photo Studios",
  hourlyRate: 0,
  securityDeposit: 0,
  capacity: 1,
  location: "",
  images: [],
  amenities: [],
  description: "",
};

export function StudioForm({
  initialStudio,
  studioId,
}: {
  initialStudio?: StudioData;
  studioId?: string;
}) {
  const router = useRouter();
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const [uploading, setUploading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [imageInputError, setImageInputError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<StudioFormInput, unknown, StudioFormOutput>({
    resolver: zodResolver(studioFormSchema),
    defaultValues: initialStudio
      ? {
          title: initialStudio.title,
          category:
            studioCategories.find((category) => category === initialStudio.category) ??
            studioCategories[0],
          hourlyRate: initialStudio.hourlyRate,
          securityDeposit: initialStudio.securityDeposit,
          capacity: initialStudio.capacity,
          location: initialStudio.location,
          images: initialStudio.images,
          amenities: initialStudio.amenities,
          description: initialStudio.description,
        }
      : emptyValues,
  });
  const [amenities, setAmenities] = useState<string[]>(initialStudio?.amenities ?? []);
  const [images, setImages] = useState<string[]>(initialStudio?.images ?? []);

  useEffect(() => {
    if (!sessionPending && !session) {
      const currentPath = studioId ? `/studios/edit/${studioId}` : "/add-studio";
      router.replace(`/login?redirect=${encodeURIComponent(currentPath)}`);
    }
  }, [router, session, sessionPending, studioId]);

  async function uploadImage(file: File) {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      const message = "Choose a JPEG, PNG, or WebP image.";
      setImageInputError(message);
      toast.error(message);
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      const message = "Images must be 8 MB or smaller.";
      setImageInputError(message);
      toast.error(message);
      return;
    }
    if (images.length >= 10) {
      const message = "A listing can include up to 10 images.";
      setImageInputError(message);
      toast.error(message);
      return;
    }

    setUploading(true);
    try {
      const imgbbKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
      if (!imgbbKey) {
        toast.error("Image upload is not configured. Paste a public image URL instead.");
        return;
      }
      const formData = new FormData();
      formData.set("image", file);
      const response = await fetch(
        `https://api.imgbb.com/1/upload?key=${encodeURIComponent(imgbbKey)}`,
        { method: "POST", body: formData },
      );
      const payload = await response.json() as { success?: boolean; data?: { url?: string } };
      if (!response.ok || !payload.success || !payload.data?.url) {
        throw new Error("The image host could not complete the upload.");
      }
      const nextImages = [...getValues("images"), payload.data.url];
      setImages(nextImages);
      setValue("images", nextImages, { shouldValidate: true });
      setImageInputError(null);
      toast.success("Studio image uploaded.");
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "The image could not be uploaded.";
      setImageInputError(message);
      toast.error(message);
    } finally {
      setUploading(false);
    }
  }

  function removeImage(image: string) {
    const nextImages = getValues("images").filter((currentImage) => currentImage !== image);
    setImages(nextImages);
    setValue("images", nextImages, { shouldValidate: true });
  }

  function addImageUrl() {
    const parsedUrl = z.string().url().safeParse(imageUrl.trim());
    if (!parsedUrl.success) {
      const message = "Enter a valid public image URL.";
      setImageInputError(message);
      toast.error(message);
      return;
    }
    if (images.length >= 10) {
      const message = "A listing can include up to 10 images.";
      setImageInputError(message);
      toast.error(message);
      return;
    }
    const nextImages = [...getValues("images"), parsedUrl.data];
    setImages(nextImages);
    setValue("images", nextImages, { shouldValidate: true });
    setImageUrl("");
    setImageInputError(null);
    toast.success("Image URL added.");
  }

  function toggleAmenity(amenity: string, checked: boolean) {
    const nextAmenities = checked
      ? [...amenities, amenity]
      : amenities.filter((currentAmenity) => currentAmenity !== amenity);
    setAmenities(nextAmenities);
    setValue("amenities", nextAmenities, { shouldValidate: true });
  }

  async function onSubmit(values: StudioFormOutput) {
    setFormError(null);
    if (!session) {
      setFormError("Sign in again before saving this studio.");
      return;
    }

    try {
      await apiRequest(
        studioId ? `/api/v1/studios/${encodeURIComponent(studioId)}` : "/api/v1/studios",
        studioResponseSchema,
        {
          method: studioId ? "PATCH" : "POST",
          body: jsonBody(values),
        },
      );
      toast.success(studioId ? "Studio listing updated." : "Your studio is live.");
      router.push("/my-listings");
      router.refresh();
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "The studio could not be saved.";
      setFormError(message);
      toast.error(message);
    }
  }

  if (sessionPending || !session) {
    return <main className="section-wrap form-loading" aria-label="Checking your account"><div className="details-skeleton" /></main>;
  }

  return (
    <main className="studio-editor-page">
      <div className="section-wrap studio-editor-wrap">
        <Link className="details-back" href="/my-listings"><ArrowLeft size={15} /> My listings</Link>
        <div className="editor-heading">
          <div>
            <p className="eyebrow">{studioId ? "A fresh look" : "Your space, your story"}</p>
            <h1>{studioId ? "Update your listing." : "Share your studio."}</h1>
            <p>Give creators the details they need to picture their next project here.</p>
          </div>
          <span className="editor-heading-mark"><ImagePlus size={24} /></span>
        </div>

        <form className="studio-form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <section className="form-section">
            <div className="form-section-heading"><span>01</span><div><h2>The essentials</h2><p>A name and a few specifics to help people find you.</p></div></div>
            <div className="form-fields-grid">
              <label className="form-field form-field-wide">
                <span>Studio name</span>
                <input placeholder="e.g. The North Light Studio" {...register("title")} />
                {errors.title && <small>{errors.title.message}</small>}
              </label>
              <label className="form-field">
                <span>Category</span>
                <select {...register("category")}>
                  {studioCategories.map((category) => <option key={category} value={category}>{category}</option>)}
                </select>
                {errors.category && <small>{errors.category.message}</small>}
              </label>
              <label className="form-field">
                <span>Location</span>
                <input placeholder="City, neighborhood" {...register("location")} />
                {errors.location && <small>{errors.location.message}</small>}
              </label>
              <label className="form-field">
                <span>Hourly rate (USD)</span>
                <span className="money-field"><b>$</b><input min="1" step="0.01" type="number" {...register("hourlyRate")} /></span>
                {errors.hourlyRate && <small>Enter a rate greater than zero.</small>}
              </label>
              <label className="form-field">
                <span>Security deposit (USD)</span>
                <span className="money-field"><b>$</b><input min="0" step="0.01" type="number" {...register("securityDeposit")} /></span>
                {errors.securityDeposit && <small>Enter a deposit of $50,000 or less.</small>}
              </label>
              <label className="form-field">
                <span>Maximum capacity</span>
                <input min="1" step="1" type="number" {...register("capacity")} />
                {errors.capacity && <small>Enter a capacity of at least one.</small>}
              </label>
            </div>
          </section>

          <section className="form-section">
            <div className="form-section-heading"><span>02</span><div><h2>Show them around</h2><p>Upload up to 10 images. The first image is your cover photo.</p></div></div>
            {process.env.NEXT_PUBLIC_IMGBB_API_KEY ? (
              <label className={`upload-dropzone ${uploading ? "is-uploading" : ""}`}>
                {uploading ? <LoaderCircle className="upload-spinner" size={23} /> : <ImagePlus size={23} />}
                <strong>{uploading ? "Uploading your image…" : "Add a studio photo"}</strong>
                <span>JPEG, PNG or WebP · 8 MB max per image</span>
                <input
                  accept="image/jpeg,image/png,image/webp"
                  aria-describedby={imageInputError ? "studio-image-error" : undefined}
                  aria-invalid={Boolean(imageInputError)}
                  disabled={uploading}
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) void uploadImage(file);
                    event.target.value = "";
                  }}
                  type="file"
                />
              </label>
            ) : (
              <div className="image-url-entry">
                <p>Image uploads are not configured. Add a public image URL instead.</p>
                <label className="form-field">
                  <span>Image URL</span>
                  <input
                    aria-describedby={imageInputError ? "studio-image-error" : undefined}
                    aria-invalid={Boolean(imageInputError)}
                    onChange={(event) => setImageUrl(event.target.value)}
                    placeholder="https://images.example.com/studio.jpg"
                    type="url"
                    value={imageUrl}
                  />
                </label>
                <button className="button button-outline" onClick={addImageUrl} type="button">Add image URL</button>
              </div>
            )}
            {imageInputError && <p className="field-error" id="studio-image-error" role="alert">{imageInputError}</p>}
            <div className="uploaded-images">
              {images.map((image, index) => (
                <div className="uploaded-image" key={image} style={{ backgroundImage: `url("${image}")` }}>
                  {index === 0 && <span>Cover</span>}
                  <button aria-label={`Remove studio image ${index + 1}`} onClick={() => removeImage(image)} type="button"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
            {errors.images && <p className="field-error">{errors.images.message ?? "Add at least one image."}</p>}
          </section>

          <section className="form-section">
            <div className="form-section-heading"><span>03</span><div><h2>What makes it special?</h2><p>Tell creators what they can make and what they’ll find here.</p></div></div>
            <div className="amenity-choices">
              {amenityOptions.map((amenity) => (
                <label key={amenity}>
                  <input
                    checked={amenities.includes(amenity)}
                    onChange={(event) => toggleAmenity(amenity, event.target.checked)}
                    type="checkbox"
                  />
                  <span>{amenity}</span>
                </label>
              ))}
            </div>
            <label className="form-field form-description">
              <span>Studio description</span>
              <textarea placeholder="Describe the space, the atmosphere, and what a creator might make here…" rows={7} {...register("description")} />
              <small className="description-hint">40–5,000 characters</small>
              {errors.description && <small>{errors.description.message}</small>}
            </label>
          </section>

          <section className="form-section host-readonly-section">
            <div className="form-section-heading"><span>04</span><div><h2>Your host details</h2><p>This information is linked to your verified StudioSpace account.</p></div></div>
            <div className="form-fields-grid">
              <label className="form-field"><span>Host name</span><input readOnly value={session.user.name} /></label>
              <label className="form-field"><span>Host email</span><input readOnly value={session.user.email} /></label>
            </div>
          </section>

          {formError && <p className="form-error" role="alert">{formError}</p>}
          <div className="editor-actions">
            <Link className="button button-outline" href="/my-listings">Cancel</Link>
            <button className="button button-accent" disabled={isSubmitting || uploading} type="submit">
              {isSubmitting ? "Saving…" : studioId ? "Save changes" : "Publish studio"} <ArrowRight size={16} aria-hidden="true" />
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
