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
  ChevronLeft,
  Cpu,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const menuItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/systems", label: "Systems", icon: Monitor },
  { href: "/dashboard/software", label: "Software", icon: Package },
  { href: "/dashboard/purchases", label: "Purchases", icon: ShoppingCart },
  { href: "/dashboard/expenses", label: "Expenses", icon: Receipt },
];

const adminItems = [
  { href: "/dashboard/reports", label: "Reports", icon: BarChart3 },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useAppStore();

  const renderNavItem = (item: { href: string; label: string; icon: React.ComponentType<{ className?: string }> }) => {
    const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
    const Icon = item.icon;

    const link = (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          "flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-all duration-200",
          isActive
            ? "bg-white/10 text-white"
            : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
        )}
      >
        <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-blue-400" : "text-slate-500")} />
        {sidebarOpen && <span>{item.label}</span>}
      </Link>
    );

    if (!sidebarOpen) {
      return (
        <Tooltip key={item.href} delayDuration={0}>
          <TooltipTrigger asChild>{link}</TooltipTrigger>
          <TooltipContent side="right">{item.label}</TooltipContent>
        </Tooltip>
      );
    }

    return link;
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-[#1a1b2e] transition-all duration-300 ease-in-out hidden lg:flex flex-col",
        sidebarOpen ? "w-[220px]" : "w-[60px]"
      )}
    >
      {/* Logo */}
      <div className="flex h-14 items-center px-3 border-b border-white/5">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
            <Cpu className="h-4 w-4" />
          </div>
          {sidebarOpen && (
            <div className="flex flex-col">
              <span className="text-sm font-bold text-white tracking-wide">OPERSIS</span>
              <span className="text-[9px] text-slate-500 uppercase tracking-wider">IT Asset Mgmt</span>
            </div>
          )}
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 pt-4">
        {/* MENU section */}
        {sidebarOpen && (
          <div className="px-3 mb-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">Menu</span>
          </div>
        )}
        <div className="space-y-0.5">
          {menuItems.map(renderNavItem)}
        </div>

        {/* ADMIN section */}
        {sidebarOpen && (
          <div className="px-3 mb-2 mt-5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">Admin</span>
          </div>
        )}
        {!sidebarOpen && <div className="my-3 mx-2 border-t border-white/10" />}
        <div className="space-y-0.5">
          {adminItems.map(renderNavItem)}
        </div>
      </nav>

      {/* User card + Collapse */}
      <div className="border-t border-white/5 p-2">
        {sidebarOpen && (
          <div className="flex items-center gap-2.5 px-2 py-2 mb-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600/20">
              <User className="h-3.5 w-3.5 text-blue-400" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-medium text-slate-300 truncate">Admin User</span>
              <span className="text-[10px] text-slate-600 truncate">admin@opersis.com</span>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          className="w-full justify-center text-slate-500 hover:text-slate-300 hover:bg-white/5"
        >
          <ChevronLeft
            className={cn(
              "h-4 w-4 transition-transform duration-300",
              !sidebarOpen && "rotate-180"
            )}
          />
        </Button>
      </div>
    </aside>
  );
}
