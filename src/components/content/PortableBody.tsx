import { PortableText, type PortableTextComponents } from "@portabletext/react";
import type { PortableTextBlock } from "@portabletext/types";

interface PortableBodyProps {
  value?: PortableTextBlock[];
}

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p>{children}</p>,
    h2: ({ children }) => <h2>{children}</h2>,
    h3: ({ children }) => <h3>{children}</h3>,
    blockquote: ({ children }) => <blockquote>{children}</blockquote>,
  },
  types: {
    imageGallery: ({ value }) => (
      <figure>
        <figcaption>{value.caption ?? "Image gallery"}</figcaption>
      </figure>
    ),
    singleMedia: () => <figure aria-label="Media block placeholder" />,
    cloudinaryAlbumRef: () => <aside aria-label="Album reference placeholder" />,
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
    prototypeEmbed: ({ value }) => (
      <figure aria-label={value.title ?? "Prototype embed"}>
        <figcaption>{value.title ?? value.url}</figcaption>
      </figure>
    ),
    twoColumnEditorial: () => <section aria-label="Two column editorial placeholder" />,
    beforeAfterComparison: ({ value }) => (
      <figure>
        <figcaption>{value.caption ?? "Before and after comparison"}</figcaption>
      </figure>
    ),
  },
};

export function PortableBody({ value }: PortableBodyProps) {
  if (!value?.length) {
    return null;
  }

  return <PortableText value={value} components={components} />;
}
