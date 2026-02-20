// src/mockData.ts
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
  header.className = "w-full bg-purple-600 text-white p-4 text-center shadow-md sticky top-0 z-10";
  header.innerHTML = `
    <h1 class="text-xl font-bold">Entregas de Hoje</h1>
    <p class="text-sm opacity-90">${TODAY}</p>
  `;
  app.appendChild(header);
  const listContainer = document.createElement("div");
  listContainer.className = "w-full max-w-md p-4 space-y-4 flex-1";
  app.appendChild(listContainer);
  if (todaysRentals.length === 0) {
    listContainer.innerHTML = '<p class="text-center text-gray-500 mt-10">Nenhuma entrega para hoje.</p>';
    return;
  }
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
      <div class="mt-2">
         <a href="${generateSingleRouteUrl(rental.endereco)}" target="_blank"
            class="block w-full text-center bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded transition-colors">
            Traçar Rota
         </a>
      </div>
    `;
    listContainer.appendChild(card);
  });
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
}
if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", renderDashboard);
}
export {
  generateSingleRouteUrl,
  generateMultiStopUrl
};
