// src/mockData.ts
var mockItems = [
  {
    id: "1",
    nome: "Mesa Plástica",
    foto: "https://via.placeholder.com/150",
    estoque_limpo: 50,
    estoque_sujo: 0,
    estoque_manutencao: 2,
    valor_diaria: 10
  },
  {
    id: "2",
    nome: "Cadeira Plástica",
    foto: "https://via.placeholder.com/150",
    estoque_limpo: 200,
    estoque_sujo: 10,
    estoque_manutencao: 5,
    valor_diaria: 5
  },
  {
    id: "3",
    nome: "Tampão de Madeira",
    foto: "https://via.placeholder.com/150",
    estoque_limpo: 20,
    estoque_sujo: 0,
    estoque_manutencao: 1,
    valor_diaria: 15
  },
  {
    id: "4",
    nome: "Toalha de Mesa Roxa",
    foto: "https://via.placeholder.com/150",
    estoque_limpo: 30,
    estoque_sujo: 5,
    estoque_manutencao: 0,
    valor_diaria: 8
  },
  {
    id: "5",
    nome: "Pista de Comida",
    foto: "https://via.placeholder.com/150",
    estoque_limpo: 5,
    estoque_sujo: 0,
    estoque_manutencao: 0,
    valor_diaria: 50
  }
];
var mockAlugueis = [
  {
    id: "1",
    cliente_nome: "Maria Silva",
    telefone: "(11) 99999-9999",
    endereco: "Rua das Flores, 123",
    data_entrega: "2023-10-25",
    hora_entrega: "10:00",
    data_retirada: "2023-10-26",
    hora_retirada: "10:00",
    valor_total: 150,
    status: "Ativo"
  },
  {
    id: "2",
    cliente_nome: "João Santos",
    telefone: "(11) 98888-8888",
    endereco: "Av. Paulista, 1000",
    data_entrega: "2023-10-20",
    hora_entrega: "14:00",
    data_retirada: "2023-10-21",
    hora_retirada: "14:00",
    valor_total: 200,
    status: "Concluído"
  },
  {
    id: "3",
    cliente_nome: "Ana Costa",
    telefone: "(11) 97777-7777",
    endereco: "Rua Augusta, 500",
    data_entrega: "2023-10-30",
    hora_entrega: "09:00",
    data_retirada: "2023-10-31",
    hora_retirada: "09:00",
    valor_total: 100,
    status: "Cancelado"
  },
  {
    id: "4",
    cliente_nome: "Carlos Oliveira",
    telefone: "(11) 96666-6666",
    endereco: "Rua da Consolação, 200",
    data_entrega: "2023-10-25",
    hora_entrega: "11:30",
    data_retirada: "2023-10-26",
    hora_retirada: "11:30",
    valor_total: 80,
    status: "Ativo"
  },
  {
    id: "5",
    cliente_nome: "Fernanda Lima",
    telefone: "(11) 95555-5555",
    endereco: "Rua Haddock Lobo, 300",
    data_entrega: "2023-10-25",
    hora_entrega: "09:00",
    data_retirada: "2023-10-26",
    hora_retirada: "09:00",
    valor_total: 120,
    status: "Ativo"
  }
];
var mockItensAlugados = [
  { id: "1", aluguel_id: "1", item_id: "1", quantidade: 2 },
  { id: "2", aluguel_id: "1", item_id: "2", quantidade: 8 },
  { id: "3", aluguel_id: "2", item_id: "1", quantidade: 4 },
  { id: "4", aluguel_id: "2", item_id: "2", quantidade: 16 },
  { id: "5", aluguel_id: "3", item_id: "5", quantidade: 1 },
  { id: "6", aluguel_id: "4", item_id: "1", quantidade: 1 },
  { id: "7", aluguel_id: "4", item_id: "2", quantidade: 4 },
  { id: "8", aluguel_id: "5", item_id: "3", quantidade: 2 }
];

