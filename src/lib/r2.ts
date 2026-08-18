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

export async function uploadProductImage(file: File): Promise<string> {
  const publicUrl = process.env.R2_PUBLIC_URL;
  if (!publicUrl) {
    throw new Error("R2_PUBLIC_URL não configurada — veja .env.example.");
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const key = `products/${randomUUID()}.${ext}`;

  await client.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: Buffer.from(await file.arrayBuffer()),
      ContentType: file.type || "application/octet-stream",
    }),
  );

  return `${publicUrl}/${key}`;
}
