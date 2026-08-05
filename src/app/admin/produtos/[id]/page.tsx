import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatBRL } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { updateProductContentAction } from "./actions";

export default async function AdminProductEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const productId = Number(id);
  if (!Number.isInteger(productId)) notFound();

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { variants: true },
  });
  if (!product) notFound();

  const updateAction = updateProductContentAction.bind(null, product.id);

  return (
    <div className="max-w-2xl">
      <h1 className="mb-1 font-display text-2xl tracking-wide">{product.name}</h1>
      <p className="mb-6 font-ui text-xs text-escuro/60">
        Campos abaixo marcados “ERP” são somente leitura — editar aqui seria
        sobrescrito no próximo sync.
      </p>

      <section className="mb-8 grid grid-cols-2 gap-4 border border-escuro/14 bg-creme/40 p-5 font-ui text-sm">
        <ReadonlyField label="Nome (ERP)" value={product.name} />
        <ReadonlyField label="Categoria (ERP)" value={product.category} />
        <ReadonlyField label="Preço (ERP)" value={formatBRL(product.price)} />
        <ReadonlyField
          label="Sincronização"
          value={product.erpProductId ? `id ${product.erpProductId}` : "não sincronizado"}
        />
        <div className="col-span-2">
          <span className="mb-1 block text-xs text-escuro/60">Estoque por variante (ERP)</span>
          <div className="flex flex-wrap gap-2">
            {product.variants.length === 0 ? (
              <span className="text-escuro/50">sem variantes</span>
            ) : (
              product.variants.map((v) => (
                <span
                  key={v.id}
                  className="rounded border border-escuro/20 px-2 py-1 text-xs"
                >
                  {v.size}
                  {v.color ? ` · ${v.color}` : ""}: {v.stock}
                </span>
              ))
            )}
          </div>
        </div>
      </section>

      <form action={updateAction} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="description" className="font-ui text-xs text-escuro/70">
            Descrição
          </label>
          <textarea
            id="description"
            name="description"
            rows={5}
            defaultValue={product.description ?? ""}
            className="rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="images" className="font-ui text-xs text-escuro/70">
            Imagens (uma URL por linha)
          </label>
          <textarea
            id="images"
            name="images"
            rows={4}
            defaultValue={product.images.join("\n")}
            className="rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </div>
        <label className="flex items-center gap-2 font-ui text-sm">
          <input
            type="checkbox"
            name="featured"
            defaultChecked={product.featured}
            className="size-4"
          />
          Destaque (aparece em &quot;Mais Vendidos&quot;/&quot;Lançamentos&quot; na Home)
        </label>
        <Button type="submit" className="w-fit">
          Salvar
        </Button>
      </form>
    </div>
  );
}

function ReadonlyField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="mb-1 block text-xs text-escuro/60">{label}</span>
      <span className="text-escuro">{value}</span>
    </div>
  );
}
