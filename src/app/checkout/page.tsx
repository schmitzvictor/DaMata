"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart/cart-context";
import { formatBRL } from "@/lib/format";
import type { ShippingOption } from "@/lib/shipping";
import type { PaymentMethod } from "@/lib/payment";
import { createOrderAction, quoteShippingAction } from "./actions";

const inputClass =
  "border border-escuro/25 bg-[#FFFDF9] px-3.5 py-3.5 font-ui text-sm outline-none focus:border-verde-mata";
const labelClass =
  "flex flex-col gap-1.5 font-ui text-[11px] font-semibold uppercase tracking-wide text-escuro/60";

const BR_STATES = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS",
  "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC",
  "SP", "SE", "TO",
];

const PAYMENT_OPTIONS: { value: PaymentMethod; label: string; note: string }[] = [
  { value: "pix", label: "PIX", note: "Aprovação imediata, QR code na próxima tela." },
  { value: "cartao", label: "Cartão de crédito", note: "Parcelamento via Mercado Pago." },
  { value: "boleto", label: "Boleto bancário", note: "Confirmação em até 2 dias úteis." },
];

export default function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ orderId: number; total: number } | null>(
    null,
  );

  const [customer, setCustomer] = useState({ name: "", email: "", phone: "" });
  const [address, setAddress] = useState({
    zip: "",
    street: "",
    number: "",
    complement: "",
    district: "",
    city: "",
    state: "",
    reference: "",
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("pix");
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [shippingMethod, setShippingMethod] = useState<string | null>(null);
  const [quoting, setQuoting] = useState(false);

  async function handleZipBlur() {
    if (!address.zip) return;
    setQuoting(true);
    try {
      const options = await quoteShippingAction(address.zip, subtotal);
      setShippingOptions(options);
      setShippingMethod(options[0]?.method ?? null);
    } finally {
      setQuoting(false);
    }
  }

  const selectedShipping = shippingOptions.find((o) => o.method === shippingMethod);
  const total = subtotal + (selectedShipping?.cost ?? 0);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!shippingMethod) {
      setError("Informe o CEP para calcular o frete.");
      return;
    }

    startTransition(async () => {
      try {
        const res = await createOrderAction({
          customer,
          address,
          shippingMethod,
          paymentMethod,
          items: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
        });
        setResult(res);
        clear();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Não foi possível finalizar o pedido.");
      }
    });
  }

  if (result) {
    return (
      <div className="mx-auto max-w-[640px] px-8 py-24 text-center">
        <h1 className="font-display text-5xl tracking-wide">PEDIDO RECEBIDO</h1>
        <p className="mt-4 font-body text-lg text-escuro/75">
          Pedido #{result.orderId} confirmado — total de {formatBRL(result.total)}.
          Vamos entrar em contato para confirmar o pagamento.
        </p>
        <Link
          href="/"
          className="mt-8 inline-block bg-verde-vivo px-9 py-3.5 font-display text-xl tracking-wide text-escuro"
        >
          VOLTAR PARA A LOJA
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-[640px] px-8 py-24 text-center">
        <h1 className="font-display text-5xl tracking-wide">CARRINHO VAZIO</h1>
        <p className="mt-4 font-body text-escuro/65">
          Adicione alguma peça antes de finalizar a compra.
        </p>
        <Link
          href="/"
          className="mt-8 inline-block bg-verde-vivo px-9 py-3.5 font-display text-xl tracking-wide text-escuro"
        >
          VER A COLEÇÃO
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-[1240px] px-8 pb-24 pt-9">
      <h1 className="font-display text-[clamp(40px,6vw,72px)] tracking-wide">
        FINALIZAR COMPRA
      </h1>
      <p className="mt-2.5 font-body text-[16.5px] text-escuro/65">
        Falta pouco para sua peça sair do ateliê.
      </p>

      <div className="mt-10 grid grid-cols-[1.5fr_1fr] items-start gap-14 max-lg:grid-cols-1">
        <div className="flex flex-col gap-12">
          <section>
            <h2 className="mb-5 font-editorial text-2xl font-bold">Seus dados</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className={`${labelClass} sm:col-span-2`}>
                Nome completo
                <input
                  required
                  className={inputClass}
                  value={customer.name}
                  onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                />
              </label>
              <label className={labelClass}>
                E-mail
                <input
                  required
                  type="email"
                  className={inputClass}
                  value={customer.email}
                  onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                />
              </label>
              <label className={labelClass}>
                Telefone / WhatsApp
                <input
                  className={inputClass}
                  value={customer.phone}
                  onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                />
              </label>
            </div>
          </section>

          <section>
            <h2 className="mb-5 font-editorial text-2xl font-bold">Endereço de entrega</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-6">
              <label className={`${labelClass} sm:col-span-2`}>
                CEP
                <input
                  required
                  className={inputClass}
                  value={address.zip}
                  onChange={(e) => setAddress({ ...address, zip: e.target.value })}
                  onBlur={handleZipBlur}
                />
              </label>
              <label className={`${labelClass} col-span-2 sm:col-span-3`}>
                Rua
                <input
                  required
                  className={inputClass}
                  value={address.street}
                  onChange={(e) => setAddress({ ...address, street: e.target.value })}
                />
              </label>
              <label className={labelClass}>
                Número
                <input
                  required
                  className={inputClass}
                  value={address.number}
                  onChange={(e) => setAddress({ ...address, number: e.target.value })}
                />
              </label>
              <label className={`${labelClass} sm:col-span-2`}>
                Complemento
                <input
                  className={inputClass}
                  value={address.complement}
                  onChange={(e) => setAddress({ ...address, complement: e.target.value })}
                />
              </label>
              <label className={`${labelClass} sm:col-span-2`}>
                Bairro
                <input
                  required
                  className={inputClass}
                  value={address.district}
                  onChange={(e) => setAddress({ ...address, district: e.target.value })}
                />
              </label>
              <label className={`${labelClass} sm:col-span-2`}>
                Cidade
                <input
                  required
                  className={inputClass}
                  value={address.city}
                  onChange={(e) => setAddress({ ...address, city: e.target.value })}
                />
              </label>
              <label className={labelClass}>
                Estado
                <select
                  required
                  className={inputClass}
                  value={address.state}
                  onChange={(e) => setAddress({ ...address, state: e.target.value })}
                >
                  <option value="" disabled>
                    UF
                  </option>
                  {BR_STATES.map((uf) => (
                    <option key={uf} value={uf}>
                      {uf}
                    </option>
                  ))}
                </select>
              </label>
              <label className={`${labelClass} col-span-2 sm:col-span-5`}>
                Ponto de referência
                <input
                  className={inputClass}
                  value={address.reference}
                  onChange={(e) => setAddress({ ...address, reference: e.target.value })}
                />
              </label>
            </div>
          </section>

          <section>
            <h2 className="mb-5 font-editorial text-2xl font-bold">Frete</h2>
            {quoting ? (
              <p className="font-ui text-sm text-escuro/60">Calculando…</p>
            ) : shippingOptions.length === 0 ? (
              <p className="font-ui text-sm text-escuro/60">
                Informe o CEP acima para ver as opções de frete.
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {shippingOptions.map((o) => (
                  <button
                    type="button"
                    key={o.method}
                    onClick={() => setShippingMethod(o.method)}
                    className={`flex items-center gap-4 border px-5 py-4.5 text-left ${
                      shippingMethod === o.method
                        ? "border-verde-mata bg-[#EFF3E6]"
                        : "border-escuro/20 bg-[#FFFDF9]"
                    }`}
                  >
                    <span
                      className={`h-4.5 w-4.5 shrink-0 rounded-full border-2 border-verde-mata ${
                        shippingMethod === o.method ? "bg-verde-vivo" : ""
                      }`}
                    />
                    <span className="flex-1">
                      <span className="block font-ui text-sm font-semibold">{o.label}</span>
                      <span className="block font-ui text-xs text-escuro/60">{o.etaDays}</span>
                    </span>
                    <span className="font-ui text-[15px] font-bold text-verde-mata">
                      {o.cost === 0 ? "Grátis" : formatBRL(o.cost)}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="mb-5 font-editorial text-2xl font-bold">Pagamento</h2>
            <div className="flex flex-col gap-3">
              {PAYMENT_OPTIONS.map((o) => (
                <button
                  type="button"
                  key={o.value}
                  onClick={() => setPaymentMethod(o.value)}
                  className={`px-5 py-4.5 text-left ${
                    paymentMethod === o.value
                      ? "border border-verde-mata bg-[#EFF3E6]"
                      : "border border-escuro/20 bg-[#FFFDF9]"
                  }`}
                >
                  <span className="flex items-center gap-4">
                    <span
                      className={`h-4.5 w-4.5 shrink-0 rounded-full border-2 border-verde-mata ${
                        paymentMethod === o.value ? "bg-verde-vivo" : ""
                      }`}
                    />
                    <span className="flex-1 font-ui text-sm font-semibold">{o.label}</span>
                  </span>
                  <span className="ml-8.5 block font-body text-sm text-escuro/68">
                    {o.note}
                  </span>
                </button>
              ))}
            </div>
          </section>
        </div>

        <aside className="sticky top-24 bg-verde-mata p-7.5 text-creme">
          <h2 className="mb-5.5 font-display text-2xl tracking-wide">RESUMO DO PEDIDO</h2>
          <div className="flex flex-col gap-3 border-b border-creme/20 pb-5 font-ui text-sm">
            {items.map((i) => (
              <div key={i.variantId} className="flex justify-between gap-3">
                <span className="text-creme/85">
                  {i.name} · Tam. {i.size} · {i.quantity}un.
                </span>
                <span className="shrink-0 font-semibold">
                  {formatBRL(i.price * i.quantity)}
                </span>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-2.5 border-b border-creme/20 py-5 font-ui text-[13.5px]">
            <div className="flex justify-between">
              <span className="text-creme/75">Subtotal</span>
              <span>{formatBRL(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-creme/75">Frete</span>
              <span>
                {selectedShipping
                  ? selectedShipping.cost === 0
                    ? "Grátis"
                    : formatBRL(selectedShipping.cost)
                  : "—"}
              </span>
            </div>
          </div>
          <div className="flex items-baseline justify-between py-5">
            <span className="font-display text-2xl tracking-wide">TOTAL</span>
            <span className="font-ui text-[28px] font-bold text-sol">
              {formatBRL(total)}
            </span>
          </div>
          {error ? (
            <p className="mb-3 font-ui text-[13px] text-sol">{error}</p>
          ) : null}
          <button
            type="submit"
            disabled={isPending}
            data-track="checkout_confirm"
            className="w-full cursor-pointer bg-verde-vivo py-[19px] font-display text-2xl tracking-wide text-escuro disabled:opacity-60"
          >
            {isPending ? "ENVIANDO…" : "CONFIRMAR PEDIDO"}
          </button>
        </aside>
      </div>
    </form>
  );
}
