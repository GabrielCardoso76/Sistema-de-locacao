import { Item, Aluguel, ItemAlugado } from './types';

// Initial Mock Data (Fallback)
const initialItems: Item[] = [
  {
    id: '1',
    nome: 'Mesa Plástica',
    foto: 'https://via.placeholder.com/150',
    estoque_limpo: 50,
    estoque_sujo: 0,
    estoque_manutencao: 2,
    valor_diaria: 10.0,
  },
  {
    id: '2',
    nome: 'Cadeira Plástica',
    foto: 'https://via.placeholder.com/150',
    estoque_limpo: 200,
    estoque_sujo: 10,
    estoque_manutencao: 5,
    valor_diaria: 5.0,
  },
  {
    id: '3',
    nome: 'Tampão de Madeira',
    foto: 'https://via.placeholder.com/150',
    estoque_limpo: 20,
    estoque_sujo: 0,
    estoque_manutencao: 1,
    valor_diaria: 15.0,
  },
  {
    id: '4',
    nome: 'Toalha de Mesa Roxa',
    foto: 'https://via.placeholder.com/150',
    estoque_limpo: 30,
    estoque_sujo: 5,
    estoque_manutencao: 0,
    valor_diaria: 8.0,
  },
  {
    id: '5',
    nome: 'Pista de Comida',
    foto: 'https://via.placeholder.com/150',
    estoque_limpo: 5,
    estoque_sujo: 0,
    estoque_manutencao: 0,
    valor_diaria: 50.0,
  },
];

const initialAlugueis: Aluguel[] = [
  {
    id: '1',
    cliente_nome: 'Maria Silva',
    telefone: '(11) 99999-9999',
    endereco: 'Rua das Flores, 123',
    data_entrega: '2023-10-25',
    hora_entrega: '10:00',
    data_retirada: '2023-10-26',
    hora_retirada: '10:00',
    valor_total: 150.0,
    status: 'Ativo',
  },
  {
    id: '2',
    cliente_nome: 'João Santos',
    telefone: '(11) 98888-8888',
    endereco: 'Av. Paulista, 1000',
    data_entrega: '2023-10-20',
    hora_entrega: '14:00',
    data_retirada: '2023-10-21',
    hora_retirada: '14:00',
    valor_total: 200.0,
    status: 'Concluído',
  },
  {
    id: '3',
    cliente_nome: 'Ana Costa',
    telefone: '(11) 97777-7777',
    endereco: 'Rua Augusta, 500',
    data_entrega: '2023-10-30',
    hora_entrega: '09:00',
    data_retirada: '2023-10-31',
    hora_retirada: '09:00',
    valor_total: 100.0,
    status: 'Cancelado',
  },
  {
    id: '4',
    cliente_nome: 'Carlos Oliveira',
    telefone: '(11) 96666-6666',
    endereco: 'Rua da Consolação, 200',
    data_entrega: '2023-10-25',
    hora_entrega: '11:30',
    data_retirada: '2023-10-26',
    hora_retirada: '11:30',
    valor_total: 80.0,
    status: 'Ativo',
  },
  {
    id: '5',
    cliente_nome: 'Fernanda Lima',
    telefone: '(11) 95555-5555',
    endereco: 'Rua Haddock Lobo, 300',
    data_entrega: '2023-10-25',
    hora_entrega: '09:00',
    data_retirada: '2023-10-26',
    hora_retirada: '09:00',
    valor_total: 120.0,
    status: 'Ativo',
  },
];

const initialItensAlugados: ItemAlugado[] = [
  { id: '1', aluguel_id: '1', item_id: '1', quantidade: 2 },
  { id: '2', aluguel_id: '1', item_id: '2', quantidade: 8 },
  { id: '3', aluguel_id: '2', item_id: '1', quantidade: 4 },
  { id: '4', aluguel_id: '2', item_id: '2', quantidade: 16 },
  { id: '5', aluguel_id: '3', item_id: '5', quantidade: 1 },
  { id: '6', aluguel_id: '4', item_id: '1', quantidade: 1 },
  { id: '7', aluguel_id: '4', item_id: '2', quantidade: 4 },
  { id: '8', aluguel_id: '5', item_id: '3', quantidade: 2 },
];

// Load from LocalStorage or use Fallback
function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
        console.log(`Loaded ${key} from storage`);
        return JSON.parse(stored);
    }
    console.log(`Using fallback for ${key}`);
    return fallback;
  } catch (e) {
    console.warn(`Failed to load ${key} from storage`, e);
    return fallback;
  }
}

export const mockItems: Item[] = loadFromStorage('rental_items', initialItems);
export const mockAlugueis: Aluguel[] = loadFromStorage('rental_data', initialAlugueis);
export const mockItensAlugados: ItemAlugado[] = loadFromStorage('rental_rented_items', initialItensAlugados);

// Save State Function
export function saveState() {
  try {
    console.log('Saving state...');
    localStorage.setItem('rental_items', JSON.stringify(mockItems));
    localStorage.setItem('rental_data', JSON.stringify(mockAlugueis));
    localStorage.setItem('rental_rented_items', JSON.stringify(mockItensAlugados));
  } catch (e) {
    console.error('Failed to save state', e);
  }
}
