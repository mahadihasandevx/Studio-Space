import { Suspense } from "react";
import { RouteLoading } from "@/components/route-loading";
import { StudioDetails } from "@/components/studio-details";

export default function StudioDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<RouteLoading />}>
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
