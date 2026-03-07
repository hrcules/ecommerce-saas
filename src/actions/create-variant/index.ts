"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { PutObjectCommand } from "@aws-sdk/client-s3";

import { db } from "@/db";
import { productTable, productVariantTable, storeTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { r2 } from "@/lib/r2";

export async function createVariantAction(formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) throw new Error("Não autorizado");

  const productId = formData.get("productId") as string;
  const name = formData.get("name") as string;
  const color = formData.get("color") as string;
  const size = formData.get("size") as string;
  const priceInput = formData.get("price") as string;
  const imageFile = formData.get("image") as File | null;

  if (!productId || !name || !color || !size || !priceInput || !imageFile) {
    throw new Error(
      "Preencha todos os campos obrigatórios e envie uma imagem.",
    );
  }

  const store = await db.query.storeTable.findFirst({
    where: eq(storeTable.ownerId, session.user.id),
  });

  if (!store) throw new Error("Loja não encontrada");

  const parentProduct = await db.query.productTable.findFirst({
    where: eq(productTable.id, productId),
  });

  if (!parentProduct || parentProduct.storeId !== store.id) {
    throw new Error("Produto inválido ou não pertence a esta loja.");
  }

  const priceInCents = Math.round(
    parseFloat(priceInput.replace(",", ".")) * 100,
  );
  const variantSlug =
    `${parentProduct.slug}-${color.toLowerCase()}-${size.toLowerCase()}`.replace(
      /[^a-z0-9]+/g,
      "-",
    );

  const buffer = Buffer.from(await imageFile.arrayBuffer());
  const fileName = `${store.id}/produtos/${parentProduct.id}/${Date.now()}-${imageFile.name.replace(/[^a-zA-Z0-9.-]/g, "")}`;

  await r2.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: fileName,
      Body: buffer,
      ContentType: imageFile.type,
    }),
  );

  const imageUrl = `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${fileName}`;

  // 5. Salvar a Variação no Banco
  await db.insert(productVariantTable).values({
    productId,
    name,
    color,
    size,
    priceInCents,
    imageUrl,
    slug: variantSlug,
  });

  // Atualiza a página do produto específico
  revalidatePath(`/admin/products/${productId}`);

  return { success: true };
}
