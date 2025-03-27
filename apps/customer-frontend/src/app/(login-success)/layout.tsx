import { SidebarProvider, SidebarTrigger } from "@repo/ui/sidebar";

import { AppSidebar } from "../components/app-sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex w-full flex-1 flex-col overflow-x-hidden bg-accent p-4 pt-2">
        <SidebarTrigger />
        <div className="flex items-center gap-3">{children}</div>
      </main>
    </SidebarProvider>
  );
}
