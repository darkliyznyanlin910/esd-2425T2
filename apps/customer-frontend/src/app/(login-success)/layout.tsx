import { SidebarProvider, SidebarTrigger } from "@repo/ui/sidebar";

import { AppSidebar } from "../components/app-sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex h-screen w-full flex-1 flex-col gap-4 bg-slate-50 p-4 pt-2">
        <SidebarTrigger />
        <div className="flex items-center gap-3"></div>
        {children}
      </main>
    </SidebarProvider>
  );
}
