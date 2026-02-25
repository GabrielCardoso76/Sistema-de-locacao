import { Item, Aluguel, ItemAlugado } from '../types';

// Fallback Initial Data
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

// Helper to load/save
function load<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

function save(key: string, data: any) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save to localStorage', e);
  }
}

// In-memory state (synced with LS)
let items: Item[] = load('rental_items', initialItems);
let rentals: Aluguel[] = load('rental_data', initialAlugueis);
let rentedItems: ItemAlugado[] = load('rental_rented_items', initialItensAlugados);

// --- Data Service ---

export const dataService = {
  // Get all items (async)
  getItems: async (): Promise<Item[]> => {
    try {
      // Simulate network delay
      // await new Promise(resolve => setTimeout(resolve, 500));
      return [...items];
    } catch (error) {
      console.error('Error fetching items:', error);
      throw error;
    }
  },

  // Get all rentals (async)
  getRentals: async (): Promise<Aluguel[]> => {
    try {
      return [...rentals];
    } catch (error) {
      console.error('Error fetching rentals:', error);
      throw error;
    }
  },

  // Get rented items for a specific rental (async)
  getRentedItems: async (rentalId: string): Promise<ItemAlugado[]> => {
    try {
      return rentedItems.filter(ri => ri.aluguel_id === rentalId);
    } catch (error) {
      console.error('Error fetching rented items:', error);
      throw error;
    }
  },

  // Save a new rental (async)
  saveRental: async (rental: Aluguel, newItems: { item: Item, qty: number }[]): Promise<void> => {
    try {
      // Add rental
      rentals.push(rental);

      // Validate Stock First
      newItems.forEach(({ item, qty }) => {
        const storedItem = items.find(i => i.id === item.id);
        if (storedItem) {
            if (storedItem.estoque_limpo < qty) {
                throw new Error(`Insufficient stock for item: ${storedItem.nome}`);
            }
        }
      });

      // Add rented items and update stock
      newItems.forEach(({ item, qty }) => {
        // Update local item reference (which is part of the `items` array)
        const storedItem = items.find(i => i.id === item.id);
        if (storedItem) {
            storedItem.estoque_limpo -= qty;
        }

        rentedItems.push({
            id: (rentedItems.length + 1).toString(), // Simple ID generation
            aluguel_id: rental.id,
            item_id: item.id,
            quantidade: qty
        });
      });

      // Save to storage
      save('rental_data', rentals);
      save('rental_items', items);
      save('rental_rented_items', rentedItems);
    } catch (error) {
      console.error('Error saving rental:', error);
      throw error;
    }
  },

  // Cancel a rental (async)
  cancelRental: async (rentalId: string): Promise<void> => {
    try {
      const rental = rentals.find(r => r.id === rentalId);
      if (!rental) throw new Error('Rental not found');

      // Update status
      rental.status = 'Cancelado';

      // Restore stock
      const rentalItems = rentedItems.filter(ri => ri.aluguel_id === rentalId);
      rentalItems.forEach(ri => {
        const item = items.find(i => i.id === ri.item_id);
        if (item) {
            item.estoque_limpo += ri.quantidade;
        }
      });

      // Save
      save('rental_data', rentals);
      save('rental_items', items);
    } catch (error) {
      console.error('Error cancelling rental:', error);
      throw error;
    }
  },

  // Check-in a rental (async)
  checkInRental: async (rentalId: string, returns: { itemId: string, limpo: number, sujo: number, quebrado: number }[]): Promise<void> => {
    try {
      const rental = rentals.find(r => r.id === rentalId);
      if (!rental) throw new Error('Rental not found');

      rental.status = 'Concluído';

      // Update stock based on returns
      returns.forEach(ret => {
        const item = items.find(i => i.id === ret.itemId);
        if (item) {
            item.estoque_limpo += ret.limpo;
            item.estoque_sujo += ret.sujo;
            item.estoque_manutencao += ret.quebrado;
        }
      });

      // Save
      save('rental_data', rentals);
      save('rental_items', items);
    } catch (error) {
      console.error('Error during check-in:', error);
      throw error;
    }
  },

  // Clean items (async)
  cleanItem: async (itemId: string, qty: number): Promise<void> => {
    try {
      const item = items.find(i => i.id === itemId);
      if (!item) throw new Error('Item not found');

      if (item.estoque_sujo >= qty) {
        item.estoque_sujo -= qty;
        item.estoque_limpo += qty;

        save('rental_items', items);
      } else {
        throw new Error('Quantity exceeds dirty stock');
      }
    } catch (error) {
      console.error('Error cleaning item:', error);
      throw error;
    }
  }
};
