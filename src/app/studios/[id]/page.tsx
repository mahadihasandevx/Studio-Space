import { Suspense } from "react";
import { StudioDetails } from "@/components/studio-details";

export default function StudioDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<div className="section-padding text-center">Loading studio...</div>}>
      <StudioDetailsPageContent params={params} />
    </Suspense>
  );
}

async function StudioDetailsPageContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <StudioDetails studioId={id} />;
}
