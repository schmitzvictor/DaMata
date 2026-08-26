"use client";

const SESSION_KEY = "damata_session_id";

function getSessionId(): string {
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

type TrackPayload = {
  type: "pageview" | "session_start" | "click" | "product_view";
  path?: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  label?: string;
  productId?: number;
};

// Fire-and-forget por design, mesmo espírito do resto da integração —
// analytics nunca pode quebrar ou atrasar a navegação/ação do usuário.
export function trackEvent(payload: TrackPayload): void {
  if (typeof window === "undefined") return;
  try {
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, sessionId: getSessionId() }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // localStorage/fetch indisponível (modo privado restrito etc.) — ignora.
  }
}
