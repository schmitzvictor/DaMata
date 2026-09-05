import type { Metadata } from "next";
import { WHATSAPP_DISPLAY, WHATSAPP_LINK, CONTACT_EMAIL } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Trocas e devoluções | Da Mata Grow",
  description: "Como funcionam trocas, devoluções e o direito de arrependimento na Da Mata Grow.",
};

export default function TrocasEDevolucoesPage() {
  return (
    <div className="mx-auto max-w-[760px] px-8 py-16">
      <h1 className="font-display text-[clamp(36px,5vw,56px)] tracking-wide">
        TROCAS E DEVOLUÇÕES
      </h1>
      <p className="mt-3 font-body text-[15px] text-escuro/55">
        Última atualização: {new Date().toLocaleDateString("pt-BR", { year: "numeric", month: "long" })}
      </p>

      <div className="mt-10 flex flex-col gap-9 font-body text-[16px] leading-relaxed text-escuro/85">
        <section>
          <h2 className="mb-2.5 font-editorial text-xl font-bold text-escuro">
            Direito de arrependimento (7 dias)
          </h2>
          <p>
            Como toda compra feita fora de loja física, você tem até{" "}
            <strong>7 dias corridos</strong> a partir do recebimento do produto pra desistir da
            compra, sem precisar dar motivo — é um direito garantido pelo Código de Defesa do
            Consumidor (art. 49). Nesse caso, devolvemos o valor total, incluindo o frete, assim
            que a peça retornar pra gente.
          </p>
        </section>

        <section>
          <h2 className="mb-2.5 font-editorial text-xl font-bold text-escuro">
            Troca por tamanho ou defeito (30 dias)
          </h2>
          <p>
            Além do prazo legal, você tem até <strong>30 dias corridos</strong> desde a entrega
            pra trocar a peça — por tamanho, ou porque veio com algum defeito. A primeira troca
            não tem custo de frete pra você. Pra trocas seguintes ou por outros motivos, o frete
            de envio de volta corre por conta do cliente.
          </p>
          <p className="mt-3">Condições pra aceitar a troca ou devolução:</p>
          <ul className="mt-2 list-disc pl-5">
            <li>Peça sem uso, sem lavagem, com etiquetas ainda presas.</li>
            <li>Embalagem original, sempre que possível.</li>
            <li>Nota fiscal ou número do pedido.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2.5 font-editorial text-xl font-bold text-escuro">
            Peças sob encomenda
          </h2>
          <p>
            Estampas chapadas sob demanda (avisado na página do produto quando for o caso) saem
            do ateliê em até 3 dias úteis. Elas entram nas mesmas regras de troca acima — a
            personalização é só na estampa, não no corte da peça.
          </p>
        </section>

        <section>
          <h2 className="mb-2.5 font-editorial text-xl font-bold text-escuro">
            Como pedir uma troca ou devolução
          </h2>
          <p>
            Chama a gente pelo WhatsApp{" "}
            <a href={WHATSAPP_LINK} target="_blank" rel="noreferrer" className="underline">
              {WHATSAPP_DISPLAY}
            </a>{" "}
            ou por e-mail em{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="underline">
              {CONTACT_EMAIL}
            </a>
            , com o número do pedido e o motivo. A gente te passa o endereço de envio e confirma
            o reembolso ou a nova peça assim que a devolução chegar.
          </p>
        </section>

        <section>
          <h2 className="mb-2.5 font-editorial text-xl font-bold text-escuro">Reembolso</h2>
          <p>
            Feito pelo mesmo meio de pagamento usado na compra. Cartão de crédito: até 2 faturas,
            conforme prazo da operadora. PIX e boleto: em até 7 dias úteis após a peça devolvida
            ser recebida e conferida.
          </p>
        </section>
      </div>
    </div>
  );
}
