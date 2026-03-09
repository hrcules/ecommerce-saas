"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ColorComboboxProps {
  existingColors: string[];
  disabled?: boolean;
}

export function ColorCombobox({
  existingColors,
  disabled,
}: ColorComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");
  const [inputValue, setInputValue] = React.useState("");

  // Montamos a lista de opções combinando as existentes com o que o usuário está digitando
  const options = React.useMemo(() => {
    const list = [...existingColors];
    // Se ele digitou algo que não existe na lista, adicionamos como uma nova opção!
    if (inputValue && !list.includes(inputValue)) {
      list.push(inputValue);
    }
    return list;
  }, [existingColors, inputValue]);

  return (
    <>
      {/* O PULO DO GATO: Input invisível para o FormData capturar o valor no submit do form! */}
      <input type="hidden" name="color" value={value} required />

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between font-normal"
            disabled={disabled}
          >
            {value || "Selecione ou digite..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] p-0"
          align="start"
        >
          <Command>
            <CommandInput
              placeholder="Buscar ou criar cor..."
              value={inputValue}
              onValueChange={setInputValue}
            />
            <CommandList>
              <CommandEmpty>Nenhuma cor encontrada.</CommandEmpty>
              <CommandGroup>
                {options.map((color) => {
                  const isNew =
                    inputValue === color && !existingColors.includes(color);
                  return (
                    <CommandItem
                      key={color}
                      value={color}
                      onSelect={(currentValue) => {
                        setValue(currentValue);
                        setInputValue("");
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === color ? "opacity-100" : "opacity-0",
                        )}
                      />
                      {color}{" "}
                      {isNew && (
                        <span className="text-muted-foreground ml-1 text-xs">
                          (Criar nova)
                        </span>
                      )}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </>
  );
}
