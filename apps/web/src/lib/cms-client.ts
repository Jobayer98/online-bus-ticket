import {
  cmsPublicPageDtoSchema,
  cmsSiteBundleDtoSchema,
  type CmsPageSlug,
  type CmsPublicPageDto,
  type CmsSiteBundleDto,
} from "@repo/shared";
import { DEFAULT_CMS_SITE_BUNDLE } from "./cms-defaults";

export function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
}

/** Resolve CMS asset or static web path to a fetchable URL. */
export function resolveCmsAssetUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith("/api/")) {
    return `${getApiBaseUrl()}${url}`;
  }
  return url;
}

export async function fetchCmsSiteBundle(): Promise<CmsSiteBundleDto> {
  try {
    const res = await fetch(`${getApiBaseUrl()}/api/v1/cms/site`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return DEFAULT_CMS_SITE_BUNDLE;
    const json = await res.json();
    return cmsSiteBundleDtoSchema.parse(json.data);
  } catch {
    return DEFAULT_CMS_SITE_BUNDLE;
  }
}

export async function fetchCmsPage(
  slug: CmsPageSlug,
): Promise<CmsPublicPageDto | null> {
  try {
    const res = await fetch(`${getApiBaseUrl()}/api/v1/cms/pages/${slug}`, {
      next: { revalidate: 60 },
    });
    if (res.status === 404) return null;
    if (!res.ok) return null;
    const json = await res.json();
    return cmsPublicPageDtoSchema.parse(json.data);
  } catch {
    return null;
  }
}
