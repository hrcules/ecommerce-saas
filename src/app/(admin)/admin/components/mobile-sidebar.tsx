"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface MobileSidebarProps {
  storeName: string;
  colorPrimary: string;
}

export function MobileSidebar({ storeName, colorPrimary }: MobileSidebarProps) {
  const [open, setOpen] = useState(false);

  const navLinks = [
    { href: "/admin/", label: "Dashboard" },
    { href: "/admin/products", label: "Produtos" },
    { href: "/admin/categories", label: "Categorias" },
    { href: "/admin/orders", label: "Pedidos" },
    { href: "/admin/settings", label: "Configurações" },
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>

      <SheetContent
        side="left"
        className="w-[280px]"
        style={
          {
            "--primary": colorPrimary,
            "--ring": colorPrimary,
          } as React.CSSProperties
        }
      >
        <SheetHeader className="mb-6 text-left">
          <SheetTitle className="text-primary text-xl font-bold">
            <p className="text-accent-foreground text-sm font-semibold">
              área restrita
            </p>
            {storeName}
          </SheetTitle>
        </SheetHeader>

        <nav className="flex flex-col gap-2">
          {navLinks.map((link) => (
            <Button
              key={link.href}
              variant="ghost"
              className="text-muted-foreground hover:text-primary w-full justify-start"
              asChild
              onClick={() => setOpen(false)}
            >
              <Link href={link.href}>{link.label}</Link>
            </Button>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
