import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "verde-mata": "#2D5016",
        "verde-folha": "#4A7C2F",
        "verde-vivo": "#6BAF3C",
        "verde-claro": "#A8D96B",
        terra: "#8B4513",
        sol: "#E8C547",
        creme: "#F5F0E8",
        escuro: "#1B1B16",
      },
      // Brand fonts (font-display/editorial/body/ui) are wired as CSS vars
      // in src/app/globals.css `@theme inline` — Tailwind v4 generates the
      // matching font-* utilities from `--font-*` theme keys automatically.
    },
  },
} satisfies Config;
