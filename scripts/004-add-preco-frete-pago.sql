-- Adicionar coluna preco_unitario na tabela produtos
ALTER TABLE produtos ADD COLUMN preco_unitario DECIMAL(10, 2) NOT NULL DEFAULT 0.00;

-- Adicionar colunas na tabela entregas
ALTER TABLE entregas ADD COLUMN valor_frete DECIMAL(10, 2) NOT NULL DEFAULT 0.00;
ALTER TABLE entregas ADD COLUMN valor_total DECIMAL(10, 2) NOT NULL DEFAULT 0.00;
ALTER TABLE entregas ADD COLUMN pago BOOLEAN NOT NULL DEFAULT FALSE;
