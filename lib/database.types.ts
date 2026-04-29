export type StatusEntrega = 'agendada' | 'em_rota' | 'entregue' | 'retirada'

export interface Produto {
  id: string
  nome: string
  preco_unitario: number
  created_at: string
}

export interface Estoque {
  id: string
  produto_id: string
  quantidade_total: number
  quantidade_disponivel: number
  quantidade_limpeza: number
  updated_at: string
  produto?: Produto
}

export interface Cliente {
  id: string
  nome: string
  telefone: string
  created_at: string
}

export interface Entrega {
  id: string
  cliente_id: string
  endereco: string
  numero: string | null
  cidade: string | null
  latitude: number | null
  longitude: number | null
  data_entrega: string
  data_retirada: string
  status: StatusEntrega
  observacoes: string | null
  ordem_rota: number | null
  valor_frete: number
  valor_total: number
  pago: boolean
  created_at: string
  cliente?: Cliente
  itens?: ItemEntrega[]
}

export interface ItemEntrega {
  id: string
  entrega_id: string
  produto_id: string
  quantidade: number
  produto?: Produto
}

export interface Database {
  public: {
    Tables: {
      produtos: {
        Row: Produto
        Insert: Omit<Produto, 'id' | 'created_at'>
        Update: Partial<Omit<Produto, 'id' | 'created_at'>>
      }
      estoque: {
        Row: Estoque
        Insert: Omit<Estoque, 'id' | 'updated_at'>
        Update: Partial<Omit<Estoque, 'id' | 'updated_at'>>
      }
      clientes: {
        Row: Cliente
        Insert: Omit<Cliente, 'id' | 'created_at'>
        Update: Partial<Omit<Cliente, 'id' | 'created_at'>>
      }
      entregas: {
        Row: Entrega
        Insert: Omit<Entrega, 'id' | 'created_at'> & { numero?: string | null, cidade?: string | null }
        Update: Partial<Omit<Entrega, 'id' | 'created_at'> & { numero?: string | null, cidade?: string | null }>
      }
      itens_entrega: {
        Row: ItemEntrega
        Insert: Omit<ItemEntrega, 'id'>
        Update: Partial<Omit<ItemEntrega, 'id'>>
      }
    }
  }
}
