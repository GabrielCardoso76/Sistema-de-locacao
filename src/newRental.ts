import { Item, Aluguel } from './types';
import { dataService } from './services/dataService';

// Helper to format currency
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

// Helper to calculate days between two dates
const calculateDays = (start: string, end: string): number => {
  if (!start || !end) return 1;
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 1;
};

export async function renderNewRental(container: HTMLElement, onBack: () => void) {
  container.innerHTML = '<p class="text-center mt-10">Carregando...</p>';

  try {
    const items = await dataService.getItems();
    const rentals = await dataService.getRentals(); // Needed for ID generation

    container.innerHTML = '';

    // Header
    const header = document.createElement('header');
    header.className = 'w-full bg-purple-600 text-white p-4 flex justify-between items-center shadow-md sticky top-0 z-10';
    header.innerHTML = `
        <button id="back-btn" class="bg-purple-700 hover:bg-purple-800 text-white font-bold py-1 px-3 rounded">
        &larr; Voltar
        </button>
        <h1 class="text-xl font-bold">Novo Aluguel</h1>
        <div class="w-16"></div> <!-- Spacer for centering -->
    `;
    container.appendChild(header);

    // Form Container
    const formContainer = document.createElement('div');
    formContainer.className = 'w-full max-w-md p-4 space-y-4 pb-20';
    container.appendChild(formContainer);

    // Form Fields
    formContainer.innerHTML = `
        <div class="space-y-3">
        <!-- Customer Info -->
        <div>
            <label class="block text-sm font-medium text-gray-700">Nome do Cliente</label>
            <input type="text" id="cliente_nome" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm p-2 border" placeholder="Nome Completo">
        </div>
        <div>
            <label class="block text-sm font-medium text-gray-700">Telefone (WhatsApp)</label>
            <input type="tel" id="telefone" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm p-2 border" placeholder="(11) 99999-9999">
        </div>
        <div>
            <label class="block text-sm font-medium text-gray-700">Endereço de Entrega</label>
            <input type="text" id="endereco" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm p-2 border" placeholder="Rua, Número, Bairro">
        </div>

        <!-- Dates -->
        <div class="grid grid-cols-2 gap-4">
            <div>
                <label class="block text-sm font-medium text-gray-700">Data Entrega</label>
                <input type="date" id="data_entrega" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm p-2 border">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700">Hora Entrega</label>
                <input type="time" id="hora_entrega" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm p-2 border">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700">Data Retirada</label>
                <input type="date" id="data_retirada" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm p-2 border">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700">Hora Retirada</label>
                <input type="time" id="hora_retirada" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm p-2 border">
            </div>
        </div>

        <!-- Items Section -->
        <div class="mt-6 border-t pt-4">
            <h3 class="text-lg font-bold text-gray-800 mb-2">Itens</h3>
            <div id="items-list" class="space-y-4">
            <!-- Items will be injected here -->
            </div>
        </div>
        </div>
    `;

    // Inject Items
    const itemsList = document.getElementById('items-list');
    items.forEach(item => {
        const itemRow = document.createElement('div');
        itemRow.className = 'flex items-center justify-between bg-gray-50 p-3 rounded border border-gray-200';
        itemRow.innerHTML = `
        <div class="flex-1">
            <p class="font-medium text-gray-900">${item.nome}</p>
            <p class="text-xs text-gray-500">Estoque: ${item.estoque_limpo}</p>
            <p class="text-xs text-purple-600 font-bold">${formatCurrency(item.valor_diaria)}/dia</p>
        </div>
        <div class="flex flex-col items-end">
            <input type="number" min="0" data-id="${item.id}" data-price="${item.valor_diaria}" data-stock="${item.estoque_limpo}"
                class="item-qty w-20 p-1 border rounded text-right focus:ring-purple-500 focus:border-purple-500" placeholder="0">
            <span id="error-${item.id}" class="text-xs text-red-600 font-bold hidden mt-1">Estoque Insuficiente!</span>
        </div>
        `;
        itemsList?.appendChild(itemRow);
    });

    // Footer / Actions
    const footer = document.createElement('div');
    footer.className = 'fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-lg flex flex-col gap-2';
    footer.innerHTML = `
        <div class="flex justify-between items-center mb-2">
            <span class="text-gray-600">Total Estimado (<span id="total-days">1</span> dias):</span>
            <span id="total-value" class="text-xl font-bold text-purple-700">R$ 0,00</span>
        </div>
        <button id="save-btn" class="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg shadow disabled:opacity-50 disabled:cursor-not-allowed">
        Salvar Aluguel
        </button>
    `;
    container.appendChild(footer);

    // Event Listeners
    document.getElementById('back-btn')?.addEventListener('click', onBack);

    const inputs = document.querySelectorAll('input');
    const qtyInputs = document.querySelectorAll('.item-qty');
    const totalValueEl = document.getElementById('total-value');
    const totalDaysEl = document.getElementById('total-days');
    const saveBtn = document.getElementById('save-btn') as HTMLButtonElement;

    function recalculate() {
        const start = (document.getElementById('data_entrega') as HTMLInputElement).value;
        const end = (document.getElementById('data_retirada') as HTMLInputElement).value;
        const days = calculateDays(start, end);
        if (totalDaysEl) totalDaysEl.textContent = days.toString();

        let total = 0;
        let hasError = false;

        qtyInputs.forEach((input: any) => {
        const qty = parseInt(input.value || '0');
        const price = parseFloat(input.dataset.price);
        const stock = parseInt(input.dataset.stock);
        const id = input.dataset.id;
        const errorSpan = document.getElementById(`error-${id}`);

        if (qty > stock) {
            if (errorSpan) errorSpan.classList.remove('hidden');
            input.classList.add('border-red-500');
            hasError = true;
        } else {
            if (errorSpan) errorSpan.classList.add('hidden');
            input.classList.remove('border-red-500');
        }

        total += qty * price * days;
        });

        if (totalValueEl) totalValueEl.textContent = formatCurrency(total);

        // Validate Form Completeness (basic)
        const name = (document.getElementById('cliente_nome') as HTMLInputElement).value;
        const phone = (document.getElementById('telefone') as HTMLInputElement).value;

        if (saveBtn) {
            saveBtn.disabled = hasError || total === 0 || !name || !phone || !start || !end;
        }
    }

    inputs.forEach(input => input.addEventListener('input', recalculate));

    // Save Logic
    saveBtn?.addEventListener('click', async () => {
        saveBtn.disabled = true;
        saveBtn.textContent = 'Salvando...';

        try {
            const nome = (document.getElementById('cliente_nome') as HTMLInputElement).value;
            const telefone = (document.getElementById('telefone') as HTMLInputElement).value;
            const endereco = (document.getElementById('endereco') as HTMLInputElement).value;
            const data_entrega = (document.getElementById('data_entrega') as HTMLInputElement).value;
            const hora_entrega = (document.getElementById('hora_entrega') as HTMLInputElement).value;
            const data_retirada = (document.getElementById('data_retirada') as HTMLInputElement).value;
            const hora_retirada = (document.getElementById('hora_retirada') as HTMLInputElement).value;

            // Calculate total again to be safe
            const days = calculateDays(data_entrega, data_retirada);
            let total = 0;
            const rentedItems: { item: Item, qty: number }[] = [];

            qtyInputs.forEach((input: any) => {
                const qty = parseInt(input.value || '0');
                if (qty > 0) {
                    const item = items.find(i => i.id === input.dataset.id);
                    if (item) {
                        total += qty * item.valor_diaria * days;
                        rentedItems.push({ item, qty });
                    }
                }
            });

            const newRental: Aluguel = {
                id: (rentals.length + 1).toString(), // Using updated rental count
                cliente_nome: nome,
                telefone,
                endereco,
                data_entrega,
                hora_entrega,
                data_retirada,
                hora_retirada,
                valor_total: total,
                status: 'Ativo'
            };

            await dataService.saveRental(newRental, rentedItems);

            showSuccess(container, newRental, rentedItems, onBack);

        } catch (error) {
            console.error("Failed to save rental", error);
            alert('Erro ao salvar aluguel. Tente novamente.');
            saveBtn.disabled = false;
            saveBtn.textContent = 'Salvar Aluguel';
        }
    });

  } catch (error) {
    console.error("Failed to load items", error);
    container.innerHTML = '<p class="text-center text-red-500 mt-10">Erro ao carregar itens.</p>';
  }
}

