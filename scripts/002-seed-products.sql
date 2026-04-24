-- Produtos iniciais para o sistema

-- Inserir produtos
INSERT INTO produtos (nome, tipo) VALUES
  ('Jogo Mesa + 4 Cadeiras', 'jogo_mesa_cadeira'),
  ('Mesa Avulsa', 'mesa_avulsa'),
  ('Cadeira Avulsa', 'outro'),
  ('Pista de Comida', 'pista_comida'),
  ('Toalha de Mesa', 'toalha')
ON CONFLICT DO NOTHING;

-- Criar estoque inicial para cada produto
INSERT INTO estoque (produto_id, quantidade_total, quantidade_disponivel, quantidade_limpeza)
SELECT id, 10, 10, 0 FROM produtos
ON CONFLICT (produto_id) DO NOTHING;
