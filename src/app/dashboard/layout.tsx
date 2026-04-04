"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { MobileSidebar } from "@/components/layout/mobile-sidebar";
import { useAppStore } from "@/store/useStore";
import { cn } from "@/lib/utils";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { sidebarOpen } = useAppStore();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      <MobileSidebar />

      <div
        className={cn(
          "flex flex-col transition-all duration-300 ease-in-out",
          sidebarOpen ? "lg:ml-[220px]" : "lg:ml-[60px]"
        )}
      >
        <Header />
        <main className="flex-1 p-3 lg:p-5 pb-20 lg:pb-5">{children}</main>
      </div>

      <MobileNav />
    </div>
  );
}
