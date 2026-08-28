-- CreateTable
CREATE TABLE "HeroSlide" (
    "id" SERIAL NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "href" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HeroSlide_pkey" PRIMARY KEY ("id")
);

-- Slides padrão (mesmas imagens de teste que já estavam fixas no código) —
-- sem isso o banner da home fica vazio assim que essa migração rodar em
-- qualquer ambiente, inclusive produção.
INSERT INTO "HeroSlide" ("imageUrl", "href", "order") VALUES
    ('https://picsum.photos/seed/damata-hero-1/1600/1000', '/categoria/camisetas', 0),
    ('https://picsum.photos/seed/damata-hero-2/1600/1000', '/categoria/calcas', 1),
    ('https://picsum.photos/seed/damata-hero-3/1600/1000', '/categoria/acessorios', 2);
