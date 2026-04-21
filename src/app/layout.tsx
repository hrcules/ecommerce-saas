import "./globals.css";

import type { Metadata } from "next";
import { Poppins } from "next/font/google";

import { Toaster } from "@/components/ui/sonner";
import ReactQueryProvider from "@/providers/react-query";
import Footer from "@/components/common/footer";

// Font Poppins que você já configurou e gosta
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

// Metadata agora focado na PLATAFORMA (Landing Page)
export const metadata: Metadata = {
  title: {
    default: "BEWEAR | Sua vitrine digital em minutos",
    template: "BEWEAR | %s",
  },
  description:
    "A plataforma completa para lojistas criarem seu e-commerce com subdomínio próprio.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${poppins.variable} flex min-h-screen flex-col antialiased`}
        suppressHydrationWarning
      >
        <ReactQueryProvider>
          {/* O seu conteúdo (Landing Page ou Admin) renderiza aqui */}
          <main className="flex-1">{children}</main>

          {/* Mantive o seu Footer original aqui na raiz */}
          <Footer />
        </ReactQueryProvider>

        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
