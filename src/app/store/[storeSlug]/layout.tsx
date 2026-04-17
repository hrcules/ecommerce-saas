import "@/app/globals.css";

import type { Metadata } from "next";
import { Poppins } from "next/font/google";

import { Toaster } from "@/components/ui/sonner";
import ReactQueryProvider from "@/providers/react-query";
import Footer from "@/components/common/footer";

import { db } from "@/db";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const store = await db.query.storeTable.findFirst();

  const storeName = store?.name || "BEWEAR";

  return {
    title: {
      default: storeName,
      template: `${storeName} | %s`,
    },
    description: "Plataforma de E-commerce",
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} flex min-h-screen flex-col antialiased`}
      >
        <ReactQueryProvider>
          <main className="flex-1">{children}</main>
        </ReactQueryProvider>

        <Toaster position="top-center" />
        <Footer />
      </body>
    </html>
  );
}
