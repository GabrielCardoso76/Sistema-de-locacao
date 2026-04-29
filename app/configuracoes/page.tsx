import { AppShell } from "@/components/app-shell"
import { ConfiguracoesContent } from "@/components/configuracoes-content"

export default function ConfiguracoesPage() {
  return (
    <AppShell
      title="Configurações"
      subtitle="Ajustes do sistema e preferências do usuário"
    >
      <ConfiguracoesContent />
    </AppShell>
  )
}