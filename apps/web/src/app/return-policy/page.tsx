import { CmsMarkdownPage, generateCmsPageMetadata } from "@/components/cms-markdown-page";

export async function generateMetadata() {
  return generateCmsPageMetadata({
    slug: "return-policy",
    description: "Ticket return and refund policy.",
  });
}

export default function ReturnPolicyPage() {
  return <CmsMarkdownPage slug="return-policy" pageClass="home-page policy-page return-policy-page" />;
}
