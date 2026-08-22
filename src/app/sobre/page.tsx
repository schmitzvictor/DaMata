import type { Metadata } from "next";
import { Reveal } from "@/components/store/reveal";

export const metadata: Metadata = {
  title: "Sobre nós | Da Mata",
  description:
    "A história do ateliê da mata: duas artesãs, tiragens pequenas e estampas inspiradas na floresta.",
};

export default function SobrePage() {
  return (
    <>
      <section className="mx-auto max-w-[1400px] px-5 pb-16 pt-16 md:px-10 md:pt-24">
        <Reveal className="max-w-3xl">
          <p className="text-xs uppercase tracking-[0.28em] text-verde-folha">
            sobre nós
          </p>
          <h1 className="mt-5 font-display text-5xl md:text-7xl">
            Um ateliê pequeno, do tamanho do que dá pra fazer à mão
          </h1>
        </Reveal>
      </section>

      <Reveal rotate={-1} className="mx-auto max-w-[1400px] px-5 md:px-10">
        <div className="aspect-[16/11] overflow-hidden bg-secondary">
          {/* eslint-disable-next-line @next/next/no-img-element -- local brand asset */}
          <img
            src="/atelier.jpg"
            alt="Duas artesãs conferindo tecido estampado num ateliê iluminado, cheio de plantas e varais de secagem"
            className="size-full object-cover"
          />
        </div>
      </Reveal>

      <section className="mx-auto max-w-[1400px] px-5 py-20 md:px-10">
        <div className="mx-auto max-w-[62ch] space-y-6 text-lg text-escuro/70">
          <Reveal>
            <p>
              A da mata começou numa varanda, com uma tela emprestada e uma
              vontade de estampar as folhas que a gente via todo dia no caminho de
              casa.
            </p>
          </Reveal>
          <Reveal delay={100}>
            <p>
              Hoje somos duas pessoas dividindo o mesmo ateliê: uma cuida do
              desenho e da gravação das telas, a outra da impressão e do
              acabamento. Tudo o que sai daqui passou pelas nossas mãos ao menos
              quatro vezes.
            </p>
          </Reveal>
          <Reveal delay={200}>
            <p>
              Escolhemos tecidos naturais, tintas à base d'água e lotes
              pequenos — não por estética, mas porque é o que conseguimos fazer
              bem feito. Quando uma peça sai fora do padrão, ela fica com a gente.
            </p>
          </Reveal>
          <Reveal delay={300}>
            <p className="font-display text-3xl leading-snug text-escuro md:text-4xl">
              &ldquo;A mata não repete duas folhas iguais. A gente também
              não.&rdquo;
            </p>
          </Reveal>
        </div>
      </section>
    </>
  );
}
