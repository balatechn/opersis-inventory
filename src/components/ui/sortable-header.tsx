"use client";

import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SortableHeaderProps {
  label: string;
  sortKey: string;
  currentSort: string;
  currentDir: "asc" | "desc";
  onSort: (key: string) => void;
  className?: string;
}

export function SortableHeader({ label, sortKey, currentSort, currentDir, onSort, className }: SortableHeaderProps) {
  const isActive = currentSort === sortKey;

  return (
    <button
      className={cn("flex items-center gap-1 hover:text-foreground transition-colors text-left", className)}
      onClick={() => onSort(sortKey)}
    >
      <span>{label}</span>
      {isActive ? (
        currentDir === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
      ) : (
        <ArrowUpDown className="h-3 w-3 opacity-40" />
      )}
    </button>
  );
}
