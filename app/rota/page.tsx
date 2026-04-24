import { AppShell } from "@/components/app-shell"
import { RotaContent } from "@/components/rota-content"

export default function RotaPage() {
  return (
    <AppShell title="Rota do Dia" subtitle="Organize e inicie suas entregas">
      <RotaContent />
    </AppShell>
  )
}
