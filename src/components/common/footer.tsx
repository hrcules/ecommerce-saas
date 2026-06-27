import Image from "next/image";
import Link from "next/link";
import { Instagram, MessageCircle } from "lucide-react";
import { eq } from "drizzle-orm"; // ✅ Importamos o limit e eq

import { db } from "@/db"; // ✅ Importamos o db
import { categoryTable } from "@/db/schema";
import { getTenantStore } from "@/lib/tentat";

const Footer = async () => {
  const store = await getTenantStore();

  // ✅ Buscamos as 4 principais categorias da loja para o footer não ficar gigante
  const categories = store
    ? await db.query.categoryTable.findMany({
        where: eq(categoryTable.storeId, store.id),
        limit: 4,
      })
    : [];

  return (
    <footer className="bg-accent/50 border-border mt-12 w-full border-t">
      <div className="mx-auto max-w-7xl px-5 py-10 md:px-10">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* === COLUNA 1: MARCA E SOBRE === */}
          <div className="flex flex-col space-y-4">
            {store?.logoUrl ? (
              <div className="relative h-12 w-32">
                <Image
                  src={store.logoUrl}
                  alt={`Logo ${store?.name || "Loja"}`}
                  fill
                  className="object-contain object-left"
                />
              </div>
            ) : (
              <h3 className="text-primary text-2xl font-bold">
                {store?.name || "BEWEAR"}
              </h3>
            )}
            <p className="text-muted-foreground text-sm">
              {store?.name
                ? `Compre online na ${store.name} com segurança e praticidade.`
                : "A plataforma completa para criar sua vitrine digital."}
            </p>
          </div>

          {/* === COLUNA 2: DEPARTAMENTOS (Dinâmico) === */}
          <div className="flex flex-col space-y-3">
            <h4 className="text-foreground font-semibold">Departamentos</h4>
            <Link
              href="/"
              className="text-muted-foreground hover:text-primary text-sm transition-colors"
            >
              Início
            </Link>

            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className="text-muted-foreground hover:text-primary text-sm transition-colors"
              >
                {category.name}
              </Link>
            ))}
          </div>

          {/* === COLUNA 3: CONTATO E REDES SOCIAIS === */}
          <div className="flex flex-col space-y-3">
            <h4 className="text-foreground font-semibold">Fale Conosco</h4>
            <div className="flex items-center gap-3">
              {store?.whatsapp && (
                <a
                  href={`https://wa.me/55${store.whatsapp.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground flex h-10 w-10 items-center justify-center rounded-full transition-all"
                  title="Fale no WhatsApp"
                >
                  <MessageCircle className="h-5 w-5" />
                </a>
              )}

              {store?.instagramUrl && (
                <a
                  href={store.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground flex h-10 w-10 items-center justify-center rounded-full transition-all"
                  title="Visite nosso Instagram"
                >
                  <Instagram className="h-5 w-5" />
                </a>
              )}

              {!store?.whatsapp && !store?.instagramUrl && (
                <p className="text-muted-foreground text-xs">
                  Nenhum contato cadastrado.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* === LINHA DE DIREITOS AUTORAIS E CRÉDITOS === */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t pt-6 sm:flex-row">
          <p className="text-muted-foreground text-xs font-medium">
            © {new Date().getFullYear()} {store?.name || "BEWEAR"}. Todos os
            direitos reservados.
          </p>
          <p className="text-muted-foreground text-xs font-medium">
            Tecnologia por{" "}
            <span className="text-foreground font-bold">BEWEAR</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
