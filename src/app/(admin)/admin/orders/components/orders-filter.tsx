"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function OrdersFilter() {
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

    router.push(`/admin/orders?${params.toString()}`);
  };

  return (
    <form
      onSubmit={handleFilter}
      className="bg-muted/20 mb-6 flex items-end gap-4 rounded-lg p-4"
    >
      <div className="flex flex-col gap-1.5">
        <label htmlFor="start" className="text-sm font-medium">
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
        <label htmlFor="end" className="text-sm font-medium">
          Data Final
        </label>
        <Input
          type="date"
          id="end"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>
      <Button type="submit">
        <Search className="mr-2 h-4 w-4" />
        Filtrar
      </Button>
    </form>
  );
}
