export interface ProjectPreviewData {
  id: string;
  title: string;
  client: string;
  dateLabel: string;
  summary: string;
  href?: string;
}

export const MOCK_PROJECT_PREVIEWS: ProjectPreviewData[] = [
  {
    id: "project-1",
    title: "Project title goes here consectetur adipiscing elit.",
    client: "Lenovo (Remote)",
    dateLabel: "06.2025",
    summary:
      "Vorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.",
    href: "/work",
  },
  {
    id: "project-2",
    title: "Project title goes here consectetur adipiscing elit.",
    client: "Lenovo (Remote)",
    dateLabel: "06.2025",
    summary:
      "Vorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.",
    href: "/work",
  },
  {
    id: "project-3",
    title: "Project title goes here consectetur adipiscing elit.",
    client: "Lenovo (Remote)",
    dateLabel: "06.2025",
    summary:
      "Vorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.",
    href: "/work",
  },
];
