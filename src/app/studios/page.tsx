import { Suspense } from "react";
import { StudioExplorer } from "@/components/studio-explorer";

export default function StudiosPage() {
  return (
    <Suspense fallback={<main className="explore-page explore-page-loading" aria-label="Loading studios" />}>
      <StudioExplorer />
    </Suspense>
  );
}
