import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-[640px] px-8 py-24 text-center">
      <h1 className="font-display text-5xl tracking-wide">PÁGINA NÃO ENCONTRADA</h1>
      <p className="mt-4 font-body text-escuro/65">
        Essa trilha não existe ou a peça saiu do catálogo.
      </p>
      <Link
        href="/colecao"
        className="mt-8 inline-block bg-verde-vivo px-9 py-3.5 font-display text-xl tracking-wide text-escuro"
      >
        VER A COLEÇÃO
      </Link>
    </div>
  );
}
