import { Suspense } from "react";
import { StudioExplorer } from "@/components/studio-explorer";
import { RouteLoading } from "@/components/route-loading";

export default function StudiosPage() {
  return (
    <Suspense fallback={<RouteLoading />}>
      <StudioExplorer />
    </Suspense>
  );
}
