import type { Metadata } from "next";
import { Reveal } from "@/components/store/reveal";

export const metadata: Metadata = {
  title: "Serigrafia artesanal | Da Mata",
  description:
    "Como imprimimos: gravação da tela, tintas à base d'água e impressão manual peça por peça, em tiragens pequenas.",
};

const steps = [
  {
    n: "01",
    title: "Desenho e fotolito",
    text: "Cada estampa começa em desenho de observação — folhas, galhos e sombras coletadas por perto.",
  },
  {
    n: "02",
    title: "Gravação da tela",
    text: "A emulsão é sensibilizada e queimada na luz; o que fica aberto na malha é o que vira tinta.",
  },
  {
    n: "03",
    title: "Impressão manual",
    text: "Uma passada de rodo por cor, uma peça por vez. Pequenas variações são parte do resultado.",
  },
  {
    n: "04",
    title: "Cura e acabamento",
    text: "Secagem em estufa, revisão à mão e etiqueta com o número do lote.",
  },
];

const gallery = [
  { src: "/banner-1.jpg", alt: "Impressão de folhagem verde em tecido de algodão cru" },
  { src: "/banner-2.jpg", alt: "Peças de linho com estampa botânica dobradas" },
  { src: "/banner-3.jpg", alt: "Camiseta com estampa de floresta vestida em meio à folhagem" },
];

export default function SerigrafiaPage() {
  return (
    <>
      <section className="mx-auto grid max-w-[1400px] items-start gap-12 px-5 pb-20 pt-16 md:grid-cols-12 md:px-10 md:pt-24">
        <Reveal className="md:col-span-5">
          <p className="text-xs uppercase tracking-[0.28em] text-verde-folha">
            processo
          </p>
          <h1 className="mt-5 font-display text-5xl md:text-7xl">Serigrafia</h1>
          <p className="mt-7 text-escuro/70">
            Serigrafia é impressão por malha: a tinta atravessa a tela apenas onde
            o desenho deixou passagem. É lento, é manual e é o que dá textura às
            peças da mata.
          </p>
          <p className="mt-4 text-escuro/70">
            Trabalhamos só com tintas à base d'água em algodão e linho, em
            lotes de no máximo trinta peças.
          </p>
        </Reveal>

        <Reveal rotate={1.2} delay={120} className="md:col-span-7">
          <div className="aspect-[4/5] overflow-hidden bg-secondary">
            {/* eslint-disable-next-line @next/next/no-img-element -- local brand asset */}
            <img
              src="/serigrafia.jpg"
              alt="Telas de serigrafia com estampa botânica e potes de tinta terracota e verde"
              className="size-full object-cover"
            />
          </div>
        </Reveal>
      </section>

      <section className="mx-auto max-w-[1400px] border-t border-escuro/12 px-5 py-20 md:px-10">
        <ul className="grid gap-x-10 gap-y-12 md:grid-cols-4">
          {steps.map((step, i) => (
            <Reveal as="li" key={step.n} delay={i * 110}>
              <p className="font-display text-4xl text-terra">{step.n}</p>
              <h2 className="mt-3 text-2xl">{step.title}</h2>
              <p className="mt-2 text-sm text-escuro/65">{step.text}</p>
            </Reveal>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-[1400px] px-5 pb-24 md:px-10">
        <Reveal>
          <h2 className="font-display text-4xl md:text-5xl">Peças do lote atual</h2>
        </Reveal>
        <ul className="mt-10 grid gap-4 md:grid-cols-3">
          {gallery.map((item, i) => (
            <Reveal
              as="li"
              key={item.src}
              delay={i * 120}
              rotate={i % 2 ? 1.4 : -1.4}
              className="group aspect-[3/4] overflow-hidden bg-secondary"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- local brand asset */}
              <img
                src={item.src}
                alt={item.alt}
                className="size-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              />
            </Reveal>
          ))}
        </ul>
      </section>
    </>
  );
}
