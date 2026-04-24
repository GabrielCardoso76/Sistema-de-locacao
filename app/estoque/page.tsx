import { AppShell } from "@/components/app-shell"
import { EstoqueContent } from "@/components/estoque-content"

export default function EstoquePage() {
  return (
    <AppShell title="Estoque" subtitle="Controle de produtos e disponibilidade">
      <EstoqueContent />
    </AppShell>
  )
}
