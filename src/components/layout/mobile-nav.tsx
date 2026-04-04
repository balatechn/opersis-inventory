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
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white/95 backdrop-blur-md lg:hidden safe-area-bottom">
      <div className="flex items-center justify-around py-2">
        {items.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors min-w-[56px]",
                isActive ? "text-blue-600" : "text-gray-500"
              )}
            >
              <Icon className={cn("h-5 w-5", isActive && "text-blue-600")} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
