"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { PutObjectCommand } from "@aws-sdk/client-s3";

import { db } from "@/db";
import { storeTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { r2 } from "@/lib/r2";

async function uploadFileToR2(file: File, storeId: string, prefix: string) {
  const buffer = Buffer.from(await file.arrayBuffer());
  const fileName = `${storeId}/settings/${prefix}-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "")}`;

  await r2.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: fileName,
      Body: buffer,
      ContentType: file.type,
    }),
  );

  return `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${fileName}`;
}

export async function updateStoreSettingsAction(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("Não autorizado");

  const store = await db.query.storeTable.findFirst({
    where: eq(storeTable.ownerId, session.user.id),
  });

  if (!store) throw new Error("Loja não encontrada");

  const name = formData.get("name") as string;
  const colorPrimary = formData.get("colorPrimary") as string;
  const instagramUrl = formData.get("instagramUrl") as string;
  const whatsapp = formData.get("whatsapp") as string;

  const fixedShippingFeeInCents = parseInt(
    (formData.get("fixedShippingFeeInCents") as string) || "0",
  );
  const freeShippingThresholdStr = formData.get(
    "freeShippingThresholdInCents",
  ) as string | null;
  const freeShippingThresholdInCents = freeShippingThresholdStr
    ? parseInt(freeShippingThresholdStr)
    : null;

  // Arquivos
  const logoFile = formData.get("logoFile") as File | null;
  const b1DesktopFile = formData.get("b1DesktopFile") as File | null;
  const b1MobileFile = formData.get("b1MobileFile") as File | null;
  const b2DesktopFile = formData.get("b2DesktopFile") as File | null;
  const b2MobileFile = formData.get("b2MobileFile") as File | null;

  // Flags de remoção
  const removeLogo = formData.get("removeLogo") === "true";
  const removeB1D = formData.get("removeB1D") === "true";
  const removeB1M = formData.get("removeB1M") === "true";
  const removeB2D = formData.get("removeB2D") === "true";
  const removeB2M = formData.get("removeB2M") === "true";

  let {
    logoUrl,
    banner1DesktopUrl,
    banner1MobileUrl,
    banner2DesktopUrl,
    banner2MobileUrl,
  } = store;

  // --- Processamento de Uploads ---
  if (removeLogo) logoUrl = null;
  else if (logoFile && logoFile.size > 0)
    logoUrl = await uploadFileToR2(logoFile, store.id, "logo");

  if (removeB1D) banner1DesktopUrl = null;
  else if (b1DesktopFile && b1DesktopFile.size > 0)
    banner1DesktopUrl = await uploadFileToR2(
      b1DesktopFile,
      store.id,
      "b1-desk",
    );

  if (removeB1M) banner1MobileUrl = null;
  else if (b1MobileFile && b1MobileFile.size > 0)
    banner1MobileUrl = await uploadFileToR2(b1MobileFile, store.id, "b1-mob");

  if (removeB2D) banner2DesktopUrl = null;
  else if (b2DesktopFile && b2DesktopFile.size > 0)
    banner2DesktopUrl = await uploadFileToR2(
      b2DesktopFile,
      store.id,
      "b2-desk",
    );

  if (removeB2M) banner2MobileUrl = null;
  else if (b2MobileFile && b2MobileFile.size > 0)
    banner2MobileUrl = await uploadFileToR2(b2MobileFile, store.id, "b2-mob");

  await db
    .update(storeTable)
    .set({
      name,
      colorPrimary,
      instagramUrl,
      whatsapp,
      logoUrl,
      banner1DesktopUrl,
      banner1MobileUrl,
      banner2DesktopUrl,
      banner2MobileUrl,
      fixedShippingFeeInCents,
      freeShippingThresholdInCents,
      updatedAt: new Date(),
    })
    .where(eq(storeTable.id, store.id));

  revalidatePath("/admin/settings");
  revalidatePath("/");

  return { success: true };
}
