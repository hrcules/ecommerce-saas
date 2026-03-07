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
  // 1. Validação de Segurança e Loja
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) throw new Error("Não autorizado");

  const store = await db.query.storeTable.findFirst({
    where: eq(storeTable.ownerId, session.user.id),
  });

  if (!store) throw new Error("Loja não encontrada");

  // 2. Extração dos dados do Formulário
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const priceInput = formData.get("price") as string;
  const categoryId = formData.get("categoryId") as string;
  const imageFile = formData.get("image") as File | null;

  if (!name || !priceInput || !categoryId) {
    throw new Error("Preencha todos os campos obrigatórios");
  }

  // Converte o preço (ex: "100.50") para centavos (10050)
  const priceInCents = Math.round(
    parseFloat(priceInput.replace(",", ".")) * 100,
  );

  // Gera um slug simples (ex: "Camisa Preta" -> "camisa-preta")
  const productSlug =
    name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-") +
    "-" +
    Date.now();

  let imageUrl = "";

  // 3. Upload para o Cloudflare R2
  if (imageFile && imageFile.size > 0) {
    // Converte o arquivo do navegador para um Buffer que a AWS entende
    const buffer = Buffer.from(await imageFile.arrayBuffer());

    // Cria um nome único para não sobrescrever arquivos com o mesmo nome
    const fileName = `${store.id}/produtos/${Date.now()}-${imageFile.name.replace(/[^a-zA-Z0-9.-]/g, "")}`;

    // Comando de envio para o R2
    await r2.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: fileName,
        Body: buffer,
        ContentType: imageFile.type,
      }),
    );

    // Monta a URL pública (usando a variável que configuramos no .env)
    imageUrl = `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${fileName}`;
  }

  // 4. Transação no Banco de Dados (Salva Produto e Variante)
  await db.transaction(async (tx) => {
    // Salva o Produto Pai
    const [newProduct] = await tx
      .insert(productTable)
      .values({
        name,
        description,
        slug: productSlug,
        categoryId,
        storeId: store.id, // A mágica do SaaS!
      })
      .returning();

    // Salva a Variante Padrão (Única) com a foto e preço
    await tx.insert(productVariantTable).values({
      productId: newProduct.id,
      name: "Padrão",
      slug: `${productSlug}-padrao`,
      priceInCents,
      imageUrl,
      color: "única",
      size: "única",
    });
  });

  // Atualiza a tela de listagem para mostrar o produto novo
  revalidatePath("/admin/products");

  return { success: true };
}
