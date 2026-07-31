import { portfolioSummaryProjection } from "./projections";

export const featuredPortfolioPostsQuery = `*[_type == "portfolioPost" && featured == true] | order(publishedAt desc){
  ${portfolioSummaryProjection}
}`;

export const portfolioPostsQuery = `*[_type == "portfolioPost"] | order(publishedAt desc){
  ${portfolioSummaryProjection}
}`;

export const portfolioPostBySlugQuery = `*[_type == "portfolioPost" && slug.current == $slug][0]{
  ${portfolioSummaryProjection},
  duration,
  disciplines,
  body,
  seoTitle,
  seoDescription,
  ogImage,
  "relatedProjects": relatedProjects[]->{
    ${portfolioSummaryProjection}
  }
}`;

export const portfolioPostSlugsQuery = `*[_type == "portfolioPost" && defined(slug.current)]{
  "slug": slug.current
}`;
