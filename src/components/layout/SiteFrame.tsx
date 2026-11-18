"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { HazePageIntro } from "@/components/effects/HazePageIntro";
import {
  PageRevealProvider,
  usePageReveal,
} from "@/components/content/page-reveal";
import { ChromeToneProvider, useChromeTone } from "./ChromeToneContext";

function needsPhotoReady(pathname: string): boolean {
  return pathname === "/resume";
}

function SiteFrameShell({ children }: { children: ReactNode }) {
  const { ready } = usePageReveal();
  const tone = useChromeTone();
  return (
    <div
      className={`site-frame site-frame--${tone} page-reveal${
        ready ? " page-reveal--ready" : ""
      }`}
      data-chrome-tone={tone}
    >
      <HazePageIntro />
      {children}
    </div>
  );
}

export function SiteFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const autoReady = !needsPhotoReady(pathname);

  return (
    <PageRevealProvider autoReady={autoReady}>
      <ChromeToneProvider>
        <SiteFrameShell>{children}</SiteFrameShell>
      </ChromeToneProvider>
    </PageRevealProvider>
  );
}
