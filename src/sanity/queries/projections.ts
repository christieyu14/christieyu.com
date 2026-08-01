export const cloudinaryAssetProjection = `{
  "publicId": coalesce(asset.public_id, publicId),
  "alt": coalesce(alt, asset.context.custom.alt),
  caption,
  "width": coalesce(asset.width, width),
  "height": coalesce(asset.height, height),
  "resourceType": asset.resource_type,
  "format": asset.format,
  "version": asset.version,
  "derived": asset.derived
}`;

export const coverMediaProjection = `"coverMedia": coverMedia ${cloudinaryAssetProjection}`;

export const portfolioSummaryProjection = `
  _id,
  title,
  "slug": slug.current,
  summary,
  publishedAt,
  projectYear,
  client,
  role,
  featured,
  ${coverMediaProjection}
`;
