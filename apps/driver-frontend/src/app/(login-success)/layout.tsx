import { SidebarProvider, SidebarTrigger } from "@repo/ui/sidebar";
import { Toaster } from "@repo/ui/toaster";

import { AppSidebar } from "../components/app-sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex w-full flex-1 flex-col bg-blue-50 p-4 pt-2">
        <SidebarTrigger />
        <div className="flex items-center gap-3">{children}</div>
        <Toaster />
      </main>
    </SidebarProvider>
  );
}
