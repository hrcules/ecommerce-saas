"use client";

import {
  LogInIcon,
  LogOutIcon,
  MenuIcon,
  House,
  Truck,
  ShoppingBag,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { authClient } from "@/lib/auth-client";

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import Cart from "./cart";
import { Separator } from "../ui/separator";

const Header = () => {
  const { data: session } = authClient.useSession();

  const getInitials = (name?: string | null) => {
    if (!name) return "??";
    const parts = name.split(" ");
    const first = parts[0]?.[0] ?? "";
    const second = parts[1]?.[0] ?? "";
    return (first + second).toUpperCase();
  };

  return (
    <header className="flex items-center justify-between p-5">
      <Link href="/">
        <Image src="/logo.svg" alt="BEWEAR" width={100} height={26.14} />
      </Link>

      <div className="flex items-center gap-3 px-6">
        <Cart />

        <p className="text-accent-foreground">|</p>

        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-accent-foreground cursor-pointer"
            >
              <MenuIcon size={24} />
            </Button>
          </SheetTrigger>
          <SheetContent className="rounded-l-[24px] px-1">
            <SheetHeader>
              <SheetTitle className="text-lg font-semibold">Menu</SheetTitle>
            </SheetHeader>
            <div className="px-5">
              {session?.user ? (
                <>
                  <div className="flex justify-between space-y-6">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={session?.user.image ?? undefined} />
                        <AvatarFallback>
                          {getInitials(session?.user.name)}
                        </AvatarFallback>
                      </Avatar>

                      <div>
                        <h3 className="font-semibold">{session?.user?.name}</h3>
                        <span className="text-muted-foreground block text-xs">
                          {session?.user?.email}
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="font-semibold">Olá, faça seu login!</h2>
                  <Button
                    variant="default"
                    className="w-32 rounded-3xl"
                    asChild
                  >
                    <Link href="/authentication">
                      Login <LogInIcon />
                    </Link>
                  </Button>
                </div>
              )}

              <Separator className="mt-6" />

              <div className="mt-4 flex flex-col items-start justify-start">
                <Button variant="ghost" asChild>
                  <Link href="/">
                    <House className="mr-2" />
                    Inicio
                  </Link>
                </Button>
                <Button variant="ghost" asChild>
                  <Link href="/orders">
                    <Truck className="mr-2" />
                    Meus Pedidos
                  </Link>
                </Button>
                <Button variant="ghost" asChild>
                  <Link href="/orders" className="text-base">
                    <ShoppingBag className="mr-2" />
                    Sacola
                  </Link>
                </Button>
              </div>

              <Separator className="mt-5" />

              <div className="mt-4 flex flex-col items-start justify-start">
                <Button variant="ghost" asChild>
                  <Link href="/products/camisetas">Camisetas</Link>
                </Button>
                <Button variant="ghost" asChild>
                  <Link href="/products/bermudas-e-shorts">
                    Bermuda & Shorts
                  </Link>
                </Button>
                <Button variant="ghost" asChild>
                  <Link href="/products/calcas">Calças</Link>
                </Button>
                <Button variant="ghost" asChild>
                  <Link href="/products/jaquetas-e-moletons">
                    Jaquetas & Moletons
                  </Link>
                </Button>
                <Button variant="ghost" asChild>
                  <Link href="/products/tenis">Tênis</Link>
                </Button>
                <Button variant="ghost" asChild>
                  <Link href="/products/acessorios">Acessórios</Link>
                </Button>
              </div>
              <Separator className="my-5" />
              {session?.user && (
                <>
                  <Button
                    variant="ghost"
                    className="text-muted-foreground"
                    onClick={() => authClient.signOut()}
                  >
                    <LogOutIcon />
                    Sair da Conta
                  </Button>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default Header;
