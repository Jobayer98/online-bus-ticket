import { CmsMarkdownPage, generateCmsPageMetadata } from "@/components/cms-markdown-page";

export async function generateMetadata() {
  return generateCmsPageMetadata({
    slug: "privacy-policy",
    description: "Privacy policy for our website and booking services.",
  });
}

export default function PrivacyPolicyPage() {
  return <CmsMarkdownPage slug="privacy-policy" />;
}
