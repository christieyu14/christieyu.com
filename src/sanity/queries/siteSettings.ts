import { cloudinaryAssetProjection } from "./projections";

export const siteSettingsQuery = `*[_type == "siteSettings"][0]{
  siteTitle,
  siteDescription,
  defaultSeoTitle,
  defaultSeoDescription,
  navigation[]{ label, href },
  socialLinks[]{ platform, url, label },
  contactEmail,
  "resumeAsset": resumeAsset ${cloudinaryAssetProjection},
  defaultOgImage
}`;
