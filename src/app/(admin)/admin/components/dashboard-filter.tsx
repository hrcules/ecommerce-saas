"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Search, X } from "lucide-react"; // Adicionámos o ícone X

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function DashboardFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [startDate, setStartDate] = useState(searchParams.get("start") || "");
  const [endDate, setEndDate] = useState(searchParams.get("end") || "");

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());

    if (startDate) params.set("start", startDate);
    else params.delete("start");

    if (endDate) params.set("end", endDate);
    else params.delete("end");

    router.push(`/admin?${params.toString()}`);
  };

  // Nova função para limpar os filtros
  const handleClear = () => {
    setStartDate("");
    setEndDate("");

    const params = new URLSearchParams(searchParams.toString());
    params.delete("start");
    params.delete("end");

    router.push(`/admin?${params.toString()}`);
  };

  return (
    <form
      onSubmit={handleFilter}
      className="bg-muted/20 flex flex-wrap items-end gap-4 rounded-lg border p-4"
    >
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="start"
          className="text-muted-foreground text-sm font-medium"
        >
          Data Inicial
        </label>
        <Input
          type="date"
          id="start"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="end"
          className="text-muted-foreground text-sm font-medium"
        >
          Data Final
        </label>
        <Input
          type="date"
          id="end"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>

      <div className="flex items-center gap-2">
        <Button type="submit" variant="secondary">
          <Search className="mr-2 h-4 w-4" />
          Filtrar
        </Button>

        {/* O botão Limpar só aparece se houver uma data preenchida */}
        {(startDate || endDate) && (
          <Button
            type="button"
            variant="ghost"
            onClick={handleClear}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="mr-2 h-4 w-4" />
            Limpar
          </Button>
        )}
      </div>
    </form>
  );
}
