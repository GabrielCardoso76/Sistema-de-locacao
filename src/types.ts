export interface Item {
  id: string;
  nome: string;
  foto: string;
  estoque_limpo: number;
  estoque_sujo: number;
  estoque_manutencao: number;
  valor_diaria: number;
}

export type StatusAluguel = 'Ativo' | 'Concluído' | 'Cancelado';

export interface Aluguel {
  id: string;
  cliente_nome: string;
  telefone: string;
  endereco: string;
  data_entrega: string; // YYYY-MM-DD
  hora_entrega: string; // HH:MM
  data_retirada: string; // YYYY-MM-DD
  hora_retirada: string; // HH:MM
  valor_total: number;
  status: StatusAluguel;
}

export interface ItemAlugado {
  id: string;
  aluguel_id: string;
  item_id: string;
  quantidade: number;
}
