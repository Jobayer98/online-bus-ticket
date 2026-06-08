import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { CmsPageSlug } from "@repo/shared";
import { HomeHeader } from "@/components/home-header";
import { SiteFooter } from "@/components/site-footer";
import { fetchCmsPage, fetchCmsSiteBundle } from "@/lib/cms-server";
import { renderCmsMarkdown } from "@/lib/cms-markdown";

type LayoutVariant = "policy" | "about";

type Props = {
  slug: CmsPageSlug;
  layout?: LayoutVariant;
  pageClass?: string;
  description?: string;
};

const markdownBodyClass =
  "[&_p]:mb-4 [&_p:last-child]:mb-0 [&_h2]:mt-6 [&_h2]:mb-3 [&_h2]:font-semibold [&_h2]:text-[#111] [&_h2:first-child]:mt-0 [&_h3]:mt-6 [&_h3]:mb-3 [&_h3]:font-semibold [&_h3]:text-[#111] [&_h3:first-child]:mt-0 [&_ul]:mb-4 [&_ul]:pl-6 [&_ol]:mb-4 [&_ol]:pl-6 [&_li]:mb-1.5 [&_a]:text-[var(--primary)] [&_strong]:font-semibold";

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
  const pageShellClass =
    pageClass ??
    (layout === "about"
      ? "m-0 flex min-h-screen flex-col bg-white p-0"
      : "m-0 flex min-h-screen flex-col bg-white p-0");

  if (layout === "about") {
    return (
      <div className={pageShellClass}>
        <HomeHeader />
        <section className="bg-[var(--primary-hover)] px-6 py-9 text-center text-white max-[560px]:px-4 max-[560px]:py-7">
          <h1 className="m-0 text-[1.75rem] font-bold tracking-wide max-[560px]:text-[1.4rem]">
            {page.title}
          </h1>
        </section>
        <article
          className={`mx-auto max-w-[820px] px-6 py-10 text-base leading-7 text-[#333] max-[560px]:px-4 max-[560px]:py-8 ${markdownBodyClass}`}
          dangerouslySetInnerHTML={{ __html: html }}
        />
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className={pageShellClass}>
      <HomeHeader />
      <main className="mx-auto max-w-[1000px] flex-1 px-6 pt-11 max-[560px]:px-4 max-[560px]:pt-8">
        <h1 className="mb-10 text-center text-[2rem] font-normal tracking-wide text-[#111] max-[560px]:mb-8 max-[560px]:text-[1.6rem]">
          {page.title}
        </h1>
        <article
          className={`pl-10 text-base leading-7 text-[#222] max-[560px]:pl-2 ${markdownBodyClass}`}
          dangerouslySetInnerHTML={{ __html: html }}
        />
        <hr className="mt-14 border-0 border-t border-[#d8d8d8]" />
      </main>
      <SiteFooter />
    </div>
  );
}
