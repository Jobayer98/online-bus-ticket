import type { NextConfig } from "next";

function cmsRemotePatterns() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
  try {
    const parsed = new URL(apiUrl);
    return [
      {
        protocol: parsed.protocol.replace(":", "") as "http" | "https",
        hostname: parsed.hostname,
        ...(parsed.port ? { port: parsed.port } : {}),
        pathname: "/api/v1/cms/assets/**",
      },
    ];
  } catch {
    return [
      {
        protocol: "http" as const,
        hostname: "localhost",
        port: "4000",
        pathname: "/api/v1/cms/assets/**",
      },
    ];
  }
}

const nextConfig: NextConfig = {
  transpilePackages: ["@repo/shared"],
  images: {
    remotePatterns: cmsRemotePatterns(),
  },
};

export default nextConfig;
