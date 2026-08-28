"use client";

import { useEffect, useState } from "react";

export function PromoBar({ messages }: { messages: string[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (messages.length <= 1) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % messages.length);
    }, 5000);
    return () => clearInterval(id);
  }, [messages.length]);

  if (messages.length === 0) return null;

  return (
    <div className="flex items-center justify-center gap-3.5 bg-verde-folha px-6 py-2.5 text-center font-ui text-[12.5px] font-medium tracking-wide text-creme">
      <span className="text-[9px] text-verde-claro">◆</span>
      <span>{messages[index % messages.length]}</span>
      <span className="text-[9px] text-verde-claro">◆</span>
    </div>
  );
}
