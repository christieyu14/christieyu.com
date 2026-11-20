import { PortableText, type PortableTextComponents } from "@portabletext/react";
import type { PortableTextBlock } from "@portabletext/types";
import { MediaRenderer } from "@/components/media/MediaRenderer";
import { headingAnchorId, portableBlockPlainText } from "@/lib/portfolio-sections";
import { normalizeCloudinaryAsset } from "@/lib/media-normalize";

interface PortableBodyProps {
  value?: PortableTextBlock[];
}

interface CloudinaryAssetValue {
  _key?: string;
  publicId?: string;
  alt?: string;
  caption?: string;
  width?: number;
  height?: number;
  format?: string;
  asset?: {
    public_id?: string;
    width?: number;
    height?: number;
    format?: string;
    context?: { custom?: { alt?: string } };
  };
}

function renderCloudinary(asset: CloudinaryAssetValue | undefined, key?: string) {
  const media = normalizeCloudinaryAsset(asset);
  if (!media) {
    return null;
  }
  return <MediaRenderer key={key ?? media.publicId} media={media} />;
}

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p>{children}</p>,
    h2: ({ children, value }) => {
      const text = portableBlockPlainText(value as PortableTextBlock);
      return <h2 id={headingAnchorId(text)}>{children}</h2>;
    },
    h3: ({ children }) => <h3>{children}</h3>,
    caption: ({ children }) => <p className="project__caption">{children}</p>,
    blockquote: ({ children }) => <blockquote>{children}</blockquote>,
  },
  types: {
    imageGallery: ({ value }) => {
      const images = (value.images ?? []) as CloudinaryAssetValue[];
      const rendered = images
        .map((image) => renderCloudinary(image, image._key))
        .filter(Boolean);

      if (!rendered.length) {
        return null;
      }

      return (
        <figure className="project__gallery">
          <div className="project__row">{rendered}</div>
          {typeof value.caption === "string" && value.caption ? (
            <figcaption className="project__caption">{value.caption}</figcaption>
          ) : null}
        </figure>
      );
    },
    singleMedia: ({ value }) =>
      renderCloudinary(value.media as CloudinaryAssetValue | undefined),
    cloudinaryAlbumRef: () => null,
    pullQuote: ({ value }) => (
      <blockquote cite={value.attribution}>{value.quote}</blockquote>
    ),
    projectFacts: ({ value }) => (
      <dl>
        {value.facts?.map((fact: { _key?: string; label?: string; value?: string }) => (
          <div key={fact._key ?? fact.label}>
            <dt>{fact.label}</dt>
            <dd>{fact.value}</dd>
          </div>
        ))}
      </dl>
    ),
    projectMetrics: ({ value }) => (
      <dl>
        {value.metrics?.map(
          (metric: { _key?: string; label?: string; value?: string }) => (
            <div key={metric._key ?? metric.label}>
              <dt>{metric.label}</dt>
              <dd>{metric.value}</dd>
            </div>
          ),
        )}
      </dl>
    ),
    prototypeEmbed: ({ value }) => {
      if (typeof value.url !== "string" || !value.url) {
        return null;
      }

      const maxWidth =
        typeof value.maxWidth === "number" ? `${value.maxWidth}px` : "100%";
      const height = typeof value.height === "number" ? value.height : 600;

      return (
        <iframe
          className="project__embed"
          src={value.url}
          title={
            typeof value.title === "string" && value.title
              ? value.title
              : "Embedded content"
          }
          style={{ maxWidth, height }}
          loading="lazy"
          allowFullScreen
        />
      );
    },
    twoColumnEditorial: ({ value }) => (
      <section className="project__two-col">
        <div>
          <PortableText
            value={(value.left ?? []) as PortableTextBlock[]}
            components={components}
          />
        </div>
        <div>
          <PortableText
            value={(value.right ?? []) as PortableTextBlock[]}
            components={components}
          />
        </div>
      </section>
    ),
    beforeAfterComparison: ({ value }) => {
      const before = renderCloudinary(value.before as CloudinaryAssetValue | undefined);
      const after = renderCloudinary(value.after as CloudinaryAssetValue | undefined);
      if (!before && !after) {
        return null;
      }
      return (
        <figure className="project__gallery">
          <div className="project__row">
            {before}
            {after}
          </div>
          {typeof value.caption === "string" && value.caption ? (
            <figcaption className="project__caption">{value.caption}</figcaption>
          ) : null}
        </figure>
      );
    },
  },
};

export function PortableBody({ value }: PortableBodyProps) {
  if (!value?.length) {
    return null;
  }

  return <PortableText value={value} components={components} />;
}
