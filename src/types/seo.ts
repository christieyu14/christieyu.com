export interface SeoFields {
  seoTitle?: string;
  seoDescription?: string;
  ogImage?: string;
}

export interface PageMetadataInput {
  title?: string;
  description?: string;
  path?: string;
  ogImage?: string;
  noIndex?: boolean;
}

export interface ResolvedMetadata {
  title: string;
  description: string;
  canonicalUrl: string;
  ogImage?: string;
  noIndex: boolean;
}
