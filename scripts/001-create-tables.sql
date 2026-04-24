-- Sistema de Agendamento de Entregas - Tabelas

-- Tabela de produtos (catálogo)
CREATE TABLE IF NOT EXISTS produtos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('jogo_mesa_cadeira', 'mesa_avulsa', 'pista_comida', 'toalha', 'outro')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de estoque
CREATE TABLE IF NOT EXISTS estoque (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  produto_id UUID NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
  quantidade_total INTEGER NOT NULL DEFAULT 0,
  quantidade_disponivel INTEGER NOT NULL DEFAULT 0,
  quantidade_limpeza INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(produto_id)
);

-- Tabela de clientes
CREATE TABLE IF NOT EXISTS clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  telefone TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de entregas (agendamentos)
CREATE TABLE IF NOT EXISTS entregas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE RESTRICT,
  endereco TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  data_entrega TIMESTAMP WITH TIME ZONE NOT NULL,
  data_retirada TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'agendada' CHECK (status IN ('agendada', 'em_rota', 'entregue', 'retirada')),
  observacoes TEXT,
  ordem_rota INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de itens da entrega
CREATE TABLE IF NOT EXISTS itens_entrega (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entrega_id UUID NOT NULL REFERENCES entregas(id) ON DELETE CASCADE,
  produto_id UUID NOT NULL REFERENCES produtos(id) ON DELETE RESTRICT,
  quantidade INTEGER NOT NULL DEFAULT 1 CHECK (quantidade > 0)
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_entregas_data_entrega ON entregas(data_entrega);
CREATE INDEX IF NOT EXISTS idx_entregas_status ON entregas(status);
CREATE INDEX IF NOT EXISTS idx_entregas_cliente ON entregas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_itens_entrega_entrega ON itens_entrega(entrega_id);
CREATE INDEX IF NOT EXISTS idx_estoque_produto ON estoque(produto_id);
