import { randomUUID } from "node:crypto";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// Cloudflare R2 é compatível com a API S3 — mesmo SDK, endpoint diferente.
// Bucket "damata-media" (público) só guarda imagens de produto; o bucket
// "damata-backups" (privado, dump do Postgres) é usado só pelo restic na VM.
const client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? "",
  },
});

const BUCKET = process.env.R2_BUCKET ?? "damata-media";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB

// Assinatura real do arquivo (magic bytes), nunca o nome ou o Content-Type
// enviado pelo cliente — ambos são controláveis por quem faz o upload.
const IMAGE_SIGNATURES: {
  ext: string;
  contentType: string;
  matches: (bytes: Buffer) => boolean;
}[] = [
  {
    ext: "jpg",
    contentType: "image/jpeg",
    matches: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  },
  {
    ext: "png",
    contentType: "image/png",
    matches: (b) =>
      b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47,
  },
  {
    ext: "gif",
    contentType: "image/gif",
    matches: (b) =>
      b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x38,
  },
  {
    ext: "webp",
    contentType: "image/webp",
    matches: (b) =>
      b[0] === 0x52 &&
      b[1] === 0x49 &&
      b[2] === 0x46 &&
      b[3] === 0x46 &&
      b[8] === 0x57 &&
      b[9] === 0x45 &&
      b[10] === 0x42 &&
      b[11] === 0x50,
  },
];

function sniffImage(bytes: Buffer) {
  return IMAGE_SIGNATURES.find((sig) => sig.matches(bytes)) ?? null;
}

async function uploadImage(file: File, folder: string): Promise<string> {
  const publicUrl = process.env.R2_PUBLIC_URL;
  if (!publicUrl) {
    throw new Error("R2_PUBLIC_URL não configurada — veja .env.example.");
  }

  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error(`Imagem "${file.name}" excede o limite de 5MB.`);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const sniffed = sniffImage(buffer);
  if (!sniffed) {
    throw new Error(
      `Arquivo "${file.name}" não é uma imagem suportada (jpg, png, gif ou webp).`,
    );
  }

  const key = `${folder}/${randomUUID()}.${sniffed.ext}`;

  await client.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: sniffed.contentType,
    }),
  );

  return `${publicUrl}/${key}`;
}

export function uploadProductImage(file: File): Promise<string> {
  return uploadImage(file, "products");
}

export function uploadBannerImage(file: File): Promise<string> {
  return uploadImage(file, "banners");
}
