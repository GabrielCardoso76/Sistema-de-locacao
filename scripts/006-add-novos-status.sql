-- 1. Remove a restrição de status antiga
ALTER TABLE entregas DROP CONSTRAINT IF EXISTS entregas_status_check;

-- 2. Adiciona a nova restrição com o fluxo logístico completo
ALTER TABLE entregas ADD CONSTRAINT entregas_status_check 
CHECK (status IN (
    'agendada', 
    'em_rota', 
    'entregue', 
    'retirada', 
    'em_rota_entrega', 
    'aguardando_retirada', 
    'em_rota_retirada', 
    'finalizada',
    'cancelada'
));