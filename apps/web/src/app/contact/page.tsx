import { CmsMarkdownPage, generateCmsPageMetadata } from "@/components/cms-markdown-page";

export async function generateMetadata() {
  return generateCmsPageMetadata({
    slug: "contact",
    description: "Contact information and support.",
  });
}

export default function ContactPage() {
  return <CmsMarkdownPage slug="contact" />;
}
