import type { Metadata } from "next";
import { CONTACT_EMAIL } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Política de privacidade | Da Mata Grow",
  description: "Como a Da Mata Grow coleta, usa e protege os seus dados pessoais.",
};

export default function PoliticaDePrivacidadePage() {
  return (
    <div className="mx-auto max-w-[760px] px-8 py-16">
      <h1 className="font-display text-[clamp(36px,5vw,56px)] tracking-wide">
        POLÍTICA DE PRIVACIDADE
      </h1>
      <p className="mt-3 font-body text-[15px] text-escuro/55">
        Última atualização: {new Date().toLocaleDateString("pt-BR", { year: "numeric", month: "long" })}
      </p>

      <div className="mt-10 flex flex-col gap-9 font-body text-[16px] leading-relaxed text-escuro/85">
        <section>
          <p>
            A Da Mata Grow (CNPJ [a preencher]) é responsável pelo tratamento dos dados pessoais
            descritos nesta política, em conformidade com a Lei Geral de Proteção de Dados
            (Lei 13.709/2018 — LGPD). Esta página explica quais dados coletamos por aqui, pra
            que servem e quais direitos você tem sobre eles.
          </p>
        </section>

        <section>
          <h2 className="mb-2.5 font-editorial text-xl font-bold text-escuro">
            Quais dados coletamos
          </h2>
          <p className="mb-2">
            <strong>Ao finalizar uma compra:</strong> nome, e-mail, telefone e endereço de
            entrega. Esses dados vão pro processamento do pedido e pro nosso sistema interno de
            estoque e faturamento — nunca são vendidos ou usados pra publicidade de terceiros.
          </p>
          <p className="mb-2">
            <strong>Pagamento:</strong> processado direto pelo Mercado Pago. Não temos acesso
            nem guardamos número de cartão ou dados financeiros — isso fica só com a operadora de
            pagamento.
          </p>
          <p>
            <strong>Navegação no site:</strong> usamos um identificador de sessão aleatório,
            gerado no seu navegador e apagado quando você fecha a aba (não é um cookie
            permanente), pra entender de onde os visitantes vêm, quais páginas e produtos são
            mais vistos e quais botões são mais usados. Esses dados não têm nome, e-mail ou
            qualquer outra informação que identifique você — são mantidos por até 180 dias e
            depois apagados automaticamente.
          </p>
        </section>

        <section>
          <h2 className="mb-2.5 font-editorial text-xl font-bold text-escuro">
            Cookies e armazenamento local
          </h2>
          <p>
            O carrinho de compras é guardado no armazenamento local do seu navegador
            (localStorage), só no seu aparelho — a gente não tem acesso a ele até você finalizar
            a compra. O identificador de sessão de navegação (acima) usa o mesmo mecanismo,
            resetado a cada visita. Não usamos cookies de rastreamento de terceiros nem
            compartilhamos dados de navegação com redes de publicidade.
          </p>
        </section>

        <section>
          <h2 className="mb-2.5 font-editorial text-xl font-bold text-escuro">
            Com quem compartilhamos
          </h2>
          <ul className="list-disc pl-5">
            <li>
              <strong>Mercado Pago</strong> — processamento do pagamento.
            </li>
            <li>
              <strong>Resend</strong> — envio dos e-mails de confirmação e status do pedido.
            </li>
            <li>
              <strong>Nosso próprio sistema de gestão (ERP)</strong> — controle de estoque,
              faturamento e envio, dentro da mesma empresa.
            </li>
          </ul>
          <p className="mt-2">
            Não vendemos nem alugamos dados pessoais pra terceiros em hipótese nenhuma.
          </p>
        </section>

        <section>
          <h2 className="mb-2.5 font-editorial text-xl font-bold text-escuro">
            Por quanto tempo guardamos
          </h2>
          <p>
            Dados de pedidos são mantidos pelo prazo exigido por obrigações fiscais e de garantia.
            Dados de navegação anônimos (sessão, cliques, produtos vistos) são apagados
            automaticamente após 180 dias.
          </p>
        </section>

        <section>
          <h2 className="mb-2.5 font-editorial text-xl font-bold text-escuro">Seus direitos</h2>
          <p className="mb-2">De acordo com a LGPD, você pode a qualquer momento pedir:</p>
          <ul className="list-disc pl-5">
            <li>Confirmação de que tratamos algum dado seu, e acesso a ele.</li>
            <li>Correção de dados incompletos, desatualizados ou incorretos.</li>
            <li>Anonimização, bloqueio ou exclusão de dados desnecessários.</li>
            <li>Portabilidade dos dados pra outro fornecedor.</li>
            <li>Informação sobre com quem compartilhamos seus dados.</li>
          </ul>
          <p className="mt-3">
            Pra exercer qualquer um desses direitos, escreva pra{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="underline">
              {CONTACT_EMAIL}
            </a>
            . Se não ficar satisfeito com a resposta, você também pode reclamar direto na
            Autoridade Nacional de Proteção de Dados (ANPD).
          </p>
        </section>

        <section>
          <h2 className="mb-2.5 font-editorial text-xl font-bold text-escuro">Segurança</h2>
          <p>
            Todo o tráfego do site é criptografado (HTTPS). Senhas de acesso interno são
            armazenadas com hash, nunca em texto puro, e o acesso ao painel administrativo é
            restrito à nossa equipe.
          </p>
        </section>

        <section>
          <h2 className="mb-2.5 font-editorial text-xl font-bold text-escuro">
            Mudanças nesta política
          </h2>
          <p>
            Podemos atualizar esta página de vez em quando. A data no topo sempre mostra a
            última revisão.
          </p>
        </section>
      </div>
    </div>
  );
}
