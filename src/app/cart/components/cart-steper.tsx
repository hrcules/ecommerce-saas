"use client";

import { usePathname } from "next/navigation";
import clsx from "clsx";
import { Check } from "lucide-react";
import React from "react";

const CHECKOUT_STEPS = [
  { label: "Sacola", path: "/cart" },
  { label: "Identificação", path: "/cart/identification" },
  { label: "Pagamento", path: "/cart/confirmation" },
];

export default function CartSteper() {
  const pathname = usePathname();

  const currentStepIndex = CHECKOUT_STEPS.findIndex(
    (step) => step.path === pathname,
  );

  return (
    <div className="flex items-center justify-between">
      {CHECKOUT_STEPS.map((step, index) => {
        const isDone = index < currentStepIndex;
        const isCurrent = index === currentStepIndex;

        return (
          <React.Fragment key={step.path}>
            <div className="flex items-center gap-2">
              <div
                className={clsx(
                  "flex h-7 w-7 items-center justify-center rounded-full border",
                  {
                    "border-green-600 bg-green-600 text-white": isDone,
                    "border-green-600 text-green-600": isCurrent,
                    "border-accent-foreground text-accent-foreground":
                      !isDone && !isCurrent,
                  },
                )}
              >
                {isDone ? <Check size={12} strokeWidth={5} /> : index + 1}
              </div>

              <span className="text-accent-foreground text-sm">
                {step.label}
              </span>
            </div>

            {index < CHECKOUT_STEPS.length - 1 && (
              <div className="flex flex-1 justify-center">
                <span
                  className={clsx(
                    "h-1 w-1 rounded-full",
                    isDone ? "bg-green-600" : "bg-muted-foreground",
                  )}
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
