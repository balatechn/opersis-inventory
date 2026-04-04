"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Monitor, Package, ShoppingCart, Receipt } from "lucide-react";

const items = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/dashboard/systems", label: "Systems", icon: Monitor },
  { href: "/dashboard/software", label: "Software", icon: Package },
  { href: "/dashboard/purchases", label: "Purchase", icon: ShoppingCart },
  { href: "/dashboard/expenses", label: "Expenses", icon: Receipt },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white lg:hidden safe-area-bottom">
      <div className="flex items-center justify-around py-1.5">
        {items.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-colors min-w-[48px]",
                isActive ? "text-blue-600" : "text-gray-400"
              )}
            >
              <Icon className={cn("h-4 w-4", isActive && "text-blue-600")} />
              <span className="text-[9px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
