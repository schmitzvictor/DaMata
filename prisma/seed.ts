import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// Cobre um exemplar de cada variação relevante de cada model — pra testar a
// UI localmente sem precisar montar estado manualmente toda vez. Produtos e
// usuários são upsert (idempotente); Post/Order não têm chave natural nesse
// schema, então rodar de novo duplica — pensado pra rodar uma vez num banco
// limpo, igual ao seed do ERP.
async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@damatagrow.com.br";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "damata123";

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      password: await bcrypt.hash(adminPassword, 10),
      name: "Admin",
      role: "admin",
    },
  });
  console.log(`Admin: ${admin.email} / senha: ${adminPassword}`);

  await prisma.user.upsert({
    where: { email: "cliente@damatagrow.com.br" },
    update: {},
    create: {
      email: "cliente@damatagrow.com.br",
      password: await bcrypt.hash("damata123", 10),
      name: "Cliente Teste",
      role: "user",
    },
  });

  // Conta bloqueada — pra testar o botão "Desbloquear" em /admin/usuarios.
  await prisma.user.upsert({
    where: { email: "bloqueado@damatagrow.com.br" },
    update: {},
    create: {
      email: "bloqueado@damatagrow.com.br",
      password: await bcrypt.hash("damata123", 10),
      name: "Conta Bloqueada (teste)",
      role: "admin",
      loginAttempts: 5,
      lockedUntil: new Date(Date.now() + 15 * 60 * 1000),
    },
  });

  const products = [
    {
      slug: "camiseta-serra-verde",
      name: "Camiseta Serra Verde",
      description: "Camiseta 100% algodão, estampa exclusiva serigrafada à mão.",
      category: "camisetas",
      price: 79.9,
      images: ["https://picsum.photos/seed/damata-camiseta/600/750"],
      featured: true,
      isBestSeller: true,
      weightGrams: 220,
      variants: [
        { size: "P", color: "Verde", stock: 12 },
        { size: "M", color: "Verde", stock: 0 }, // esgotado
        { size: "G", color: "Verde", stock: 5 },
      ],
    },
    {
      slug: "moletom-trilha-seca",
      name: "Moletom Trilha Seca",
      description: null,
      category: "moletons",
      price: 189.9,
      images: [] as string[], // sem imagem — mostra o placeholder
      featured: false,
      isBestSeller: false,
      weightGrams: null,
      variants: [
        { size: "M", color: "Cinza", stock: 3 },
        { size: "G", color: "Cinza", stock: 20 },
      ],
    },
    {
      slug: "bone-mata-fechada",
      name: "Boné Mata Fechada",
      description: "Boné aba curva bordado, ajuste traseiro.",
      category: "acessorios",
      price: 59.9,
      images: [] as string[],
      featured: true,
      isBestSeller: false,
      weightGrams: 80,
      variants: [{ size: "Único", color: "Bege", stock: 8 }],
    },
    {
      slug: "calca-cargo-trilha",
      name: "Calça Cargo Trilha",
      description: "Cargo reforçada, seis bolsos, tecido ripstop.",
      category: "calcas",
      price: 219.9,
      images: ["https://picsum.photos/seed/damata-calca/600/750"],
      featured: false,
      isBestSeller: true,
      weightGrams: 400,
      variants: [
        { size: "38", color: "Verde", stock: 6 },
        { size: "40", color: "Verde", stock: 0 }, // esgotado
        { size: "42", color: "Preto", stock: 4 },
      ],
    },
  ];

  const createdProducts: { id: number }[] = [];
  for (const p of products) {
    const existing = await prisma.product.findUnique({ where: { slug: p.slug } });
    const productData = {
      name: p.name,
      description: p.description,
      category: p.category,
      price: p.price,
      images: p.images,
      featured: p.featured,
      isBestSeller: p.isBestSeller,
      weightGrams: p.weightGrams,
    };
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: productData,
      create: { slug: p.slug, ...productData },
    });

    if (!existing) {
      for (const v of p.variants) {
        await prisma.productVariant.create({
          data: { productId: product.id, size: v.size, color: v.color, stock: v.stock },
        });
      }
    }

    createdProducts.push({ id: product.id });
  }
  console.log(`${products.length} produtos (upsert por slug).`);

  // Post não tem chave única no schema — checa por título pra não duplicar
  // a cada rerun do seed.
  const posts = [
    {
      title: "Como nasce uma estampa chapada",
      excerpt: "Do desenho à tela revelada — o processo por trás de cada peça.",
      content: "Conteúdo completo do post de exemplo.",
      image: "https://picsum.photos/seed/damata-post1/600/450",
      author: "Ateliê Da Mata",
      date: new Date(),
    },
    {
      title: "Bastidores: trilha que inspirou a coleção",
      excerpt: "Registro de campo antes da coleção Trilha Cerrada ganhar forma.",
      content: "Conteúdo completo do post de exemplo.",
      image: null, // sem imagem — mostra o placeholder
      author: "Equipe Da Mata",
      date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    },
  ];
  for (const post of posts) {
    const existing = await prisma.post.findFirst({ where: { title: post.title } });
    if (!existing) await prisma.post.create({ data: post });
  }
  console.log(`${posts.length} posts (Do Ateliê).`);

  // Índices batem com a ordem do array `products` acima.
  const camiseta = createdProducts[0];
  const calca = createdProducts[3];

  // customerEmail como chave de dedup — Order não tem outra natural, e
  // cada cliente de exemplo abaixo é único.
  const orders: Parameters<typeof prisma.order.create>[0]["data"][] = [
    {
      customerName: "Ana Beatriz Souza",
      customerEmail: "ana.souza@example.com",
      customerPhone: "48999990001",
      total: 79.9 + 12.5,
      status: "pago",
      addressZip: "88010-000",
      addressStreet: "Rua das Trilhas",
      addressNumber: "120",
      addressDistrict: "Centro",
      addressCity: "Florianópolis",
      addressState: "SC",
      shippingMethod: "PAC",
      shippingCost: 12.5,
      paymentProvider: "mercadopago",
      paymentId: "seed-pay-1",
      paymentMethod: "pix",
      paymentStatus: "aprovado",
      orderItems: {
        create: [
          {
            productId: camiseta.id,
            productName: "Camiseta Serra Verde",
            size: "P",
            quantity: 1,
            price: 79.9,
            erpVariantId: null, // ainda não linkado ao ERP
          },
        ],
      },
    },
    {
      customerName: "Rafael Lima",
      customerEmail: "rafael.lima@example.com",
      customerPhone: null,
      total: 219.9,
      status: "pendente",
      addressZip: "01310-000",
      addressStreet: "Av. Paulista",
      addressNumber: "1000",
      addressComplement: "Apto 45",
      addressDistrict: "Bela Vista",
      addressCity: "São Paulo",
      addressState: "SP",
      paymentMethod: null,
      paymentStatus: "pendente",
      orderItems: {
        create: [
          {
            productId: calca.id,
            productName: "Calça Cargo Trilha",
            size: "42",
            quantity: 1,
            price: 219.9,
          },
        ],
      },
    },
    {
      customerName: "Juliana Prado",
      customerEmail: "juliana.prado@example.com",
      customerPhone: "21988887777",
      total: 79.9 + 59.9 + 9.9,
      status: "entregue",
      createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
      addressZip: "20040-020",
      addressStreet: "Rua do Ouvidor",
      addressNumber: "50",
      addressDistrict: "Centro",
      addressCity: "Rio de Janeiro",
      addressState: "RJ",
      addressReference: "Prédio azul, portaria 24h",
      shippingMethod: "SEDEX",
      shippingCost: 9.9,
      paymentProvider: "mercadopago",
      paymentId: "seed-pay-3",
      paymentMethod: "cartao",
      paymentStatus: "aprovado",
      orderItems: {
        create: [
          { productId: camiseta.id, productName: "Camiseta Serra Verde", size: "G", quantity: 1, price: 79.9 },
        ],
      },
    },
  ];
  for (const order of orders) {
    const existing = await prisma.order.findFirst({ where: { customerEmail: order.customerEmail } });
    if (!existing) await prisma.order.create({ data: order });
  }
  console.log(`${orders.length} pedidos (pago, pendente, entregue).`);

  console.log("Seed concluído.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
