"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface AdminSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

/**
 * Shared admin search input with consistent styling and Search icon.
 */
export function AdminSearchInput({
  value,
  onChange,
  placeholder = "Search...",
}: AdminSearchInputProps) {
  return (
    <div className="relative group px-1">
      <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-primary transition-colors" />
      <Input
        className="h-14 md:h-16 pl-14 rounded-2xl md:rounded-full bg-white border-slate-50 shadow-inner text-base md:text-lg font-bold"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
