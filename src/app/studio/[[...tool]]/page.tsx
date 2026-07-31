"use client";

import { NextStudio } from "next-sanity/studio";
import { EmptyState } from "@/components/content/EmptyState";
import config from "../../../../sanity.config";

export default function StudioPage() {
  if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
    return (
      <main id="main-content" className="container" style={{ paddingBlock: "2rem" }}>
        <EmptyState
          title="Sanity Studio not configured"
          description="Set NEXT_PUBLIC_SANITY_PROJECT_ID and NEXT_PUBLIC_SANITY_DATASET in your environment."
        />
      </main>
    );
  }

  return <NextStudio config={config} />;
}
