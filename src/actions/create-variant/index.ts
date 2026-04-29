"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { PutObjectCommand } from "@aws-sdk/client-s3";

import { db } from "@/db";
import { productTable, productVariantTable } from "@/db/schema";
import { r2 } from "@/lib/r2";
import { tenantOwnerAction } from "@/lib/safe-action";

export const createVariantAction = tenantOwnerAction<
  FormData,
  { success: boolean }
>(async (formData, ctx) => {
  const { storeId } = ctx;

  const productId = formData.get("productId") as string;
  const color = formData.get("color") as string;
  const size = formData.get("size") as string;
  const priceInput = formData.get("price") as string;
  const stockInput = formData.get("stock") as string;

  const imageFile = formData.get("image") as File | null;
  const previousImageUrl = formData.get("previousImageUrl") as string | null;

  const name = color;

  if (!productId || !color || !size || !priceInput) {
    throw new Error("Preencha todos os campos obrigatórios.");
  }

  if (!imageFile?.size && !previousImageUrl) {
    throw new Error(
      "Envie uma imagem ou utilize a imagem de uma variante existente.",
    );
  }

  const parentProduct = await db.query.productTable.findFirst({
    where: eq(productTable.id, productId),
  });

  if (!parentProduct || parentProduct.storeId !== storeId) {
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

  let imageUrl = "";

  if (imageFile && imageFile.size > 0) {
    const buffer = Buffer.from(await imageFile.arrayBuffer());
    const fileName = `${storeId}/produtos/${parentProduct.id}/${Date.now()}-${imageFile.name.replace(/[^a-zA-Z0-9.-]/g, "")}`;

    await r2.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: fileName,
        Body: buffer,
        ContentType: imageFile.type,
      }),
    );

    imageUrl = `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${fileName}`;
  } else if (previousImageUrl) {
    imageUrl = previousImageUrl;
  }

  await db.insert(productVariantTable).values({
    productId,
    name,
    color,
    size,
    priceInCents,
    stock: parseInt(stockInput || "0"),
    imageUrl,
    slug: variantSlug,
  });

  revalidatePath(`/admin/products/${productId}`);

  return { success: true };
});
