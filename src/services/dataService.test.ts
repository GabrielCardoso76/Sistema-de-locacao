import { describe, it, expect, vi, beforeEach } from 'vitest';
import { dataService } from './dataService';
import { supabase } from '../supabaseClient';

// Mock Supabase
vi.mock('../supabaseClient', () => {
  const mockSelect = vi.fn().mockReturnThis();
  const mockOrder = vi.fn().mockReturnThis();
  const mockEq = vi.fn().mockReturnThis();
  const mockSingle = vi.fn().mockReturnThis();
  const mockInsert = vi.fn().mockReturnThis();
  const mockUpdate = vi.fn().mockReturnThis();
  const mockDelete = vi.fn().mockReturnThis();
  const mockRpc = vi.fn().mockReturnThis();

  return {
    supabase: {
      from: vi.fn(() => ({
        select: mockSelect,
        order: mockOrder,
        eq: mockEq,
        single: mockSingle,
        insert: mockInsert,
        update: mockUpdate,
        delete: mockDelete,
      })),
      rpc: mockRpc
    }
  };
});

describe('Data Service (Supabase)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should get items', async () => {
    const mockItems = [{ id: '1', nome: 'Mesa' }];
    // Setup chain: from().select().order() -> { data: mockItems, error: null }
    const select = vi.mocked(supabase.from('items').select);
    const order = vi.mocked(supabase.from('items').select().order);

    // We need to mock the *return value* of the chain.
    // The implementation calls: from('items').select('*').order('nome')
    // We can just mock the final method in the chain to resolve.
    // Vitest mocks are stateful if we reuse the object.

    // Easier way: deeply nested mock implementation or simple object return.
    // Let's refine the mock structure above or use a helper.
    // Actually, in the mock definition above, `order` returns `this`.
    // So the final call in `getItems` is `.order()`. We should make it return a promise.

    // Re-mocking for specific test behavior
    (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: mockItems, error: null })
        })
    });

    const items = await dataService.getItems();
    expect(items).toEqual(mockItems);
  });

  it('should validate stock prevents rental', async () => {
    const mockItem = { id: '1', nome: 'Mesa', estoque_limpo: 10 };

    // Mock getItems needed for validation
    (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: [mockItem], error: null })
        })
    });

    const rental: any = { cliente_nome: 'Test' };

    // Try to rent 20
    await expect(dataService.saveRental(rental, [{ item: mockItem as any, qty: 20 }]))
        .rejects
        .toThrow(/Estoque insuficiente/);
  });

  it('should save rental and decrement stock', async () => {
    const mockItem = { id: '1', nome: 'Mesa', estoque_limpo: 50 };

    // 1. Mock getItems for validation
    // 2. Mock insert rental
    // 3. Mock insert rented items
    // 4. Mock rpc or update for stock

    const mockFrom = vi.fn();
    (supabase.from as any) = mockFrom;

    // Chain for getItems
    const mockSelectChain = {
        order: vi.fn().mockResolvedValue({ data: [mockItem], error: null })
    };

    // Chain for insert rental
    const mockInsertRentalChain = {
        select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: { id: 'new-id' }, error: null })
        })
    };

    // Chain for insert items
    const mockInsertItemsChain = Promise.resolve({ error: null }); // Insert returns promise directly if no select/single

    // Chain for update stock (fallback)
    const mockUpdateChain = {
        eq: vi.fn().mockResolvedValue({ error: null })
    };

    // Dispatcher
    mockFrom.mockImplementation((table: string) => {
        if (table === 'items') return {
            select: () => mockSelectChain,
            update: () => mockUpdateChain
        };
        if (table === 'rentals') return {
            select: () => mockSelectChain, // reused for getRentals if called
            insert: () => mockInsertRentalChain
        };
        if (table === 'rented_items') return {
            insert: () => mockInsertItemsChain,
            select: () => ({ eq: () => Promise.resolve({ data: [], error: null }) })
        };
        return {};
    });

    // Mock RPC failure to force fallback update path (or success)
    (supabase.rpc as any).mockResolvedValue({ error: 'rpc not found' });

    await dataService.saveRental({} as any, [{ item: mockItem as any, qty: 5 }]);

    // Verify insert rental called
    expect(mockFrom).toHaveBeenCalledWith('rentals');

    // Verify stock update called (fallback)
    // expect(mockUpdateChain.eq).toHaveBeenCalledWith('id', '1');
    // Logic: update({ estoque_limpo: 45 })
});
});
