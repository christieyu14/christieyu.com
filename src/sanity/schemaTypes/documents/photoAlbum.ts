import { defineArrayMember, defineField, defineType } from "sanity";

export const photoAlbum = defineType({
  name: "photoAlbum",
  title: "Photo Album",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "summary", title: "Summary", type: "text", rows: 3 }),
    defineField({
      name: "coverMedia",
      title: "Cover Media",
      type: "cloudinaryAsset",
    }),
    defineField({ name: "date", title: "Date", type: "date" }),
    defineField({
      name: "dateRange",
      title: "Date Range",
      type: "object",
      fields: [
        defineField({ name: "start", title: "Start", type: "date" }),
        defineField({ name: "end", title: "End", type: "date" }),
      ],
    }),
    defineField({ name: "location", title: "Location", type: "string" }),
    defineField({
      name: "photos",
      title: "Photos",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({
              name: "publicId",
              title: "Cloudinary Public ID",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({ name: "alt", title: "Alt Text", type: "string" }),
            defineField({ name: "caption", title: "Caption", type: "string" }),
            defineField({ name: "width", title: "Width", type: "number" }),
            defineField({ name: "height", title: "Height", type: "number" }),
          ],
          preview: {
            select: { title: "publicId", subtitle: "caption" },
          },
        }),
      ],
    }),
    defineField({
      name: "featured",
      title: "Featured",
      type: "boolean",
      initialValue: false,
    }),
    defineField({ name: "seoTitle", title: "SEO Title", type: "string" }),
    defineField({
      name: "seoDescription",
      title: "SEO Description",
      type: "text",
      rows: 3,
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "location" },
  },
});
