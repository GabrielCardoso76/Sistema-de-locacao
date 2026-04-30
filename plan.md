1.  **Ajuste do Input de Quantidade (Sem transformar em Select)**
    *   No `components/novo-agendamento-dialog.tsx` e `components/editar-agendamento-dialog.tsx`.
    *   Aumentar a largura do Input (usar `w-full` ou largura fixa maior).
    *   Adicionar classes Tailwind para esconder as setas (`[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`).
    *   Garantir `text-center`, `font-bold`, `text-foreground`.

2.  **Visibilidade do Resumo de Kits**
    *   No `components/novo-agendamento-dialog.tsx` e `components/editar-agendamento-dialog.tsx`.
    *   Modificar a div que renderiza "Total: X Jogos...".
    *   Trocar as cores para maior contraste (ex: `bg-primary text-primary-foreground` ou similar) e aplicar `font-semibold`.

3.  **Layout do Formulário de Endereço**
    *   No `components/novo-agendamento-dialog.tsx` e `components/editar-agendamento-dialog.tsx`.
    *   Reestruturar o grid de endereços:
        *   Rua: `col-span-8` ou `w-[70%]`
        *   Número: `col-span-4` ou `w-[30%]`
        *   Bairro e Cidade em linha abaixo.
    *   Atualizar o placeholder de endereço para 'Rua Auto de Carvalho', cidade 'Cidade Aracy', 'São Carlos'.

4.  **Melhorias no Dashboard (`components/dashboard-content.tsx`)**
    *   *Nota: O usuário pediu para alinhar "Próxima Entrega" ao topo e adicionar progresso, mas esse card não existe no `DashboardContent.tsx` atual. Vou analisar se adiciono ou se adapto o card "Entregas de Hoje".* Como ele menciona um card de "Próxima Entrega", vou adicioná-lo ou modificar o card de "Entregas de Hoje" para refletir isso e adicionar o indicador de progresso (ex: entregues / total de entregas hoje).

5.  **Lógica de Geolocalização e Estoque**
    *   *Geolocalização:* No `components/rota-content.tsx` e afins, garantir que o endereço seja anexado com `, SP, Brasil` (já parece estar em alguns lugares, verificar se falta algum).
    *   *Disponibilidade por Data:* Em `novo-agendamento-dialog.tsx` e `editar-agendamento-dialog.tsx`, o cálculo de estoque estava com a "Trava Desativada Temporariamente". Precisa remover os comentários e ativar a trava de estoque subtraindo os itens já reservados para as datas do novo pedido.

6.  **Mapa**
    *   Em `components/rota-content.tsx`, garantir que a prop `entregas` passada para o `MapaWrapper` / `MapaEntregas` seja filtrada corretamente pelos filtros "Apenas Entregas" e "Apenas Retiradas". Atualmente passa `entregasFiltradas`, então preciso checar se isso atualiza os marcadores.

7.  **Revisão de Responsividade**
    *   Checar se há algo extrapolando limites nos modais ou cards, e adicionar classes responsivas se necessário.

8.  **Pre Commit**
    *   Executar passos de verificação antes do commit.
