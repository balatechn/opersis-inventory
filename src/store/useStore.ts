import { create } from "zustand";

interface AppState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  globalSearch: string;
  setGlobalSearch: (q: string) => void;
  notifications: { id: string; title: string; message: string; read: boolean }[];
  setNotifications: (n: AppState["notifications"]) => void;
  markRead: (id: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  globalSearch: "",
  setGlobalSearch: (q) => set({ globalSearch: q }),
  notifications: [],
  setNotifications: (n) => set({ notifications: n }),
  markRead: (id) =>
    set((s) => ({
      notifications: s.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    })),
}));
