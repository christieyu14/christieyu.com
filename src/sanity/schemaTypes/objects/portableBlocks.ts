import { defineArrayMember, defineField, defineType } from "sanity";

export const imageGalleryBlock = defineType({
  name: "imageGallery",
  title: "Image Gallery",
  type: "object",
  fields: [
    defineField({
      name: "images",
      title: "Images",
      type: "array",
      of: [{ type: "cloudinaryAsset" }],
    }),
    defineField({ name: "caption", title: "Caption", type: "string" }),
  ],
});

export const singleMediaBlock = defineType({
  name: "singleMedia",
  title: "Single Media",
  type: "object",
  fields: [
    defineField({
      name: "media",
      title: "Media",
      type: "cloudinaryAsset",
    }),
  ],
});

export const cloudinaryAlbumRefBlock = defineType({
  name: "cloudinaryAlbumRef",
  title: "Photo Album Reference",
  type: "object",
  fields: [
    defineField({
      name: "album",
      title: "Album",
      type: "reference",
      to: [{ type: "photoAlbum" }],
    }),
  ],
});

export const pullQuoteBlock = defineType({
  name: "pullQuote",
  title: "Pull Quote",
  type: "object",
  fields: [
    defineField({
      name: "quote",
      title: "Quote",
      type: "text",
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "attribution", title: "Attribution", type: "string" }),
  ],
});

export const projectFactsBlock = defineType({
  name: "projectFacts",
  title: "Project Facts",
  type: "object",
  fields: [
    defineField({
      name: "facts",
      title: "Facts",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({ name: "label", title: "Label", type: "string" }),
            defineField({ name: "value", title: "Value", type: "string" }),
          ],
        }),
      ],
    }),
  ],
});

export const projectMetricsBlock = defineType({
  name: "projectMetrics",
  title: "Project Metrics",
  type: "object",
  fields: [
    defineField({
      name: "metrics",
      title: "Metrics",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({ name: "label", title: "Label", type: "string" }),
            defineField({ name: "value", title: "Value", type: "string" }),
          ],
        }),
      ],
    }),
  ],
});

export const prototypeEmbedBlock = defineType({
  name: "prototypeEmbed",
  title: "Prototype Embed",
  type: "object",
  fields: [
    defineField({
      name: "url",
      title: "Embed URL",
      type: "url",
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "title", title: "Title", type: "string" }),
    defineField({
      name: "aspectRatio",
      title: "Aspect Ratio",
      type: "number",
    }),
  ],
});

export const twoColumnEditorialBlock = defineType({
  name: "twoColumnEditorial",
  title: "Two Column Editorial",
  type: "object",
  fields: [
    defineField({
      name: "left",
      title: "Left Column",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "right",
      title: "Right Column",
      type: "array",
      of: [{ type: "block" }],
    }),
  ],
});

export const beforeAfterComparisonBlock = defineType({
  name: "beforeAfterComparison",
  title: "Before / After Comparison",
  type: "object",
  fields: [
    defineField({
      name: "before",
      title: "Before",
      type: "cloudinaryAsset",
    }),
    defineField({
      name: "after",
      title: "After",
      type: "cloudinaryAsset",
    }),
    defineField({ name: "caption", title: "Caption", type: "string" }),
  ],
});

export const portfolioBodyBlocks = [
  imageGalleryBlock,
  singleMediaBlock,
  cloudinaryAlbumRefBlock,
  pullQuoteBlock,
  projectFactsBlock,
  projectMetricsBlock,
  prototypeEmbedBlock,
  twoColumnEditorialBlock,
  beforeAfterComparisonBlock,
];
