import type { NextConfig } from "next";

function cmsRemotePatterns() {
  const patterns: NonNullable<NextConfig["images"]>["remotePatterns"] = [];

  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4100";
  try {
    const parsed = new URL(apiUrl);
    patterns.push({
      protocol: parsed.protocol.replace(":", "") as "http" | "https",
      hostname: parsed.hostname,
      ...(parsed.port ? { port: parsed.port } : {}),
      pathname: "/api/v1/cms/assets/**",
    });
  } catch {
    patterns.push({
      protocol: "http" as const,
      hostname: "localhost",
      port: "4100",
      pathname: "/api/v1/cms/assets/**",
    });
  }

  const cloudinaryHost =
    process.env.NEXT_PUBLIC_CLOUDINARY_HOSTNAME?.trim() || "res.cloudinary.com";
  patterns.push({
    protocol: "https",
    hostname: cloudinaryHost,
    pathname: "/**",
  });

  patterns.push({
    protocol: "https",
    hostname: "lh3.googleusercontent.com",
    pathname: "/**",
  });

  return patterns;
}

const nextConfig: NextConfig = {
  transpilePackages: ["@repo/shared"],
  images: {
    remotePatterns: cmsRemotePatterns(),
  },
};

export default nextConfig;
