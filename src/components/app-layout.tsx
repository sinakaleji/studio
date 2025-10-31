import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import AppSidebar from "@/components/sidebar"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
            {children}
        </SidebarInset>
    </SidebarProvider>
  )
}
