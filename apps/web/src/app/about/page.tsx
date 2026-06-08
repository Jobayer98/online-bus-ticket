import { CmsMarkdownPage, generateCmsPageMetadata } from "@/components/cms-markdown-page";

export async function generateMetadata() {
  return generateCmsPageMetadata({
    slug: "about",
    description:
      "Learn about our bus travel company — safe, comfortable travel across Bangladesh.",
  });
}

export default function AboutPage() {
  return <CmsMarkdownPage slug="about" layout="about" />;
}
