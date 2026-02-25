import { describe, it, expect, beforeEach, vi } from 'vitest';
import { calculateDays, calculateRentalCost } from '../utils/calculations';
import { dataService } from './dataService';
import { Item, Aluguel } from '../types';

describe('Calculations Utils', () => {
  it('should calculate days correctly', () => {
    // Same day
    expect(calculateDays('2023-10-25', '2023-10-25')).toBe(1);
    // Next day
    expect(calculateDays('2023-10-25', '2023-10-26')).toBe(1);
    // 3 days later
    expect(calculateDays('2023-10-25', '2023-10-28')).toBe(3);
    // Cross month
    expect(calculateDays('2023-10-31', '2023-11-02')).toBe(2);
  });

  it('should calculate rental cost correctly', () => {
    // 10.0 * 2 * 1
    expect(calculateRentalCost(10.0, 2, 1)).toBe(20.0);
    // 5.0 * 5 * 3
    expect(calculateRentalCost(5.0, 5, 3)).toBe(75.0);
  });
});

describe('Data Service', () => {
  // Clear localStorage before each test to ensure fresh state
  // Note: dataService holds state in memory variables initialized from LS on import.
  // Ideally, we'd expose a reset method, but for now we can rely on isolation or just careful state management.
  // Since `dataService` uses module-level variables initialized once, we might need to rely on the fact that Vitest isolates test files,
  // OR we simply accept that we are mutating state.

  // Actually, standard Vitest runs in a worker, but module state persists within that worker.
  // Let's assume we are testing the *logic* mainly.

  it('should validate stock prevents rental', async () => {
    const items = await dataService.getItems();
    const item = items[0]; // Mesa Plástica, stock 50
    const currentStock = item.estoque_limpo;

    const rental: Aluguel = {
        id: 'test-1',
        cliente_nome: 'Test',
        telefone: '123',
        endereco: 'Test',
        data_entrega: '2023-10-25',
        hora_entrega: '10:00',
        data_retirada: '2023-10-26',
        hora_retirada: '10:00',
        valor_total: 100,
        status: 'Ativo'
    };

    // Try to rent more than stock
    const excessiveQty = currentStock + 10;

    await expect(dataService.saveRental(rental, [{ item, qty: excessiveQty }]))
        .rejects
        .toThrow(/Insufficient stock/);
  });

  it('should move items on return (check-in)', async () => {
    const items = await dataService.getItems();
    // Find an item with plenty of stock
    const item = items[1]; // Cadeira
    const initialClean = item.estoque_limpo;
    const initialDirty = item.estoque_sujo;
    const initialBroken = item.estoque_manutencao;

    const rental: Aluguel = {
        id: 'test-return',
        cliente_nome: 'Return Test',
        telefone: '123',
        endereco: 'Addr',
        data_entrega: '2023-10-25',
        hora_entrega: '10:00',
        data_retirada: '2023-10-26',
        hora_retirada: '10:00',
        valor_total: 50,
        status: 'Ativo'
    };

    // 1. Rent 5 items
    await dataService.saveRental(rental, [{ item, qty: 5 }]);

    // Check stock decremented
    expect(item.estoque_limpo).toBe(initialClean - 5);

    // 2. Check-in: 2 Clean, 2 Dirty, 1 Broken
    await dataService.checkInRental('test-return', [{
        itemId: item.id,
        limpo: 2,
        sujo: 2,
        quebrado: 1
    }]);

    // 3. Verify final stock
    // Clean: (initial - 5) + 2
    expect(item.estoque_limpo).toBe(initialClean - 3);
    // Dirty: initial + 2
    expect(item.estoque_sujo).toBe(initialDirty + 2);
    // Broken: initial + 1
    expect(item.estoque_manutencao).toBe(initialBroken + 1);
  });
});
