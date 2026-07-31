export const cloudinaryAssetProjection = `{
  "publicId": publicId,
  alt,
  caption,
  width,
  height
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
