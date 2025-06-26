const form = document.getElementById("clienteForm");
const map = L.map('map').setView([41.15, -8.6], 8); // Norte de Portugal

// Mapa base
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: 'Map data © OpenStreetMap'
}).addTo(map);

// Cores por status
const statusColors = {
  encontrado: 'blue',
  em_contato: 'orange',
  aguardando: 'yellow',
  sem_interesse: 'gray',
  em_desenvolvimento: 'green'
};

// Geocodificador básico usando API do Nominatim
async function geocode(endereco) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(endereco)}`;
  const response = await fetch(url);
  const data = await response.json();
  return data.length ? [parseFloat(data[0].lat), parseFloat(data[0].lon)] : null;
}

// Evento de envio do formulário
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nome = document.getElementById("nome").value;
  const telefone = document.getElementById("telefone").value;
  const email = document.getElementById("email").value;
  const endereco = document.getElementById("endereco").value;
  const status = document.getElementById("status").value;

  const coordenadas = await geocode(endereco);
  if (!coordenadas) {
    alert("Endereço não encontrado!");
    return;
  }

  const cliente = {
    nome,
    telefone,
    email,
    endereco,
    status,
    lat: coordenadas[0],
    lng: coordenadas[1]
  };

  await salvarClienteGoogle(cliente);

  // Renderiza no mapa
  addMarker({ ...cliente, coordenadas });
  form.reset();
});

// Função para adicionar marcador ao mapa
function addMarker(cliente) {
  const marker = L.circleMarker(cliente.coordenadas, {
    color: statusColors[cliente.status],
    radius: 10
  }).addTo(map);

  marker.bindPopup(`
    <strong>${cliente.nome}</strong><br>
    ${cliente.email}<br>
    ${cliente.telefone}<br>
    <em>Status:</em> ${cliente.status}
  `);
}

// Salvar cliente na planilha do Google
async function salvarClienteGoogle(cliente) {
  const url = 'https://script.google.com/macros/s/AKfycbzfGIejwkzMrTR2HoZP_HSw98BRFThkF5k4Ie_PcqhjJ9s_bmNLE6FiM5DRsaQZOl1v/exec';

  try {
    const res = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(cliente),
      headers: { 'Content-Type': 'application/json' }
    });

    const texto = await res.text();
    console.log("Resposta do Google Sheets:", texto);

    if (!res.ok) throw new Error(`Erro ${res.status}`);
  } catch (err) {
    console.error("Erro ao salvar no Google Sheets:", err);
    alert("Erro ao salvar no Google Sheets. Veja o console.");
  }
}

// Carregar todos os clientes salvos do Google Sheets e mostrar no mapa
async function carregarClientesGoogle() {
  const url = 'https://script.google.com/macros/s/AKfycbzfGIejwkzMrTR2HoZP_HSw98BRFThkF5k4Ie_PcqhjJ9s_bmNLE6FiM5DRsaQZOl1v/exec';
  const res = await fetch(url);
  const data = await res.json();

  data.forEach(cliente => {
    const coordenadas = [parseFloat(cliente.lat), parseFloat(cliente.lng)];
    addMarker({ ...cliente, coordenadas });
  });
}

// Chamar no carregamento da página
carregarClientesGoogle();
