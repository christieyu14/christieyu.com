export interface ProjectPreviewData {
  id: string;
  title: string;
  client: string;
  dateLabel: string;
  summary: string;
  href?: string;
}

const MOCK_SUMMARY =
  "Vorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis.";

/** Four mocks for the diagonal 2×4 homepage project stage. */
export const MOCK_PROJECT_PREVIEWS: ProjectPreviewData[] = Array.from(
  { length: 4 },
  (_, index) => ({
    id: `project-${index + 1}`,
    title: "Project title goes here consectetur adipiscing elit.",
    client: "Lenovo (Remote)",
    dateLabel: "06.2025",
    summary: MOCK_SUMMARY,
    href: "/work",
  }),
);
