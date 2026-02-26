-- Create Items Table
CREATE TABLE items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome TEXT NOT NULL,
    foto TEXT,
    estoque_limpo INTEGER DEFAULT 0,
    estoque_sujo INTEGER DEFAULT 0,
    estoque_manutencao INTEGER DEFAULT 0,
    valor_diaria NUMERIC(10, 2) NOT NULL
);

-- Create Rentals Table
CREATE TABLE rentals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cliente_nome TEXT NOT NULL,
    telefone TEXT,
    endereco TEXT,
    data_entrega DATE NOT NULL,
    hora_entrega TIME NOT NULL,
    data_retirada DATE NOT NULL,
    hora_retirada TIME NOT NULL,
    valor_total NUMERIC(10, 2) DEFAULT 0,
    status TEXT DEFAULT 'Ativo'
);

-- Create Rented Items Table (Relation)
CREATE TABLE rented_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    aluguel_id UUID REFERENCES rentals(id) ON DELETE CASCADE,
    item_id UUID REFERENCES items(id) ON DELETE RESTRICT,
    quantidade INTEGER NOT NULL
);

-- Insert Mock Items (Optional)
INSERT INTO items (nome, foto, estoque_limpo, estoque_sujo, estoque_manutencao, valor_diaria)
VALUES
('Mesa Plástica', 'https://via.placeholder.com/150', 50, 0, 2, 10.00),
('Cadeira Plástica', 'https://via.placeholder.com/150', 200, 10, 5, 5.00),
('Tampão de Madeira', 'https://via.placeholder.com/150', 20, 0, 1, 15.00),
('Toalha de Mesa Roxa', 'https://via.placeholder.com/150', 30, 5, 0, 8.00),
('Pista de Comida', 'https://via.placeholder.com/150', 5, 0, 0, 50.00);
