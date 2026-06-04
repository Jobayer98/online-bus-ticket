import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { CmsPageSlug } from "@repo/shared";
import { HomeHeader } from "@/components/home-header";
import { SiteFooter } from "@/components/site-footer";
import { fetchCmsPage, fetchCmsSiteBundle } from "@/lib/cms-server";
import { renderCmsMarkdown } from "@/lib/cms-markdown";
import "../app/home.css";
import "../app/policy-page.css";
import "./cms-markdown.css";

type LayoutVariant = "policy" | "about";

type Props = {
  slug: CmsPageSlug;
  layout?: LayoutVariant;
  pageClass?: string;
  description?: string;
};

export async function generateCmsPageMetadata({
  slug,
  description,
}: Pick<Props, "slug" | "description">): Promise<Metadata> {
  const [page, bundle] = await Promise.all([
    fetchCmsPage(slug),
    fetchCmsSiteBundle(),
  ]);
  if (!page) {
    return { title: "Page Not Found" };
  }
  return {
    title: `${page.title} — ${bundle.profile.companyName}`,
    description: description ?? page.title,
  };
}

export async function CmsMarkdownPage({
  slug,
  layout = "policy",
  pageClass,
}: Props) {
  const page = await fetchCmsPage(slug);
  if (!page) notFound();

  const html = renderCmsMarkdown(page.bodyMarkdown);
  const rootClass =
    pageClass ??
    (layout === "about" ? "home-page about-page" : "home-page policy-page");

  if (layout === "about") {
    return (
      <div className={rootClass}>
        <HomeHeader />
        <section className="about-hero">
          <h1>{page.title}</h1>
        </section>
        <article
          className="about-content cms-markdown-body"
          dangerouslySetInnerHTML={{ __html: html }}
        />
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className={rootClass}>
      <HomeHeader />
      <main className="policy-main">
        <h1 className="policy-title">{page.title}</h1>
        <article
          className="cms-markdown-body policy-body policy-body--indented"
          dangerouslySetInnerHTML={{ __html: html }}
        />
        <hr className="policy-divider" />
      </main>
      <SiteFooter />
    </div>
  );
}
