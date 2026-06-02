"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

interface CopyButtonProps {
  textToCopy: string;
}

export function CopyButton({ textToCopy }: CopyButtonProps) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    try {
      // API nativa do navegador para copiar para a área de transferência
      await navigator.clipboard.writeText(textToCopy);
      setIsCopied(true);

      // Mostra o aviso na tela
      toast.success("Código PIX copiado com sucesso!");

      // Volta o ícone ao normal depois de 2 segundos
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch {
      toast.error("Falha ao copiar o código.");
    }
  };

  return (
    <Button
      type="button"
      size="icon"
      variant="secondary"
      className="absolute top-1 right-1 h-8 w-8 transition-all duration-200"
      onClick={handleCopy}
    >
      {isCopied ? (
        <Check className="h-4 w-4 text-emerald-500" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </Button>
  );
}
