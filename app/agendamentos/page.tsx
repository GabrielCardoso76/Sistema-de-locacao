import { AppShell } from "@/components/app-shell"
import { AgendamentosContent } from "@/components/agendamentos-content"

export default function AgendamentosPage() {
  return (
    <AppShell title="Agendamentos" subtitle="Gerencie suas entregas e retiradas">
      <AgendamentosContent />
    </AppShell>
  )
}
