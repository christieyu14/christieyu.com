"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

const MIN_ZOOM = 1;
const MAX_ZOOM = 2.5;
const ZOOM_STEP = 0.25;

interface ResumeViewerProps {
  pdfSrc?: string;
  pdfDownloadUrl?: string;
  downloadFilename: string;
  updatedLabel: string;
}

function isFullscreenElement(node: HTMLElement | null): boolean {
  if (!node || typeof document === "undefined") {
    return false;
  }
  return document.fullscreenElement === node;
}

function clampZoom(value: number): number {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.round(value * 100) / 100));
}

/**
 * Native PDF embed (selectable text + clickable links) with a light hover chrome.
 * Zoom is applied via the viewer `#zoom=` param so fullscreen never CSS-clips the page.
 */
export function ResumeViewer({
  pdfSrc,
  pdfDownloadUrl,
  downloadFilename,
  updatedLabel,
}: ResumeViewerProps) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [zoom, setZoom] = useState(MIN_ZOOM);

  useEffect(() => {
    function onFullscreenChange() {
      setFullscreen(isFullscreenElement(stageRef.current));
    }
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || !pdfSrc) {
      return;
    }

    function onWheel(event: WheelEvent) {
      if (event.shiftKey) {
        return;
      }
      event.preventDefault();
      const direction = event.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
      setZoom((value) => clampZoom(value + direction));
    }

    stage.addEventListener("wheel", onWheel, { passive: false });
    return () => stage.removeEventListener("wheel", onWheel);
  }, [pdfSrc]);

  const toggleFullscreen = useCallback(async () => {
    const stage = stageRef.current;
    if (!stage) {
      return;
    }

    try {
      if (isFullscreenElement(stage)) {
        await document.exitFullscreen();
        return;
      }
      await stage.requestFullscreen();
    } catch {
      // Browser blocked fullscreen.
    }
  }, []);

  const zoomIn = useCallback(() => {
    setZoom((value) => clampZoom(value + ZOOM_STEP));
  }, []);

  const zoomOut = useCallback(() => {
    setZoom((value) => clampZoom(value - ZOOM_STEP));
  }, []);

  const onDownload = useCallback(() => {
    if (!pdfDownloadUrl) {
      return;
    }
    const anchor = document.createElement("a");
    anchor.href = pdfDownloadUrl;
    anchor.download = downloadFilename;
    anchor.rel = "noopener";
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
  }, [downloadFilename, pdfDownloadUrl]);

  const canDownload = Boolean(pdfDownloadUrl);
  const canView = Boolean(pdfSrc);
  const embedSrc = pdfSrc
    ? `${pdfSrc}#toolbar=0&navpanes=0&scrollbar=0&view=FitH&zoom=${Math.round(zoom * 100)}`
    : undefined;

  return (
    <div className="resume__viewer">
      <div className="resume__meta">
        <p className="resume__meta-label">
          Resume
          {updatedLabel ? ` - Last updated ${updatedLabel}` : null}
        </p>
      </div>

      <div
        ref={stageRef}
        className={[
          "resume__stage",
          fullscreen ? "resume__stage--fullscreen" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {canView && embedSrc ? (
          <>
            <iframe
              key={embedSrc}
              className="resume__embed"
              title="Christie Yu resume"
              src={embedSrc}
            />

            <div
              className="resume__chrome"
              role="toolbar"
              aria-label="Resume controls"
            >
              <button
                type="button"
                className="resume__chrome-btn"
                onClick={onDownload}
                disabled={!canDownload}
              >
                Download
              </button>
              <div className="resume__chrome-zoom">
                <button
                  type="button"
                  className="resume__chrome-btn resume__chrome-btn--icon"
                  onClick={zoomOut}
                  disabled={zoom <= MIN_ZOOM}
                  aria-label="Zoom out"
                >
                  −
                </button>
                <span className="resume__chrome-zoom-label">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  type="button"
                  className="resume__chrome-btn resume__chrome-btn--icon"
                  onClick={zoomIn}
                  disabled={zoom >= MAX_ZOOM}
                  aria-label="Zoom in"
                >
                  +
                </button>
              </div>
              <button
                type="button"
                className="resume__chrome-btn"
                onClick={() => {
                  void toggleFullscreen();
                }}
              >
                {fullscreen ? "Exit" : "Fullscreen"}
              </button>
            </div>
          </>
        ) : (
          <div className="resume__empty">
            <p className="resume__empty-title">Resume PDF not found</p>
            <p className="resume__empty-copy">
              Set <code>FIGMA_ACCESS_TOKEN</code> to export from Figma (which also
              saves a fallback PDF), or drop{" "}
              <code>public/resume/Christie-Yu-Resume.pdf</code>, then refresh.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
