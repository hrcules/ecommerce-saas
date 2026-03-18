"use client";

import {
  LogInIcon,
  LogOutIcon,
  MenuIcon,
  House,
  Truck,
  ShoppingBag,
  User,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import type { categoryTable, storeTable } from "@/db/schema";
import { authClient } from "@/lib/auth-client";

import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { Button } from "../../ui/button";
import { Separator } from "../../ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../../ui/sheet";
import Cart from "../cart";

interface HeaderClientProps {
  categories: (typeof categoryTable.$inferSelect)[];
  store: typeof storeTable.$inferSelect;
}

const HeaderClient = ({ categories, store }: HeaderClientProps) => {
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
      {/* ======================= HEADER MOBILE ======================= */}
      <div className="flex items-center justify-between p-5 md:hidden">
        <Link href="/">
          {/* Lógica Dinâmica da Logo (Mobile) */}
          {store.logoUrl ? (
            <Image
              src={store.logoUrl}
              alt={store.name}
              width={100}
              height={26}
              className="max-h-[26px] object-contain"
            />
          ) : (
            <span className="text-primary text-xl font-bold tracking-tight">
              {store.name}
            </span>
          )}
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
                  {categories.map((category) => (
                    <Button
                      key={category.id}
                      variant="ghost"
                      className="w-full justify-start"
                      asChild
                    >
                      <Link href={`/category/${category.slug}`}>
                        {category.name}
                      </Link>
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

      {/* ======================= HEADER DESKTOP ======================= */}
      <div className="mx-auto hidden max-w-7xl flex-col gap-6 px-10 py-6 md:flex">
        <div className="flex w-full items-center justify-between">
          <div className="flex min-w-min flex-1 items-center justify-start gap-5">
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
            <Button
              variant="ghost"
              className="text-muted-foreground justify-start"
              asChild
            >
              <Link href="/orders">
                <Truck className="mr-2 h-5 w-5" /> Meus Pedidos
              </Link>
            </Button>
          </div>

          <div className="flex flex-1 items-center justify-center">
            <Link href="/">
              {store.logoUrl ? (
                <Image
                  src={store.logoUrl}
                  alt={store.name}
                  width={120}
                  height={26}
                  className="h-auto object-contain"
                />
              ) : (
                <span className="text-primary text-2xl font-bold tracking-tight">
                  {store.name}
                </span>
              )}
            </Link>
          </div>

          <div className="flex flex-1 items-center justify-end gap-5">
            <div className="bg-border h-5 w-px"></div> <Cart />
          </div>
        </div>

        <nav className="flex items-center justify-center gap-8">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/category/${category.slug}`}
              className="text-muted-foreground hover:text-primary text-sm font-medium transition-colors"
            >
              {category.name}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default HeaderClient;
