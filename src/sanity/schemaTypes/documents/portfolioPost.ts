import { defineField, defineType } from "sanity";

export const portfolioPost = defineType({
  name: "portfolioPost",
  title: "Portfolio Post",
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
      name: "publishedAt",
      title: "Published At",
      type: "datetime",
    }),
    defineField({ name: "projectYear", title: "Project Year", type: "number" }),
    defineField({ name: "client", title: "Client", type: "string" }),
    defineField({ name: "role", title: "Role", type: "string" }),
    defineField({ name: "duration", title: "Duration", type: "string" }),
    defineField({
      name: "disciplines",
      title: "Disciplines",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "featured",
      title: "Featured",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "coverMedia",
      title: "Cover Media",
      type: "cloudinaryAsset",
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "array",
      of: [
        { type: "block" },
        { type: "imageGallery" },
        { type: "singleMedia" },
        { type: "cloudinaryAlbumRef" },
        { type: "pullQuote" },
        { type: "projectFacts" },
        { type: "projectMetrics" },
        { type: "prototypeEmbed" },
        { type: "twoColumnEditorial" },
        { type: "beforeAfterComparison" },
      ],
    }),
    defineField({
      name: "relatedProjects",
      title: "Related Projects",
      type: "array",
      of: [{ type: "reference", to: [{ type: "portfolioPost" }] }],
    }),
    defineField({ name: "seoTitle", title: "SEO Title", type: "string" }),
    defineField({
      name: "seoDescription",
      title: "SEO Description",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "ogImage",
      title: "Open Graph Image URL",
      type: "url",
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "client" },
  },
});
