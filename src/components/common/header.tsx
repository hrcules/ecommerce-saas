"use client";

import {
  LogInIcon,
  LogOutIcon,
  MenuIcon,
  House,
  Truck,
  ShoppingBag,
  Search, // Adicionado para o Desktop
  User, // Adicionado para o Desktop
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { authClient } from "@/lib/auth-client";

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import Cart from "./cart";

const CATEGORIES = [
  { name: "Camisetas", href: "/category/camisetas" },
  { name: "Bermuda & Shorts", href: "/category/bermudas-e-shorts" },
  { name: "Calças", href: "/category/calcas" },
  { name: "Jaquetas & Moletons", href: "/category/jaquetas-e-moletons" },
  { name: "Tênis", href: "/category/tenis" },
  { name: "Acessórios", href: "/category/acessorios" },
];

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
    <header className="w-full bg-white">
      <div className="flex items-center justify-between p-5 md:hidden">
        <Link href="/">
          <Image src="/logo.svg" alt="BEWEAR" width={100} height={26.14} />
        </Link>

        <div className="flex items-center gap-3">
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
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    asChild
                  >
                    <Link href="/">
                      <House className="mr-2 h-5 w-5" />
                      Inicio
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    asChild
                  >
                    <Link href="/orders">
                      <Truck className="mr-2 h-5 w-5" />
                      Meus Pedidos
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    asChild
                  >
                    <Link href="/cart">
                      <ShoppingBag className="mr-2 h-5 w-5" />
                      Sacola
                    </Link>
                  </Button>
                </div>

                <Separator className="mt-5" />

                <div className="mt-4 flex flex-col items-start justify-start">
                  {CATEGORIES.map((category) => (
                    <Button
                      key={category.href}
                      variant="ghost"
                      className="w-full justify-start"
                      asChild
                    >
                      <Link href={category.href}>{category.name}</Link>
                    </Button>
                  ))}
                </div>

                <Separator className="my-5" />
                {session?.user && (
                  <Button
                    variant="ghost"
                    className="text-muted-foreground w-full justify-start"
                    onClick={() => authClient.signOut()}
                  >
                    <LogOutIcon className="mr-2 h-5 w-5" />
                    Sair da Conta
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="mx-auto hidden max-w-7xl flex-col gap-6 px-10 py-6 md:flex">
        <div className="flex w-full items-center justify-between">
          <div className="flex flex-1 items-center justify-start">
            {session?.user ? (
              <div className="text-foreground flex items-center gap-2 text-sm font-semibold">
                <Avatar>
                  <AvatarImage src={session?.user.image ?? undefined} />
                  <AvatarFallback>
                    {getInitials(session?.user.name)}
                  </AvatarFallback>
                </Avatar>
                <span>Olá, {session.user.name?.split(" ")[0]}!</span>
              </div>
            ) : (
              <Link
                href="/authentication"
                className="text-foreground flex items-center gap-2 text-sm font-semibold hover:underline"
              >
                <User size={20} />
                <span>Olá, faça seu login!</span>
              </Link>
            )}
          </div>

          <div className="flex flex-1 items-center justify-center">
            <Link href="/">
              <Image
                src="/logo.svg"
                alt="BEWEAR"
                width={140}
                height={36}
                className="h-auto w-auto"
              />
            </Link>
          </div>

          <div className="flex flex-1 items-center justify-end gap-5">
            <button className="text-muted-foreground hover:text-foreground transition-colors">
              <Search size={22} />
            </button>
            <div className="bg-border h-5 w-px"></div> <Cart />
          </div>
        </div>

        <nav className="flex items-center justify-center gap-8">
          {CATEGORIES.map((category) => (
            <Link
              key={category.href}
              href={category.href}
              className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
            >
              {category.name}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Header;
