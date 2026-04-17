import Link from "next/link";
import { ShoppingBag, Zap, ShieldCheck, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900">
      {/* Header Simples */}
      <header className="flex h-16 items-center justify-between border-b px-6">
        <div className="flex items-center gap-2">
          <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-lg font-bold text-white">
            B
          </div>
          <span className="text-xl font-bold tracking-tight">BEWEAR</span>
        </div>
        <nav className="flex gap-4">
          <Button variant="ghost" asChild>
            <Link href="/authentication">Entrar</Link>
          </Button>
          <Button asChild>
            <Link href="/authentication">Criar minha loja</Link>
          </Button>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="mx-auto max-w-4xl space-y-6 px-6 py-20 text-center">
          <h1 className="text-5xl font-extrabold tracking-tight md:text-6xl">
            Sua loja online com{" "}
            <span className="text-primary">subdomínio próprio</span> e checkout
            profissional.
          </h1>
          <p className="text-muted-foreground text-xl">
            A Bewear é a plataforma definitiva para quem quer vender mais.
            Configure seu Stripe, defina seu frete e comece a vender hoje mesmo.
          </p>
          <div className="flex flex-col justify-center gap-4 pt-4 sm:flex-row">
            <Button
              size="lg"
              className="rounded-full px-8 py-6 text-lg"
              asChild
            >
              <Link href="/authentication">Começar Agora — É Grátis</Link>
            </Button>
          </div>
        </section>

        {/* Features Básicas */}
        <section className="bg-slate-50 px-6 py-16">
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 md:grid-cols-3">
            <div className="space-y-3">
              <div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-lg">
                <Globe className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">Subdomínios Próprios</h3>
              <p className="text-muted-foreground">
                Sua marca em destaque com uma URL exclusiva:{" "}
                <span className="font-medium">sualoja.bewear.com.br</span>
              </p>
            </div>

            <div className="space-y-3">
              <div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-lg">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">Pagamentos Seguros</h3>
              <p className="text-muted-foreground">
                Integração nativa com Stripe. Receba suas vendas direto na sua
                conta bancária.
              </p>
            </div>

            <div className="space-y-3">
              <div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-lg">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">Gestão Simplificada</h3>
              <p className="text-muted-foreground">
                Painel admin completo para gerenciar pedidos, estoque e
                configurações de frete.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="text-muted-foreground border-t px-6 py-10 text-center text-sm">
        <p>
          &copy; {new Date().getFullYear()} Bewear SaaS. Todos os direitos
          reservados.
        </p>
      </footer>
    </div>
  );
}
