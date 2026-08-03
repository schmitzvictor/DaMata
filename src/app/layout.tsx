import type { Metadata } from "next";
import { Bebas_Neue, Playfair_Display, Lora, Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart/cart-context";
import { getCategories } from "@/lib/queries/products";
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const categories = await getCategories();

  return (
    <html
      lang="pt-BR"
      className={`${fontDisplay.variable} ${fontEditorial.variable} ${fontBody.variable} ${fontUi.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-body bg-creme text-escuro">
        <CartProvider>
          <PromoBar />
          <SiteHeader categories={categories} />
          <main className="flex-1">{children}</main>
          <SiteFooter />
          <WhatsAppButton />
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
