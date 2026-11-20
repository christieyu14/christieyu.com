"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { HazePageIntro } from "@/components/effects/HazePageIntro";
import {
  PageRevealProvider,
  usePageReveal,
} from "@/components/content/page-reveal";
import { ChromeToneProvider, useChromeTone } from "./ChromeToneContext";
import { ScrollChromeBlur } from "./ScrollChromeBlur";

function needsPhotoReady(pathname: string): boolean {
  return pathname === "/resume";
}

function isScrollPage(pathname: string): boolean {
  return (
    pathname.startsWith("/portfolio") ||
    pathname.startsWith("/photos") ||
    pathname.startsWith("/work")
  );
}

function SiteFrameShell({ children }: { children: ReactNode }) {
  const { ready } = usePageReveal();
  const tone = useChromeTone();
  const pathname = usePathname();
  const scroll = isScrollPage(pathname);

  return (
    <div
      className={`site-frame site-frame--${tone} page-reveal${
        ready ? " page-reveal--ready" : ""
      }${scroll ? " site-frame--scroll" : ""}`}
      data-chrome-tone={tone}
    >
      <HazePageIntro />
      {scroll ? <ScrollChromeBlur /> : null}
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
