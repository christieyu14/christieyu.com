import { portfolioPost } from "./documents/portfolioPost";
import { photoAlbum } from "./documents/photoAlbum";
import { siteSettings } from "./documents/siteSettings";
import { cloudinaryAsset } from "./objects/cloudinaryAsset";
import { portfolioBodyBlocks } from "./objects/portableBlocks";
import { seoFields } from "./objects/seoFields";

export const schemaTypes = [
  portfolioPost,
  photoAlbum,
  siteSettings,
  cloudinaryAsset,
  seoFields,
  ...portfolioBodyBlocks,
];
