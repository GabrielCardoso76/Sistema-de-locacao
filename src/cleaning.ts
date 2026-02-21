import { mockItems } from './mockData';

export function renderCleaning(container: HTMLElement, onBack: () => void) {
  container.innerHTML = '';

  // Header
  const header = document.createElement('header');
  header.className = 'w-full bg-purple-600 text-white p-4 flex justify-between items-center shadow-md sticky top-0 z-10';
  header.innerHTML = `
    <button id="back-btn-cleaning" class="bg-purple-700 hover:bg-purple-800 text-white font-bold py-1 px-3 rounded">
      &larr; Voltar
    </button>
    <h1 class="text-xl font-bold">Limpeza</h1>
    <div class="w-16"></div> <!-- Spacer -->
  `;
  container.appendChild(header);

  // List Container
  const listContainer = document.createElement('div');
  listContainer.className = 'w-full max-w-md p-4 space-y-6 pb-20';
  container.appendChild(listContainer);

  const dirtyItems = mockItems.filter(i => i.estoque_sujo > 0);

  if (dirtyItems.length === 0) {
    listContainer.innerHTML = '<p class="text-center text-gray-500 mt-10">Nenhum item sujo no estoque.</p>';
  }

  dirtyItems.forEach(item => {
    const itemCard = document.createElement('div');
    itemCard.className = 'bg-white border border-gray-200 rounded-lg shadow-sm p-4 flex flex-col gap-3';

    itemCard.innerHTML = `
      <div class="flex items-center gap-4">
        <img src="${item.foto}" alt="${item.nome}" class="w-12 h-12 rounded object-cover bg-gray-100">
        <div>
            <h3 class="font-bold text-gray-800">${item.nome}</h3>
            <p class="text-sm text-yellow-600 font-bold">Sujo: ${item.estoque_sujo}</p>
        </div>
      </div>

      <div class="flex items-center gap-2 mt-2">
        <input type="number" min="1" max="${item.estoque_sujo}" value="${item.estoque_sujo}"
               id="clean-qty-${item.id}" class="w-20 p-2 border rounded text-center">
        <button data-id="${item.id}" class="btn-clean flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition-colors">
            Marcar como Limpo
        </button>
      </div>
    `;
    listContainer.appendChild(itemCard);
  });

  // Logic
  document.getElementById('back-btn-cleaning')?.addEventListener('click', onBack);

  const cleanButtons = document.querySelectorAll('.btn-clean');
  cleanButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        const id = (e.target as HTMLElement).dataset.id;
        if (!id) return;

        const input = document.getElementById(`clean-qty-${id}`) as HTMLInputElement;
        const qty = parseInt(input.value || '0');
        const item = mockItems.find(i => i.id === id);

        if (item && qty > 0 && qty <= item.estoque_sujo) {
            item.estoque_sujo -= qty;
            item.estoque_limpo += qty;
            alert(`${qty}x ${item.nome} marcados como limpos!`);
            renderCleaning(container, onBack); // Re-render to update list
        } else {
            alert('Quantidade inválida.');
        }
    });
  });
}
