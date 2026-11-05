import { Suspense } from "react";
import { RouteLoading } from "@/components/route-loading";
import { StudioEditRoute } from "@/components/studio-edit-route";

export default function EditStudioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<RouteLoading />}>
      <EditStudioPageContent params={params} />
    </Suspense>
  );
}

async function EditStudioPageContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <StudioEditRoute studioId={id} />;
}
