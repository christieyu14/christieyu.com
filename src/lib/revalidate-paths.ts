export type SanityDocumentType = "portfolioPost" | "photoAlbum" | "siteSettings";

export function getRevalidationPaths(
  documentType: SanityDocumentType,
  slug?: string,
): string[] {
  switch (documentType) {
    case "portfolioPost": {
      const paths = ["/", "/work"];
      if (slug) {
        paths.push(`/work/${slug}`);
      }
      return paths;
    }
    case "photoAlbum": {
      const paths = ["/", "/photos"];
      if (slug) {
        paths.push(`/photos/${slug}`);
      }
      return paths;
    }
    case "siteSettings":
      return ["/", "/work", "/photos", "/about", "/resume", "/contact"];
    default:
      return ["/"];
  }
}

export interface RevalidateWebhookPayload {
  _type?: string;
  slug?: { current?: string };
}

export function parseRevalidatePayload(
  body: unknown,
): { documentType: SanityDocumentType; slug?: string } | null {
  if (!body || typeof body !== "object") {
    return null;
  }

  const record = body as RevalidateWebhookPayload;
  const documentType = record._type;

  if (
    documentType !== "portfolioPost" &&
    documentType !== "photoAlbum" &&
    documentType !== "siteSettings"
  ) {
    return null;
  }

  return {
    documentType,
    slug: record.slug?.current,
  };
}

export function isValidRevalidateSecret(
  providedSecret: string | null,
  expectedSecret: string,
): boolean {
  return Boolean(providedSecret && expectedSecret && providedSecret === expectedSecret);
}
