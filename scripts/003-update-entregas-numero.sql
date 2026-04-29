-- Adiciona a coluna 'numero' na tabela entregas para registrar o número do endereço

ALTER TABLE public.entregas
ADD COLUMN numero text;

-- (Opcional) Adicione comentários para documentação do esquema
COMMENT ON COLUMN public.entregas.numero IS 'Número do endereço de entrega, separado da string principal de endereço para facilitar geolocalização e envio para rotas.';