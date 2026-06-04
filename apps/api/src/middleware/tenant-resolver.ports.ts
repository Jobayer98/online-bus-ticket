export interface ResolvedTenant {
  id: string;
  name: string;
  slug: string;
  subdomainPrefix: string;
  customDomain: string | null;
  planTier: string;
  planStatus: string;
}

export interface ITenantResolver {
  resolve(req: {
    headers: Record<string, string | string[] | undefined>;
  }): Promise<ResolvedTenant | null>;
}
