import type { Metadata } from "next";
import { Bebas_Neue, Playfair_Display, Lora, Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart/cart-context";
import { getCategories } from "@/lib/queries/products";
import { getContentValue, getSiteContent } from "@/lib/site-content";
import { PromoBar } from "@/components/store/promo-bar";
import { SiteHeader } from "@/components/store/site-header";
import { SiteFooter } from "@/components/store/site-footer";
import { WhatsAppButton } from "@/components/store/whatsapp-button";
import { CartDrawer } from "@/components/store/cart-drawer";

// font-display — Bebas Neue: headlines, all-caps display type
const fontDisplay = Bebas_Neue({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
});

// font-editorial — Playfair Display: pull quotes, section intros
const fontEditorial = Playfair_Display({
  variable: "--font-editorial",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

// font-body — Lora: long-form reading copy
const fontBody = Lora({
  variable: "--font-body",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

// font-ui — Inter: UI chrome, buttons, forms
const fontUi = Inter({
  variable: "--font-ui",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Da Mata Grow",
  description: "Moda outdoor com serigrafia artesanal.",
};

// Todo o app depende de estoque/preço/categoria vindos do sync do ERP —
// prerender estático serviria dado velho pro cliente. Também evita que
// `next build` tente conectar no banco (não há um alcançável nesse momento
// do Docker build).
export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [categories, content] = await Promise.all([
    getCategories(),
    getSiteContent(),
  ]);
  const promoMessages = getContentValue(content, "promo.messages")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const searchPlaceholder = getContentValue(content, "header.searchPlaceholder");

  return (
    <html
      lang="pt-BR"
      className={`${fontDisplay.variable} ${fontEditorial.variable} ${fontBody.variable} ${fontUi.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-body bg-creme text-escuro">
        <CartProvider>
          <PromoBar messages={promoMessages} />
          <SiteHeader categories={categories} searchPlaceholder={searchPlaceholder} />
          <main className="flex-1">{children}</main>
          <SiteFooter />
          <WhatsAppButton />
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
