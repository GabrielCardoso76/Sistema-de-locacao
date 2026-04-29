-- 1. Remover a restrição de "tipo" em produtos, usar apenas nome, UNIQUE constraint
ALTER TABLE produtos DROP CONSTRAINT IF EXISTS produtos_tipo_check;
ALTER TABLE produtos DROP COLUMN IF EXISTS tipo;
ALTER TABLE produtos ADD CONSTRAINT produtos_nome_key UNIQUE (nome);

-- 2. Adicionar "cidade" em entregas
ALTER TABLE entregas ADD COLUMN cidade TEXT DEFAULT 'São Carlos';
