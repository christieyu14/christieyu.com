"use client";

import type { PhotoAlbumPhoto } from "@/types/content";

export interface PhotoLightboxProps {
  photos: PhotoAlbumPhoto[];
  activeIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

/**
 * Typed architecture placeholder for a future accessible dialog lightbox.
 * Final visual design and interaction will follow Figma specs.
 */
export function PhotoLightbox({
  photos,
  activeIndex,
  isOpen,
  onClose,
  onNavigate,
}: PhotoLightboxProps) {
  if (!isOpen) {
    return null;
  }

  const activePhoto = photos[activeIndex];

  return (
    <div role="dialog" aria-modal="true" aria-label="Photo lightbox" hidden={!isOpen}>
      <button type="button" onClick={onClose}>
        Close
      </button>
      {activePhoto ? (
        <figure>
          <figcaption>{activePhoto.caption ?? activePhoto.publicId}</figcaption>
        </figure>
      ) : null}
      <button
        type="button"
        onClick={() => onNavigate(Math.max(0, activeIndex - 1))}
        disabled={activeIndex <= 0}
      >
        Previous
      </button>
      <button
        type="button"
        onClick={() => onNavigate(Math.min(photos.length - 1, activeIndex + 1))}
        disabled={activeIndex >= photos.length - 1}
      >
        Next
      </button>
    </div>
  );
}
