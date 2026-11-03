import { Suspense } from "react";
import { StudioEditRoute } from "@/components/studio-edit-route";

export default function EditStudioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<div className="section-padding text-center">Loading studio...</div>}>
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
