import { AppSidebar } from "@/components/app-sidebar"
import { CalendarioContent } from "@/components/calendario-content"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

export default function CalendarioPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="text-lg font-semibold">Calendário</h1>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 lg:p-8">
          <CalendarioContent />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
