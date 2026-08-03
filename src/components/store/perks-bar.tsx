const PERKS = [
  { icon: "▲", title: "Frete grátis", sub: "acima de R$ 299" },
  { icon: "◈", title: "5% off no PIX", sub: "aprovação na hora" },
  { icon: "⬒", title: "Até 6x sem juros", sub: "todos os cartões" },
  { icon: "⟳", title: "Troca grátis", sub: "30 dias, sem stress" },
];

export function PerksBar() {
  return (
    <section className="bg-escuro px-8 py-6">
      <div className="mx-auto grid max-w-[1400px] grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-7">
        {PERKS.map((p) => (
          <div key={p.title} className="flex items-center gap-3.5">
            <span className="w-[26px] text-center text-xl text-verde-claro">
              {p.icon}
            </span>
            <div className="flex flex-col">
              <span className="font-ui text-[12.5px] font-bold uppercase tracking-wide text-creme">
                {p.title}
              </span>
              <span className="font-ui text-[11.5px] text-creme/60">
                {p.sub}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
