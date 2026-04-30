import { AppShell } from "@/components/app-shell"
import { FinanceiroContent } from "@/components/financeiro-content"

export default function FinanceiroPage() {
  return (
    <AppShell
      title="Financeiro"
      description="Gerenciamento de pagamentos e recebimentos"
    >
      <FinanceiroContent />
    </AppShell>
  )
}
