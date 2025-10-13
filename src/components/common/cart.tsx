"use client";

import { ShoppingBasketIcon } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { Button } from "../ui/button";
import { useQuery } from "@tanstack/react-query";
import { getCart } from "@/actions/get-cart";

const Cart = () => {
  const { data: cart } = useQuery({
    queryKey: ["cart"],
    queryFn: () => getCart(),
  });
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon">
          <ShoppingBasketIcon />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Carrinho</SheetTitle>
        </SheetHeader>
        <div>
          {cart?.items.map((item) => (
            <div key={item.id} className="flex items-center gap-4">
              <img
                src={item.productVariant.imageUrl}
                alt={item.productVariant.name}
                className="h-16 w-16 rounded-md object-cover"
              />
              <div>
                <p className="font-medium">{item.productVariant.name}</p>
                <p className="text-muted-foreground text-sm">
                  Quantidade: {item.quantity}
                </p>
              </div>
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default Cart;
