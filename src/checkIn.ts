import { Aluguel } from './types';
import { mockItems, mockItensAlugados, saveState } from './store';

export function renderCheckIn(container: HTMLElement, rental: Aluguel, onBack: () => void) {
  container.innerHTML = '';

  // Get rented items
  const rentedItems = mockItensAlugados.filter(ia => ia.aluguel_id === rental.id);

  // Header
  const header = document.createElement('header');
  header.className = 'w-full bg-purple-600 text-white p-4 flex justify-between items-center shadow-md sticky top-0 z-10';
  header.innerHTML = `
    <button id="back-btn" class="bg-purple-700 hover:bg-purple-800 text-white font-bold py-1 px-3 rounded">
      &larr; Voltar
    </button>
    <h1 class="text-xl font-bold">Check-in de Retorno</h1>
    <div class="w-16"></div> <!-- Spacer -->
  `;
  container.appendChild(header);

  // Info Section
  const info = document.createElement('div');
  info.className = 'w-full max-w-md p-4 bg-purple-50 border-b border-purple-100';
  info.innerHTML = `
    <h2 class="font-bold text-lg text-purple-900">${rental.cliente_nome}</h2>
    <p class="text-sm text-purple-700">Entregue em: ${rental.data_entrega}</p>
  `;
  container.appendChild(info);

  // Items List
  const listContainer = document.createElement('div');
  listContainer.className = 'w-full max-w-md p-4 space-y-6 pb-20';
  container.appendChild(listContainer);

  rentedItems.forEach(ri => {
    const item = mockItems.find(i => i.id === ri.item_id);
    if (!item) return;

    const itemCard = document.createElement('div');
    itemCard.className = 'bg-white border border-gray-200 rounded-lg shadow-sm p-4';
    itemCard.innerHTML = `
      <div class="flex items-center gap-4 mb-3">
        <img src="${item.foto}" alt="${item.nome}" class="w-12 h-12 rounded object-cover bg-gray-100">
        <div>
            <h3 class="font-bold text-gray-800">${item.nome}</h3>
            <p class="text-sm text-gray-500">Alugado: <span class="font-bold text-gray-800">${ri.quantidade}</span></p>
        </div>
      </div>

      <div class="grid grid-cols-3 gap-2 text-center text-sm">
        <div>
            <label class="block text-green-600 font-bold mb-1">Limpo</label>
            <input type="number" min="0" max="${ri.quantidade}" value="${ri.quantidade}" data-type="limpo" data-id="${ri.id}" class="w-full p-2 border rounded text-center input-checkin">
        </div>
        <div>
            <label class="block text-yellow-600 font-bold mb-1">Sujo</label>
            <input type="number" min="0" max="${ri.quantidade}" value="0" data-type="sujo" data-id="${ri.id}" class="w-full p-2 border rounded text-center input-checkin">
        </div>
        <div>
            <label class="block text-red-600 font-bold mb-1">Quebrado</label>
            <input type="number" min="0" max="${ri.quantidade}" value="0" data-type="quebrado" data-id="${ri.id}" class="w-full p-2 border rounded text-center input-checkin">
        </div>
      </div>
      <p id="error-${ri.id}" class="text-xs text-red-600 font-bold mt-2 hidden text-center">Soma incorreta! Total deve ser ${ri.quantidade}</p>
    `;
    listContainer.appendChild(itemCard);
  });

  // Footer Actions
  const footer = document.createElement('div');
  footer.className = 'fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-lg';
  footer.innerHTML = `
    <button id="finish-checkin" class="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg shadow transition-colors">
        Finalizar Check-in
    </button>
  `;
  container.appendChild(footer);

  // Logic
  const inputs = document.querySelectorAll('.input-checkin');
  const finishBtn = document.getElementById('finish-checkin') as HTMLButtonElement;
  const backBtn = document.getElementById('back-btn');

  backBtn?.addEventListener('click', onBack);

  function validate() {
    let isValid = true;
    rentedItems.forEach(ri => {
        const limpoInput = document.querySelector(`input[data-id="${ri.id}"][data-type="limpo"]`) as HTMLInputElement;
        const sujoInput = document.querySelector(`input[data-id="${ri.id}"][data-type="sujo"]`) as HTMLInputElement;
        const quebradoInput = document.querySelector(`input[data-id="${ri.id}"][data-type="quebrado"]`) as HTMLInputElement;
        const errorMsg = document.getElementById(`error-${ri.id}`);

        const limpo = parseInt(limpoInput.value || '0');
        const sujo = parseInt(sujoInput.value || '0');
        const quebrado = parseInt(quebradoInput.value || '0');

        if (limpo + sujo + quebrado !== ri.quantidade) {
            isValid = false;
            if (errorMsg) errorMsg.classList.remove('hidden');
            limpoInput.classList.add('border-red-500');
            sujoInput.classList.add('border-red-500');
            quebradoInput.classList.add('border-red-500');
        } else {
            if (errorMsg) errorMsg.classList.add('hidden');
            limpoInput.classList.remove('border-red-500');
            sujoInput.classList.remove('border-red-500');
            quebradoInput.classList.remove('border-red-500');
        }
    });
    finishBtn.disabled = !isValid;
    finishBtn.classList.toggle('opacity-50', !isValid);
    finishBtn.classList.toggle('cursor-not-allowed', !isValid);
  }

  inputs.forEach(input => input.addEventListener('input', validate));

  finishBtn.addEventListener('click', () => {
    // Update Stock
    rentedItems.forEach(ri => {
        const item = mockItems.find(i => i.id === ri.item_id);
        if (!item) return;

        const limpo = parseInt((document.querySelector(`input[data-id="${ri.id}"][data-type="limpo"]`) as HTMLInputElement).value || '0');
        const sujo = parseInt((document.querySelector(`input[data-id="${ri.id}"][data-type="sujo"]`) as HTMLInputElement).value || '0');
        const quebrado = parseInt((document.querySelector(`input[data-id="${ri.id}"][data-type="quebrado"]`) as HTMLInputElement).value || '0');

        // Logic Note: Assuming rental deducted from 'estoque_limpo' previously.
        // If it didn't, this logic adds to the pool.
        // Assuming simplistic model: Just add back to pools.
        item.estoque_limpo += limpo;
        item.estoque_sujo += sujo;
        item.estoque_manutencao += quebrado;
    });

    // Update Rental Status
    rental.status = 'Concluído';

    // Save State
    saveState();

    // Show Alert and Go Back
    alert('Check-in realizado com sucesso! Estoque atualizado.');
    onBack();
  });
}
