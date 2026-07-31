import { defineField, defineType } from "sanity";

export const cloudinaryAsset = defineType({
  name: "cloudinaryAsset",
  title: "Cloudinary Asset",
  type: "object",
  fields: [
    defineField({
      name: "publicId",
      title: "Public ID",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "alt", title: "Alt Text", type: "string" }),
    defineField({ name: "caption", title: "Caption", type: "string" }),
    defineField({ name: "width", title: "Width", type: "number" }),
    defineField({ name: "height", title: "Height", type: "number" }),
  ],
});
