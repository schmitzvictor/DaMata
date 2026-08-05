import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatBRL } from "@/lib/format";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { name: "asc" },
    include: { variants: true },
  });

  return (
    <div>
      <h1 className="mb-1 font-display text-2xl tracking-wide">PRODUTOS</h1>
      <p className="mb-6 font-ui text-xs text-escuro/60">
        Nome, categoria, preço e estoque vêm do ERP e são somente leitura aqui.
        Edite descrição, imagens e destaque.
      </p>
      <div className="overflow-x-auto border border-escuro/14">
        <table className="w-full border-collapse text-left font-ui text-sm">
          <thead>
            <tr className="border-b border-escuro/14 bg-creme/60">
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Categoria</th>
              <th className="px-4 py-3">Preço</th>
              <th className="px-4 py-3">Estoque</th>
              <th className="px-4 py-3">ERP</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const totalStock = product.variants.reduce(
                (sum, v) => sum + v.stock,
                0,
              );
              return (
                <tr key={product.id} className="border-b border-escuro/10">
                  <td className="px-4 py-3">{product.name}</td>
                  <td className="px-4 py-3 text-escuro/70">{product.category}</td>
                  <td className="px-4 py-3">{formatBRL(product.price)}</td>
                  <td className="px-4 py-3">{totalStock}</td>
                  <td className="px-4 py-3">
                    {product.erpProductId ? (
                      <span className="rounded-full bg-verde-claro/40 px-2 py-0.5 text-[11px] text-verde-mata">
                        sincronizado
                      </span>
                    ) : (
                      <span className="rounded-full bg-terra/15 px-2 py-0.5 text-[11px] text-terra">
                        não sincronizado
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/produtos/${product.id}`}
                      className="text-verde-mata underline"
                    >
                      Editar
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
