import Link from "next/link";
import { Zap, ShieldCheck, Globe, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  // Link direto para o seu WhatsApp com uma mensagem pré-definida
  const whatsappLink =
    "https://wa.me/5583999170411?text=Ol%C3%A1!%20Gostaria%20de%20saber%20mais%20sobre%20como%20criar%20minha%20loja%20na%20Bewear.";

  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900">
      {/* Header Minimalista (Sem botões de login, focado na marca) */}
      <header className="flex h-16 items-center justify-center border-b px-6">
        <div className="flex items-center gap-2">
          <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-lg font-bold text-white">
            B
          </div>
          <span className="text-xl font-bold tracking-tight">BEWEAR</span>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="mx-auto max-w-4xl space-y-8 px-6 py-24 text-center">
          <h1 className="text-5xl font-extrabold tracking-tight text-balance md:text-6xl">
            Venda online com sua própria marca.{" "}
            <span className="text-primary">Sem complicação.</span>
          </h1>
          <p className="text-muted-foreground mx-auto max-w-2xl text-xl text-balance md:text-2xl">
            A plataforma premium para você gerenciar produtos, pagamentos e
            envios. Tudo em um ambiente seguro, moderno e com a cara do seu
            negócio.
          </p>
          <div className="flex flex-col justify-center gap-4 pt-8 sm:flex-row">
            <Button
              size="lg"
              className="gap-2 rounded-full px-8 py-6 text-lg"
              asChild
            >
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-5 w-5" />
                Fale com um Especialista
              </a>
            </Button>
          </div>
        </section>

        {/* Features Focadas em Valor e Conversão */}
        <section className="bg-slate-50 px-6 py-20">
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 md:grid-cols-3">
            <div className="space-y-4">
              <div className="bg-primary/10 text-primary flex h-14 w-14 items-center justify-center rounded-xl">
                <Globe className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold">Sua Marca em Destaque</h3>
              <p className="text-muted-foreground leading-relaxed">
                Esqueça os marketplaces que escondem o seu nome. Tenha uma
                vitrine exclusiva com o seu link:{" "}
                <span className="font-semibold text-slate-800">
                  sualoja.bewearshop.com.br
                </span>
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-primary/10 text-primary flex h-14 w-14 items-center justify-center rounded-xl">
                <ShieldCheck className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold">PIX e Cartão Integrados</h3>
              <p className="text-muted-foreground leading-relaxed">
                Checkout de alta conversão. Receba pagamentos via PIX com baixa
                automática e baixa de estoque em tempo real.
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-primary/10 text-primary flex h-14 w-14 items-center justify-center rounded-xl">
                <Zap className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold">Gestão Descomplicada</h3>
              <p className="text-muted-foreground leading-relaxed">
                Um painel de controle feito para humanos. Gerencie seus pedidos,
                produtos e configurações de frete em poucos cliques.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Final */}
        <section className="px-6 py-20 text-center">
          <div className="mx-auto max-w-3xl space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">
              Pronto para digitalizar o seu estoque?
            </h2>
            <p className="text-muted-foreground text-lg">
              Nós configuramos a estrutura, você foca em vender. Entre em
              contato para montarmos a sua loja.
            </p>
            <Button
              variant="outline"
              size="lg"
              className="border-primary text-primary hover:bg-primary/5 mt-4 gap-2 rounded-full px-8 py-6 text-lg"
              asChild
            >
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                Solicitar Criação de Loja
              </a>
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
