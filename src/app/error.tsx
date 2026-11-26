"use client";

export default function ErrorPage({ unstable_retry }: { unstable_retry: () => void }) {
  return (
    <div className="mx-auto max-w-[640px] px-8 py-24 text-center">
      <h1 className="font-display text-5xl tracking-wide">ALGO DEU ERRADO</h1>
      <p className="mt-4 font-body text-escuro/65">
        Não conseguimos carregar esta página. Tente de novo em instantes.
      </p>
      <button
        type="button"
        onClick={() => unstable_retry()}
        className="mt-8 cursor-pointer bg-verde-vivo px-9 py-3.5 font-display text-xl tracking-wide text-escuro"
      >
        TENTAR DE NOVO
      </button>
    </div>
  );
}
