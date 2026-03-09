"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { PutObjectCommand } from "@aws-sdk/client-s3";

import { db } from "@/db";
import { productTable, productVariantTable, storeTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { r2 } from "@/lib/r2";

export async function createProductAction(formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) throw new Error("Não autorizado");

  const store = await db.query.storeTable.findFirst({
    where: eq(storeTable.ownerId, session.user.id),
  });

  if (!store) throw new Error("Loja não encontrada");

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const categoryId = formData.get("categoryId") as string;

  const priceInput = formData.get("price") as string;
  const color = formData.get("color") as string;
  const size = formData.get("size") as string;
  const stockInput = formData.get("stock") as string;
  const imageFile = formData.get("image") as File | null;

  if (!name || !priceInput || !categoryId || !color || !size) {
    throw new Error("Preencha todos os campos obrigatórios");
  }

  const priceInCents = Math.round(
    parseFloat(priceInput.replace(",", ".")) * 100,
  );
  const stock = parseInt(stockInput || "0", 10);

  const productSlug =
    name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-") +
    "-" +
    Date.now();
  const variantSlug =
    `${productSlug}-${color.toLowerCase()}-${size.toLowerCase()}`.replace(
      /[^a-z0-9]+/g,
      "-",
    );

  let imageUrl = "";

  if (imageFile && imageFile.size > 0) {
    const buffer = Buffer.from(await imageFile.arrayBuffer());
    const fileName = `${store.id}/produtos/${Date.now()}-${imageFile.name.replace(/[^a-zA-Z0-9.-]/g, "")}`;

    await r2.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: fileName,
        Body: buffer,
        ContentType: imageFile.type,
      }),
    );

    imageUrl = `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${fileName}`;
  }

  await db.transaction(async (tx) => {
    const [newProduct] = await tx
      .insert(productTable)
      .values({
        name,
        description,
        slug: productSlug,
        categoryId,
        storeId: store.id,
      })
      .returning();

    await tx.insert(productVariantTable).values({
      productId: newProduct.id,
      name: color,
      slug: variantSlug,
      priceInCents,
      imageUrl,
      color,
      size,
      stock,
    });
  });

  revalidatePath("/admin/products");
  return { success: true };
}
