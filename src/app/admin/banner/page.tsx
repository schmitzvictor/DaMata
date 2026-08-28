import { getHeroSlides } from "@/lib/queries/hero-slides";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createSlideAction, deleteSlideAction, moveSlideAction } from "./actions";

export default async function AdminBannerPage() {
  const slides = await getHeroSlides();

  return (
    <div>
      <h1 className="mb-1 font-display text-2xl tracking-wide">BANNER DA HOME</h1>
      <p className="mb-6 font-ui text-xs text-escuro/60">
        Slides do carrossel no topo do site, na ordem em que aparecem. Cada um leva
        pra um link diferente ao ser clicado.
      </p>

      <div className="mb-10 flex flex-col gap-3">
        {slides.length === 0 ? (
          <p className="font-ui text-xs text-escuro/50">Nenhum slide cadastrado ainda.</p>
        ) : (
          slides.map((slide, i) => (
            <div
              key={slide.id}
              className="flex items-center gap-4 border border-escuro/14 bg-creme/40 p-3"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- remote domains not configured yet */}
              <img
                src={slide.imageUrl}
                alt=""
                className="h-16 w-24 shrink-0 rounded object-cover"
              />
              <span className="min-w-0 flex-1 truncate font-ui text-sm">{slide.href}</span>
              <div className="flex shrink-0 items-center gap-1.5">
                <form action={moveSlideAction.bind(null, slide.id, "up")}>
                  <Button type="submit" variant="outline" size="sm" disabled={i === 0}>
                    ↑
                  </Button>
                </form>
                <form action={moveSlideAction.bind(null, slide.id, "down")}>
                  <Button
                    type="submit"
                    variant="outline"
                    size="sm"
                    disabled={i === slides.length - 1}
                  >
                    ↓
                  </Button>
                </form>
                <form action={deleteSlideAction.bind(null, slide.id)}>
                  <Button type="submit" variant="destructive" size="sm">
                    Excluir
                  </Button>
                </form>
              </div>
            </div>
          ))
        )}
      </div>

      <section className="max-w-md border border-escuro/14 bg-creme/40 p-5">
        <h2 className="mb-4 font-display text-lg tracking-wide">NOVO SLIDE</h2>
        <form action={createSlideAction} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="image" className="font-ui text-xs text-escuro/70">
              Imagem
            </label>
            <input
              id="image"
              name="image"
              type="file"
              accept="image/*"
              required
              className="font-ui text-xs"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="href" className="font-ui text-xs text-escuro/70">
              Link de destino
            </label>
            <Input id="href" name="href" placeholder="/categoria/camisetas" required />
          </div>
          <Button type="submit" className="mt-2 w-fit">
            Adicionar slide
          </Button>
        </form>
      </section>
    </div>
  );
}
