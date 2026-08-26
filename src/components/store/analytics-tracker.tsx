"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackEvent } from "@/lib/analytics/track";

const LANDED_KEY = "damata_landed";

// Monta uma vez no layout raiz. Duas responsabilidades:
// 1. Dispara "pageview" a cada troca de rota — na primeira da sessão, junto
//    com referrer/UTM (de onde o usuário veio), pra não confundir "veio de
//    outro site" com "clicou num link interno" nas trocas seguintes.
// 2. Delega clique em qualquer elemento com atributo data-track="algo" —
//    evita instrumentar botão por botão com onClick.
export function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const isFirstTouch = !sessionStorage.getItem(LANDED_KEY);
    if (isFirstTouch) {
      sessionStorage.setItem(LANDED_KEY, "1");
      const params = new URLSearchParams(window.location.search);
      trackEvent({
        type: "session_start",
        path: pathname,
        referrer: document.referrer || undefined,
        utmSource: params.get("utm_source") ?? undefined,
        utmMedium: params.get("utm_medium") ?? undefined,
        utmCampaign: params.get("utm_campaign") ?? undefined,
      });
    }
    trackEvent({ type: "pageview", path: pathname });
  }, [pathname]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      const target = (e.target as HTMLElement | null)?.closest<HTMLElement>("[data-track]");
      if (!target) return;
      trackEvent({
        type: "click",
        path: window.location.pathname,
        label: target.dataset.track,
      });
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
