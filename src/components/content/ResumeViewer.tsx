"use client";

import Script from "next/script";
import { useEffect, useRef } from "react";
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
}

export function ResumeViewer({ pdfSrc, downloadFilename }: ResumeViewerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const clientId = publicEnv.NEXT_PUBLIC_ADOBE_PDF_CLIENT_ID;

  useEffect(() => {
    if (!pdfSrc || !clientId) {
      return;
    }

    function renderViewer() {
      const container = containerRef.current;
      const AdobeView = window.AdobeDC?.View;
      if (!container || !AdobeView || !pdfSrc || !clientId) {
        return;
      }

      container.innerHTML = "";
      const viewDiv = document.createElement("div");
      viewDiv.id = "adobe-dc-view";
      container.append(viewDiv);

      new AdobeView({ clientId, divId: "adobe-dc-view" }).previewFile(
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
    }

    if (window.AdobeDC) {
      renderViewer();
      return;
    }

    document.addEventListener(ADOBE_READY_EVENT, renderViewer);
    return () => document.removeEventListener(ADOBE_READY_EVENT, renderViewer);
  }, [clientId, downloadFilename, pdfSrc]);

  const canView = Boolean(pdfSrc && clientId);

  return (
    <div className="resume__viewer">
      <Script src={ADOBE_VIEWER_SCRIPT} strategy="lazyOnload" />

      {canView ? (
        <div ref={containerRef} className="resume__adobe" />
      ) : (
        <div className="resume__empty type-md">
          <p className="type-title">Resume PDF not found</p>
          <p>
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
  );
}