// src/newRental.ts
var formatCurrency = (value) => {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
};
var calculateDays = (start, end) => {
  if (!start || !end)
    return 1;
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 1;
};
function renderNewRental(container, onBack) {
  container.innerHTML = "";
  const header = document.createElement("header");
  header.className = "w-full bg-purple-600 text-white p-4 flex justify-between items-center shadow-md sticky top-0 z-10";
  header.innerHTML = `
    <button id="back-btn" class="bg-purple-700 hover:bg-purple-800 text-white font-bold py-1 px-3 rounded">
      &larr; Voltar
    </button>
    <h1 class="text-xl font-bold">Novo Aluguel</h1>
    <div class="w-16"></div> <!-- Spacer for centering -->
  `;
  container.appendChild(header);
  const formContainer = document.createElement("div");
  formContainer.className = "w-full max-w-md p-4 space-y-4 pb-20";
  container.appendChild(formContainer);
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
  const itemsList = document.getElementById("items-list");
  mockItems.forEach((item) => {
    const itemRow = document.createElement("div");
    itemRow.className = "flex items-center justify-between bg-gray-50 p-3 rounded border border-gray-200";
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
  const footer = document.createElement("div");
  footer.className = "fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-lg flex flex-col gap-2";
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
  document.getElementById("back-btn")?.addEventListener("click", onBack);
  const inputs = document.querySelectorAll("input");
  const qtyInputs = document.querySelectorAll(".item-qty");
  const totalValueEl = document.getElementById("total-value");
  const totalDaysEl = document.getElementById("total-days");
  const saveBtn = document.getElementById("save-btn");
  function recalculate() {
    const start = document.getElementById("data_entrega").value;
    const end = document.getElementById("data_retirada").value;
    const days = calculateDays(start, end);
    if (totalDaysEl)
      totalDaysEl.textContent = days.toString();
    let total = 0;
    let hasError = false;
    qtyInputs.forEach((input) => {
      const qty = parseInt(input.value || "0");
      const price = parseFloat(input.dataset.price);
      const stock = parseInt(input.dataset.stock);
      const id = input.dataset.id;
      const errorSpan = document.getElementById(`error-${id}`);
      if (qty > stock) {
        if (errorSpan)
          errorSpan.classList.remove("hidden");
        input.classList.add("border-red-500");
        hasError = true;
      } else {
        if (errorSpan)
          errorSpan.classList.add("hidden");
        input.classList.remove("border-red-500");
      }
      total += qty * price * days;
    });
    if (totalValueEl)
      totalValueEl.textContent = formatCurrency(total);
    const name = document.getElementById("cliente_nome").value;
    const phone = document.getElementById("telefone").value;
    if (saveBtn) {
      saveBtn.disabled = hasError || total === 0 || !name || !phone || !start || !end;
    }
  }
  inputs.forEach((input) => input.addEventListener("input", recalculate));
  saveBtn?.addEventListener("click", () => {
    const nome = document.getElementById("cliente_nome").value;
    const telefone = document.getElementById("telefone").value;
    const endereco = document.getElementById("endereco").value;
    const data_entrega = document.getElementById("data_entrega").value;
    const hora_entrega = document.getElementById("hora_entrega").value;
    const data_retirada = document.getElementById("data_retirada").value;
    const hora_retirada = document.getElementById("hora_retirada").value;
    const days = calculateDays(data_entrega, data_retirada);
    let total = 0;
    const items = [];
    qtyInputs.forEach((input) => {
      const qty = parseInt(input.value || "0");
      if (qty > 0) {
        const item = mockItems.find((i) => i.id === input.dataset.id);
        if (item) {
          total += qty * item.valor_diaria * days;
          items.push({ item, qty });
        }
      }
    });
    const newRental = {
      id: (mockAlugueis.length + 1).toString(),
      cliente_nome: nome,
      telefone,
      endereco,
      data_entrega,
      hora_entrega,
      data_retirada,
      hora_retirada,
      valor_total: total,
      status: "Ativo"
    };
    mockAlugueis.push(newRental);
    items.forEach(({ item, qty }) => {
      item.estoque_limpo -= qty;
      mockItensAlugados.push({
        id: (mockItensAlugados.length + 1).toString(),
        aluguel_id: newRental.id,
        item_id: item.id,
        quantidade: qty
      });
    });
    showSuccess(container, newRental, items, onBack);
  });
}
function showSuccess(container, rental, items, onBack) {
  container.innerHTML = "";
  const itemsListText = items.map((i) => `- ${i.qty}x ${i.item.nome}`).join("%0A");
  const message = `Olá ${rental.cliente_nome}, confirmação do aluguel:%0A%0A` + `\uD83D\uDCC5 Entrega: ${rental.data_entrega} às ${rental.hora_entrega}%0A` + `\uD83D\uDCCD Endereço: ${rental.endereco}%0A` + `\uD83D\uDCDD Itens:%0A${itemsListText}%0A` + `\uD83D\uDCB0 Total: ${formatCurrency(rental.valor_total)}%0A%0A` + `Obrigado!`;
  const phone = rental.telefone.replace(/\D/g, "");
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
  document.getElementById("finish-btn")?.addEventListener("click", onBack);
}

// src/checkIn.ts
function renderCheckIn(container, rental, onBack) {
  container.innerHTML = "";
  const rentedItems = mockItensAlugados.filter((ia) => ia.aluguel_id === rental.id);
  const header = document.createElement("header");
  header.className = "w-full bg-purple-600 text-white p-4 flex justify-between items-center shadow-md sticky top-0 z-10";
  header.innerHTML = `
    <button id="back-btn" class="bg-purple-700 hover:bg-purple-800 text-white font-bold py-1 px-3 rounded">
      &larr; Voltar
    </button>
    <h1 class="text-xl font-bold">Check-in de Retorno</h1>
    <div class="w-16"></div> <!-- Spacer -->
  `;
  container.appendChild(header);
  const info = document.createElement("div");
  info.className = "w-full max-w-md p-4 bg-purple-50 border-b border-purple-100";
  info.innerHTML = `
    <h2 class="font-bold text-lg text-purple-900">${rental.cliente_nome}</h2>
    <p class="text-sm text-purple-700">Entregue em: ${rental.data_entrega}</p>
  `;
  container.appendChild(info);
  const listContainer = document.createElement("div");
  listContainer.className = "w-full max-w-md p-4 space-y-6 pb-20";
  container.appendChild(listContainer);
  rentedItems.forEach((ri) => {
    const item = mockItems.find((i) => i.id === ri.item_id);
    if (!item)
      return;
    const itemCard = document.createElement("div");
    itemCard.className = "bg-white border border-gray-200 rounded-lg shadow-sm p-4";
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
  const footer = document.createElement("div");
  footer.className = "fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-lg";
  footer.innerHTML = `
    <button id="finish-checkin" class="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg shadow transition-colors">
        Finalizar Check-in
    </button>
  `;
  container.appendChild(footer);
  const inputs = document.querySelectorAll(".input-checkin");
  const finishBtn = document.getElementById("finish-checkin");
  const backBtn = document.getElementById("back-btn");
  backBtn?.addEventListener("click", onBack);
  function validate() {
    let isValid = true;
    rentedItems.forEach((ri) => {
      const limpoInput = document.querySelector(`input[data-id="${ri.id}"][data-type="limpo"]`);
      const sujoInput = document.querySelector(`input[data-id="${ri.id}"][data-type="sujo"]`);
      const quebradoInput = document.querySelector(`input[data-id="${ri.id}"][data-type="quebrado"]`);
      const errorMsg = document.getElementById(`error-${ri.id}`);
      const limpo = parseInt(limpoInput.value || "0");
      const sujo = parseInt(sujoInput.value || "0");
      const quebrado = parseInt(quebradoInput.value || "0");
      if (limpo + sujo + quebrado !== ri.quantidade) {
        isValid = false;
        if (errorMsg)
          errorMsg.classList.remove("hidden");
        limpoInput.classList.add("border-red-500");
        sujoInput.classList.add("border-red-500");
        quebradoInput.classList.add("border-red-500");
      } else {
        if (errorMsg)
          errorMsg.classList.add("hidden");
        limpoInput.classList.remove("border-red-500");
        sujoInput.classList.remove("border-red-500");
        quebradoInput.classList.remove("border-red-500");
      }
    });
    finishBtn.disabled = !isValid;
    finishBtn.classList.toggle("opacity-50", !isValid);
    finishBtn.classList.toggle("cursor-not-allowed", !isValid);
  }
  inputs.forEach((input) => input.addEventListener("input", validate));
  finishBtn.addEventListener("click", () => {
    rentedItems.forEach((ri) => {
      const item = mockItems.find((i) => i.id === ri.item_id);
      if (!item)
        return;
      const limpo = parseInt(document.querySelector(`input[data-id="${ri.id}"][data-type="limpo"]`).value || "0");
      const sujo = parseInt(document.querySelector(`input[data-id="${ri.id}"][data-type="sujo"]`).value || "0");
      const quebrado = parseInt(document.querySelector(`input[data-id="${ri.id}"][data-type="quebrado"]`).value || "0");
      item.estoque_limpo += limpo;
      item.estoque_sujo += sujo;
      item.estoque_manutencao += quebrado;
    });
    rental.status = "Concluído";
    alert("Check-in realizado com sucesso! Estoque atualizado.");
    onBack();
  });
}

// src/cleaning.ts
function renderCleaning(container, onBack) {
  container.innerHTML = "";
  const header = document.createElement("header");
  header.className = "w-full bg-purple-600 text-white p-4 flex justify-between items-center shadow-md sticky top-0 z-10";
  header.innerHTML = `
    <button id="back-btn-cleaning" class="bg-purple-700 hover:bg-purple-800 text-white font-bold py-1 px-3 rounded">
      &larr; Voltar
    </button>
    <h1 class="text-xl font-bold">Limpeza</h1>
    <div class="w-16"></div> <!-- Spacer -->
  `;
  container.appendChild(header);
  const listContainer = document.createElement("div");
  listContainer.className = "w-full max-w-md p-4 space-y-6 pb-20";
  container.appendChild(listContainer);
  const dirtyItems = mockItems.filter((i) => i.estoque_sujo > 0);
  if (dirtyItems.length === 0) {
    listContainer.innerHTML = '<p class="text-center text-gray-500 mt-10">Nenhum item sujo no estoque.</p>';
  }
  dirtyItems.forEach((item) => {
    const itemCard = document.createElement("div");
    itemCard.className = "bg-white border border-gray-200 rounded-lg shadow-sm p-4 flex flex-col gap-3";
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
  document.getElementById("back-btn-cleaning")?.addEventListener("click", onBack);
  const cleanButtons = document.querySelectorAll(".btn-clean");
  cleanButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = e.target.dataset.id;
      if (!id)
        return;
      const input = document.getElementById(`clean-qty-${id}`);
      const qty = parseInt(input.value || "0");
      const item = mockItems.find((i) => i.id === id);
      if (item && qty > 0 && qty <= item.estoque_sujo) {
        item.estoque_sujo -= qty;
        item.estoque_limpo += qty;
        alert(`${qty}x ${item.nome} marcados como limpos!`);
        renderCleaning(container, onBack);
      } else {
        alert("Quantidade inválida.");
      }
    });
  });
}

// src/dashboard.ts
var TODAY = "2023-10-25";
function generateSingleRouteUrl(address) {
  return `https://www.google.com/maps/dir/?api=1&origin=Meu+Local&destination=${encodeURIComponent(address)}&travelmode=driving`;
}
function generateMultiStopUrl(addresses) {
  if (addresses.length === 0)
    return "#";
  if (addresses.length === 1)
    return generateSingleRouteUrl(addresses[0]);
  const destination = addresses[addresses.length - 1];
  const waypoints = addresses.slice(0, -1).map((addr) => encodeURIComponent(addr)).join("|");
  return `https://www.google.com/maps/dir/?api=1&origin=Meu+Local&destination=${encodeURIComponent(destination)}&waypoints=${waypoints}&travelmode=driving`;
}
function renderDashboard() {
  const app = document.getElementById("app");
  if (!app)
    return;
  const todaysRentals = mockAlugueis.filter((rental) => rental.data_entrega === TODAY && rental.status === "Ativo").sort((a, b) => a.hora_entrega.localeCompare(b.hora_entrega));
  app.innerHTML = "";
  const header = document.createElement("header");
  header.className = "w-full bg-purple-600 text-white p-4 flex justify-between items-center shadow-md sticky top-0 z-10";
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
  const listContainer = document.createElement("div");
  listContainer.className = "w-full max-w-md p-4 space-y-4 flex-1 pb-20";
  app.appendChild(listContainer);
  if (todaysRentals.length === 0) {
    listContainer.innerHTML = '<p class="text-center text-gray-500 mt-10">Nenhuma entrega para hoje.</p>';
  } else {
    todaysRentals.forEach((rental) => {
      const card = document.createElement("div");
      card.className = "bg-white border border-gray-200 rounded-lg shadow-sm p-4 flex flex-col gap-3";
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
  const footer = document.createElement("div");
  footer.className = "w-full p-4 bg-white border-t border-gray-200 sticky bottom-0";
  const allAddresses = todaysRentals.map((r) => r.endereco);
  const multiStopUrl = generateMultiStopUrl(allAddresses);
  footer.innerHTML = `
    <a href="${multiStopUrl}" target="_blank"
       class="block w-full max-w-md mx-auto text-center bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg transition-colors">
       Ver Rota do Dia (${todaysRentals.length} paradas)
    </a>
  `;
  app.appendChild(footer);
  document.getElementById("new-rental-btn")?.addEventListener("click", () => {
    if (app)
      renderNewRental(app, renderDashboard);
  });
  document.getElementById("cleaning-btn")?.addEventListener("click", () => {
    if (app)
      renderCleaning(app, renderDashboard);
  });
  const checkinButtons = document.querySelectorAll(".checkin-btn");
  checkinButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const rentalId = e.target.dataset.rentalId;
      const rental = mockAlugueis.find((r) => r.id === rentalId);
      if (app && rental)
        renderCheckIn(app, rental, renderDashboard);
    });
  });
  const cancelButtons = document.querySelectorAll(".cancel-btn");
  cancelButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const rentalId = e.target.dataset.rentalId;
      const rental = mockAlugueis.find((r) => r.id === rentalId);
      if (!rental)
        return;
      if (confirm(`Tem certeza que deseja CANCELAR o aluguel de ${rental.cliente_nome}?`)) {
        const rentedItems = mockItensAlugados.filter((ia) => ia.aluguel_id === rental.id);
        rentedItems.forEach((ri) => {
          const item = mockItems.find((i) => i.id === ri.item_id);
          if (item) {
            item.estoque_limpo += ri.quantidade;
          }
        });
        rental.status = "Cancelado";
        alert("Aluguel cancelado com sucesso! Itens devolvidos ao estoque.");
        renderDashboard();
      }
    });
  });
}
if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", renderDashboard);
}
export {
  renderDashboard,
  generateSingleRouteUrl,
  generateMultiStopUrl
};
