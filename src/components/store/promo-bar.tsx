"use client";

import { useEffect, useState } from "react";

const PROMOS = [
  "Frete grátis acima de R$ 299 para todo o Brasil",
  "Até 6x sem juros — ou 5% off no PIX",
  "Cupom MATA10: 10% na primeira compra",
];

export function PromoBar() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % PROMOS.length);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex items-center justify-center gap-3.5 bg-verde-mata px-6 py-2.5 text-center font-ui text-[12.5px] font-medium tracking-wide text-creme">
      <span className="text-[9px] text-verde-claro">◆</span>
      <span>{PROMOS[index]}</span>
      <span className="text-[9px] text-verde-claro">◆</span>
    </div>
  );
}
