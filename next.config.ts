import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

// Imagens de produto/banner vêm do bucket público do R2 (ver src/lib/r2.ts);
// só a origem entra no CSP, sem expor o resto da URL assinada/config.
function r2Origin(): string | null {
  if (!process.env.R2_PUBLIC_URL) return null;
  try {
    return new URL(process.env.R2_PUBLIC_URL).origin;
  } catch {
    return null;
  }
}

const imgSrc = ["'self'", "blob:", "data:", r2Origin()].filter(Boolean).join(" ");

// Sem nonce (ver node_modules/next/dist/docs/.../content-security-policy.md,
// seção "Without Nonces") — script/style precisam de 'unsafe-inline' pro
// bootstrap inline do Next e pros estilos inline do Radix/shadcn; ainda
// bloqueia injeção de <script src> e <iframe> de origem externa, que é o
// vetor mais comum de XSS/clickjacking.
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""};
  style-src 'self' 'unsafe-inline';
  img-src ${imgSrc};
  font-src 'self';
  connect-src 'self';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`
  .replace(/\s{2,}/g, " ")
  .trim();

const nextConfig: NextConfig = {
  output: "standalone",
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Content-Security-Policy", value: cspHeader },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
