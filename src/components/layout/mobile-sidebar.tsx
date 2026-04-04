"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/useStore";
import {
  LayoutDashboard,
  Monitor,
  Package,
  ShoppingCart,
  Receipt,
  BarChart3,
  Settings,
  X,
  Cpu,
  User,
  Wallet,
  Building2,
  ShieldAlert,
  ScrollText,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const menuItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/systems", label: "Systems", icon: Monitor },
  { href: "/dashboard/software", label: "Software", icon: Package },
  { href: "/dashboard/purchases", label: "Purchases", icon: ShoppingCart },
  { href: "/dashboard/expenses", label: "Expenses", icon: Receipt },
  { href: "/dashboard/budgets", label: "Budgets", icon: Wallet },
  { href: "/dashboard/vendors", label: "Vendors", icon: Building2 },
  { href: "/dashboard/alerts", label: "Alerts", icon: ShieldAlert },
];

const adminItems = [
  { href: "/dashboard/audit-log", label: "Audit Log", icon: ScrollText },
  { href: "/dashboard/reports", label: "Reports", icon: BarChart3 },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function MobileSidebar() {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen } = useAppStore();

  if (!sidebarOpen) return null;

  const renderNavItem = (item: { href: string; label: string; icon: React.ComponentType<{ className?: string }> }) => {
    const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
    const Icon = item.icon;
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={() => setSidebarOpen(false)}
        className={cn(
          "flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-all",
          isActive
            ? "bg-white/10 text-white"
            : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
        )}
      >
        <Icon className={cn("h-4 w-4", isActive ? "text-blue-400" : "text-slate-500")} />
        <span>{item.label}</span>
      </Link>
    );
  };

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setSidebarOpen(false)}
      />
      {/* Sidebar */}
      <div className="absolute left-0 top-0 h-full w-[260px] bg-[#1a1b2e] shadow-xl animate-in slide-in-from-left duration-300">
        <div className="flex h-14 items-center justify-between border-b border-white/5 px-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
              <Cpu className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-white tracking-wide">OPERSIS</span>
              <span className="text-[9px] text-slate-500 uppercase tracking-wider">IT Asset Mgmt</span>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)} className="text-slate-400 hover:text-white hover:bg-white/5 h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <nav className="px-2 pt-4">
          <div className="px-3 mb-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">Menu</span>
          </div>
          <div className="space-y-0.5">
            {menuItems.map(renderNavItem)}
          </div>

          <div className="px-3 mb-2 mt-5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">Admin</span>
          </div>
          <div className="space-y-0.5">
            {adminItems.map(renderNavItem)}
          </div>
        </nav>

        {/* User card at bottom */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-white/5 p-3">
          <div className="flex items-center gap-2.5 px-2 py-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600/20">
              <User className="h-3.5 w-3.5 text-blue-400" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-medium text-slate-300 truncate">Admin User</span>
              <span className="text-[10px] text-slate-600 truncate">admin@opersis.com</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
