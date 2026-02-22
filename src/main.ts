import './style.css';
import { mockAlugueis, mockItems, mockItensAlugados, saveState } from './store';
import { Aluguel } from './types';
import { renderNewRental } from './newRental';
import { renderCheckIn } from './checkIn';
import { renderCleaning } from './cleaning';

// Constants
const TODAY = '2023-10-25';

// URL Generation Functions
export function generateSingleRouteUrl(address: string): string {
  return `https://www.google.com/maps/dir/?api=1&origin=Meu+Local&destination=${encodeURIComponent(address)}&travelmode=driving`;
}

export function generateMultiStopUrl(addresses: string[]): string {
  if (addresses.length === 0) return '#';
  if (addresses.length === 1) return generateSingleRouteUrl(addresses[0]);

  const destination = addresses[addresses.length - 1];
  const waypoints = addresses.slice(0, -1).map(addr => encodeURIComponent(addr)).join('|');

  return `https://www.google.com/maps/dir/?api=1&origin=Meu+Local&destination=${encodeURIComponent(destination)}&waypoints=${waypoints}&travelmode=driving`;
}

// Render Logic
function renderDashboard() {
  const app = document.getElementById('app');
  if (!app) return;

  // Filter rentals for "Today"
  const todaysRentals = mockAlugueis
    .filter(rental => rental.data_entrega === TODAY && rental.status === 'Ativo')
    .sort((a, b) => a.hora_entrega.localeCompare(b.hora_entrega));

  // Clear app
  app.innerHTML = '';

  // Header
  const header = document.createElement('header');
  header.className = 'w-full bg-purple-600 text-white p-4 flex justify-between items-center shadow-md sticky top-0 z-10';
  header.innerHTML = `
    <button id="cleaning-btn" class="text-white hover:text-purple-200 text-sm font-bold bg-purple-700 px-3 py-1 rounded">
        Limpeza
    </button>
    <div class="text-center">
        <h1 class="text-xl font-bold">Entregas de Hoje</h1>
        <p class="text-sm opacity-90">${TODAY}</p>
    </div>
    <button id="new-rental-btn" class="text-white hover:text-purple-200">
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
    </button>
  `;
  app.appendChild(header);

  // List Container
  const listContainer = document.createElement('div');
  listContainer.className = 'w-full max-w-md p-4 space-y-4 flex-1 pb-20';
  app.appendChild(listContainer);

  if (todaysRentals.length === 0) {
    listContainer.innerHTML = '<p class="text-center text-gray-500 mt-10">Nenhuma entrega para hoje.</p>';
  } else {
      // Render Rental Cards
      todaysRentals.forEach(rental => {
        const card = document.createElement('div');
        card.className = 'bg-white border border-gray-200 rounded-lg shadow-sm p-4 flex flex-col gap-3';

        card.innerHTML = `
          <div class="flex justify-between items-start">
            <div>
                <h2 class="font-bold text-lg text-gray-800">${rental.cliente_nome}</h2>
                <p class="text-gray-600 text-sm">${rental.endereco}</p>
            </div>
            <span class="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-1 rounded">
                ${rental.hora_entrega}
            </span>
          </div>
          <div class="mt-2 flex gap-2">
             <a href="${generateSingleRouteUrl(rental.endereco)}" target="_blank"
                class="flex-1 block text-center bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded transition-colors">
                Traçar Rota
             </a>
             <button data-rental-id="${rental.id}"
                class="flex-1 checkin-btn block text-center bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded transition-colors">
                Check-in
             </button>
          </div>
          <button data-rental-id="${rental.id}"
            class="cancel-btn w-full mt-2 text-center text-red-500 hover:text-red-700 hover:bg-red-50 font-medium py-2 px-4 rounded border border-transparent hover:border-red-200 transition-colors text-sm">
            Cancelar Aluguel
          </button>
        `;
        listContainer.appendChild(card);
      });
  }

  // "Ver Rota do Dia" Button (Footer)
  const footer = document.createElement('div');
  footer.className = 'w-full p-4 bg-white border-t border-gray-200 sticky bottom-0';

  const allAddresses = todaysRentals.map(r => r.endereco);
  const multiStopUrl = generateMultiStopUrl(allAddresses);

  footer.innerHTML = `
    <a href="${multiStopUrl}" target="_blank"
       class="block w-full max-w-md mx-auto text-center bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg transition-colors">
       Ver Rota do Dia (${todaysRentals.length} paradas)
    </a>
  `;
  app.appendChild(footer);

  // Event Listeners
  document.getElementById('new-rental-btn')?.addEventListener('click', () => {
    if (app) renderNewRental(app, renderDashboard);
  });

  document.getElementById('cleaning-btn')?.addEventListener('click', () => {
    if (app) renderCleaning(app, renderDashboard);
  });

  const checkinButtons = document.querySelectorAll('.checkin-btn');
  checkinButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        const rentalId = (e.target as HTMLElement).dataset.rentalId;
        const rental = mockAlugueis.find(r => r.id === rentalId);
        if (app && rental) renderCheckIn(app, rental, renderDashboard);
    });
  });

  const cancelButtons = document.querySelectorAll('.cancel-btn');
  cancelButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        const rentalId = (e.target as HTMLElement).dataset.rentalId;
        const rental = mockAlugueis.find(r => r.id === rentalId);
        if (!rental) return;

        if (confirm(`Tem certeza que deseja CANCELAR o aluguel de ${rental.cliente_nome}?`)) {
            // Restore Stock
            const rentedItems = mockItensAlugados.filter(ia => ia.aluguel_id === rental.id);
            rentedItems.forEach(ri => {
                const item = mockItems.find(i => i.id === ri.item_id);
                if (item) {
                    item.estoque_limpo += ri.quantidade;
                }
            });

            // Update Status
            rental.status = 'Cancelado';

            // Save State
            saveState();

            alert('Aluguel cancelado com sucesso! Itens devolvidos ao estoque.');
            renderDashboard(); // Re-render to remove from list
        }
    });
  });
}

// Init
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', renderDashboard);
}
