import { cache } from "react";
import { prisma } from "@/lib/prisma";

export type ContentField = {
  key: string;
  label: string;
  type: "text" | "textarea";
  fallback: string;
};

export const CONTENT_SECTIONS: { title: string; fields: ContentField[] }[] = [
  {
    title: "Barra de promoções (topo)",
    fields: [
      {
        key: "promo.messages",
        label: "Mensagens (uma por linha — alternam a cada 5s)",
        type: "textarea",
        fallback: [
          "Frete grátis acima de R$ 299 para todo o Brasil",
          "Até 6x sem juros — ou 5% off no PIX",
          "Cupom MATA10: 10% na primeira compra",
        ].join("\n"),
      },
    ],
  },
  {
    title: "Busca (cabeçalho)",
    fields: [
      {
        key: "header.searchPlaceholder",
        label: "Texto de exemplo no campo de busca",
        type: "text",
        fallback: "Busque por estampa, coleção ou trilha",
      },
    ],
  },
  {
    title: "Página inicial — Topo (hero)",
    fields: [
      {
        key: "home.hero.eyebrow",
        label: "Selo acima do título",
        type: "text",
        fallback: "Coleção Trilha Cerrada · inverno",
      },
      { key: "home.hero.heading", label: "Título principal", type: "text", fallback: "FEITO À MÃO, NA MATA." },
      {
        key: "home.hero.subtext",
        label: "Texto de apoio",
        type: "textarea",
        fallback:
          "Estampa chapada, tinta na tela, uma peça por vez. Roupa para quem sobe a serra antes do sol nascer.",
      },
      { key: "home.hero.cta", label: "Texto do botão", type: "text", fallback: "VER A COLEÇÃO" },
    ],
  },
  {
    title: "Página inicial — Vantagens (4 itens)",
    fields: [
      {
        key: "home.perks",
        label: "Uma por linha, formato: título | subtítulo",
        type: "textarea",
        fallback: [
          "Frete grátis | acima de R$ 299",
          "5% off no PIX | aprovação na hora",
          "Até 6x sem juros | todos os cartões",
          "Troca grátis | 30 dias, sem stress",
        ].join("\n"),
      },
    ],
  },
  {
    title: "Página inicial — Mais Vendidos",
    fields: [{ key: "home.bestsellers.heading", label: "Título da seção", type: "text", fallback: "MAIS VENDIDOS" }],
  },
  {
    title: "Página inicial — Lançamentos",
    fields: [
      { key: "home.launches.heading", label: "Título da seção", type: "text", fallback: "LANÇAMENTOS" },
      {
        key: "home.launches.subtext",
        label: "Texto de apoio",
        type: "text",
        fallback: "saíram da tela esta semana",
      },
    ],
  },
  {
    title: "Página inicial — O Processo",
    fields: [
      { key: "home.process.eyebrow", label: "Selo acima do título", type: "text", fallback: "O processo" },
      { key: "home.process.heading", label: "Título", type: "text", fallback: "Não é sublimação. É chapado." },
      {
        key: "home.process.paragraph",
        label: "Parágrafo",
        type: "textarea",
        fallback:
          "Cada estampa nasce de uma tela revelada à mão. A tinta é puxada no rodo, camada por camada, e curada no calor até virar parte do tecido — não um adesivo por cima dele.",
      },
      {
        key: "home.process.quote",
        label: "Citação em destaque",
        type: "text",
        fallback: "Você vai sentir a diferença no toque.",
      },
      {
        key: "home.process.stats",
        label: "Estatísticas (uma por linha, formato: número | texto)",
        type: "textarea",
        fallback: ["7 | anos de ateliê", "100% | tinta base água", "1x1 | peça por peça"].join("\n"),
      },
    ],
  },
  {
    title: "Página inicial — Para times e coletivos (B2B)",
    fields: [
      {
        key: "home.b2b.eyebrow",
        label: "Selo acima do título",
        type: "text",
        fallback: "Para times e coletivos",
      },
      { key: "home.b2b.heading", label: "Título", type: "text", fallback: "SEU TIME, SUA MARCA" },
      {
        key: "home.b2b.paragraph",
        label: "Parágrafo",
        type: "textarea",
        fallback:
          "Seu time já tem o visual? A trilha começa com a estampa certa. Orçamento em 24h pelo WhatsApp, a partir de 20 peças.",
      },
      { key: "home.b2b.cta", label: "Texto do botão", type: "text", fallback: "PEDIR ORÇAMENTO" },
    ],
  },
  {
    title: "Página inicial — Do Ateliê",
    fields: [{ key: "home.editorial.heading", label: "Título da seção", type: "text", fallback: "Do ateliê" }],
  },
];

export const ALL_CONTENT_FIELDS = CONTENT_SECTIONS.flatMap((s) => s.fields);

const FALLBACK_BY_KEY = new Map(ALL_CONTENT_FIELDS.map((f) => [f.key, f.fallback]));

// cache() dedupes this across every component that calls it within the same
// request — one query per page render, not one per component.
export const getSiteContent = cache(async (): Promise<Record<string, string>> => {
  const rows = await prisma.siteContent.findMany();
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
});

export function getContentValue(map: Record<string, string>, key: string): string {
  const value = map[key];
  if (value && value.trim() !== "") return value;
  return FALLBACK_BY_KEY.get(key) ?? "";
}

// Parseia campos "uma linha por item, formato: a | b" (perks, estatísticas).
export function parsePairs(text: string): [string, string][] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [a, b] = line.split("|").map((part) => part.trim());
      return [a ?? "", b ?? ""];
    });
}
