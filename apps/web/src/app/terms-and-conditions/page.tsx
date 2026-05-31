import { CmsMarkdownPage, generateCmsPageMetadata } from "@/components/cms-markdown-page";

export async function generateMetadata() {
  return generateCmsPageMetadata({
    slug: "terms-and-conditions",
    description: "Terms and conditions for using our website and services.",
  });
}

export default function TermsAndConditionsPage() {
  return <CmsMarkdownPage slug="terms-and-conditions" />;
}