function showSuccess(container: HTMLElement, rental: Aluguel, items: { item: Item, qty: number }[], onBack: () => void) {
    container.innerHTML = '';

    // WhatsApp Message
    const itemsListText = items.map(i => `- ${i.qty}x ${i.item.nome}`).join('%0A');
    const message = `Olá ${rental.cliente_nome}, confirmação do aluguel:%0A%0A` +
                    `📅 Entrega: ${rental.data_entrega} às ${rental.hora_entrega}%0A` +
                    `📍 Endereço: ${rental.endereco}%0A` +
                    `📝 Itens:%0A${itemsListText}%0A` +
                    `💰 Total: ${formatCurrency(rental.valor_total)}%0A%0A` +
                    `Obrigado!`;

    const phone = rental.telefone.replace(/\D/g, ''); // Remove non-digits
    const waLink = `https://wa.me/55${phone}?text=${message}`;

    container.innerHTML = `
        <div class="min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-6">
            <div class="bg-green-100 p-4 rounded-full">
                <svg class="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
            </div>
            <h2 class="text-2xl font-bold text-gray-800">Aluguel Confirmado!</h2>
            <p class="text-gray-600">O aluguel foi salvo com sucesso.</p>

            <a href="${waLink}" target="_blank" class="w-full max-w-sm bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg shadow flex items-center justify-center gap-2">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                Enviar no WhatsApp
            </a>

            <button id="finish-btn" class="text-purple-600 hover:text-purple-800 font-medium">
                Voltar para o Início
            </button>
        </div>
    `;

    document.getElementById('finish-btn')?.addEventListener('click', onBack);
}
