import {
  cmsPublicPageDtoSchema,
  cmsSiteBundleDtoSchema,
  type CmsPageSlug,
  type CmsPublicPageDto,
  type CmsSiteBundleDto,
} from "@repo/shared";
import { getApiBaseUrl } from "./cms-client";
import { DEFAULT_CMS_SITE_BUNDLE } from "./cms-defaults";
import { resolveRequestTenantSlug } from "./resolve-request-tenant-slug";

function cmsFetchHeaders(tenantSlug: string | null): HeadersInit {
  if (!tenantSlug) return {};
  return { "x-tenant-slug": tenantSlug };
}

export async function fetchCmsSiteBundle(
  tenantSlug?: string | null,
): Promise<CmsSiteBundleDto> {
  const slug = tenantSlug ?? (await resolveRequestTenantSlug());
  if (!slug) return DEFAULT_CMS_SITE_BUNDLE;

  try {
    const res = await fetch(`${getApiBaseUrl()}/api/v1/cms/site`, {
      next: { revalidate: 60 },
      headers: cmsFetchHeaders(slug),
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
  tenantSlug?: string | null,
): Promise<CmsPublicPageDto | null> {
  const tenant = tenantSlug ?? (await resolveRequestTenantSlug());
  if (!tenant) return null;

  try {
    const res = await fetch(`${getApiBaseUrl()}/api/v1/cms/pages/${slug}`, {
      next: { revalidate: 60 },
      headers: cmsFetchHeaders(tenant),
    });
    if (res.status === 404) return null;
    if (!res.ok) return null;
    const json = await res.json();
    return cmsPublicPageDtoSchema.parse(json.data);
  } catch {
    return null;
  }
}
