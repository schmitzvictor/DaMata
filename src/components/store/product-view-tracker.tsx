"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics/track";

export function ProductViewTracker({ productId }: { productId: number }) {
  useEffect(() => {
    trackEvent({ type: "product_view", productId, path: window.location.pathname });
  }, [productId]);

  return null;
}
