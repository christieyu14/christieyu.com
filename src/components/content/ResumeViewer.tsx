"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { publicEnv } from "@/lib/env";

declare global {
  interface Window {
    AdobeDC?: {
      View: new (config: { clientId: string; divId: string }) => {
        previewFile: (
          file: {
            content: { promise: Promise<ArrayBuffer> };
            metaData: { fileName: string };
          },
          previewConfig: Record<string, boolean | string>,
        ) => void;
      };
    };
  }
}

const ADOBE_VIEWER_SCRIPT = "https://acrobatservices.adobe.com/view-sdk/viewer.js";
const ADOBE_READY_EVENT = "adobe_dc_view_sdk.ready";

const PREVIEW_CONFIG = {
  embedMode: "FULL_WINDOW",
  defaultViewMode: "FIT_WIDTH",
  showAnnotationTools: false,
  showPrintPDF: false,
  showDownloadPDF: true,
  showThumbnails: false,
  showBookmarks: false,
  showZoomControl: true,
  showFullScreenViewButton: true,
  enableFormFilling: false,
  enableAnnotationAPIs: false,
  enableSearchAPIs: false,
  showSaveButton: false,
} as const;

interface ResumeViewerProps {
  pdfSrc?: string;
  downloadFilename: string;
  updatedLabel: string;
}

export function ResumeViewer({
  pdfSrc,
  downloadFilename,
  updatedLabel,
}: ResumeViewerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [sdkReady, setSdkReady] = useState(false);
  const clientId = publicEnv.NEXT_PUBLIC_ADOBE_PDF_CLIENT_ID;

  useEffect(() => {
    function onReady() {
      setSdkReady(true);
    }

    if (typeof window !== "undefined" && window.AdobeDC) {
      setSdkReady(true);
      return;
    }

    document.addEventListener(ADOBE_READY_EVENT, onReady);
    return () => document.removeEventListener(ADOBE_READY_EVENT, onReady);
  }, []);

  useEffect(() => {
    if (!sdkReady || !pdfSrc || !clientId || !containerRef.current) {
      return;
    }

    const AdobeView = window.AdobeDC?.View;
    if (!AdobeView) {
      return;
    }

    containerRef.current.innerHTML = "";

    const viewDiv = document.createElement("div");
    viewDiv.id = "adobe-dc-view";
    containerRef.current.append(viewDiv);

    const adobeDCView = new AdobeView({
      clientId,
      divId: "adobe-dc-view",
    });

    adobeDCView.previewFile(
      {
        content: {
          promise: fetch(pdfSrc).then((response) => {
            if (!response.ok) {
              throw new Error("Failed to load resume PDF");
            }
            return response.arrayBuffer();
          }),
        },
        metaData: { fileName: downloadFilename },
      },
      PREVIEW_CONFIG,
    );
  }, [clientId, downloadFilename, pdfSrc, sdkReady]);

  const canView = Boolean(pdfSrc && clientId);

  return (
    <div className="resume__viewer">
      <Script src={ADOBE_VIEWER_SCRIPT} strategy="lazyOnload" />

      <div className="resume__meta">
        <p className="resume__meta-label">
          Resume
          {updatedLabel ? ` - Last updated ${updatedLabel}` : null}
        </p>
      </div>

      <div className="resume__stage">
        {canView ? (
          <div ref={containerRef} className="resume__adobe" />
        ) : (
          <div className="resume__empty">
            <p className="resume__empty-title">Resume PDF not found</p>
            <p className="resume__empty-copy">
              {!clientId ? (
                <>
                  Set <code>NEXT_PUBLIC_ADOBE_PDF_CLIENT_ID</code> for the PDF viewer,
                  plus <code>FIGMA_ACCESS_TOKEN</code> or drop{" "}
                  <code>public/resume/Christie-Yu-Resume.pdf</code>.
                </>
              ) : (
                <>
                  Set <code>FIGMA_ACCESS_TOKEN</code> to export from Figma (which also
                  saves a fallback PDF), or drop{" "}
                  <code>public/resume/Christie-Yu-Resume.pdf</code>, then refresh.
                </>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
