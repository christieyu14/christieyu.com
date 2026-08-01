import { cloudinaryAssetProjection, coverMediaProjection } from "./projections";

export const photoAlbumsQuery = `*[_type == "photoAlbum"] | order(date desc){
  _id,
  title,
  "slug": slug.current,
  summary,
  date,
  dateRange,
  location,
  featured,
  ${coverMediaProjection}
}`;

export const photoAlbumBySlugQuery = `*[_type == "photoAlbum" && slug.current == $slug][0]{
  _id,
  title,
  "slug": slug.current,
  summary,
  date,
  dateRange,
  location,
  featured,
  ${coverMediaProjection},
  seoTitle,
  seoDescription,
  "photos": photos[] ${cloudinaryAssetProjection}
}`;

export const photoAlbumSlugsQuery = `*[_type == "photoAlbum" && defined(slug.current)]{
  "slug": slug.current
}`;
