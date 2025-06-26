const allMarkers = L.featureGroup(); // Armazena todos os marcadores

// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getDatabase, ref, push, onValue } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-database.js";

// Configuração Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBLwBmnx08jYWkaYCRgw_M3Pdb3i8Qp_w",
  authDomain: "hubiaclientes.firebaseapp.com",
  databaseURL: "https://hubiaclientes-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "hubiaclientes",
  storageBucket: "hubiaclientes.appspot.com",
  messagingSenderId: "953534347408",
  appId: "1:953534347408:web:3ae9aa5208400ba631c73d"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Inicia o mapa
const map = L.map('map').setView([41.15, -8.6], 8);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: 'Map data © OpenStreetMap'
}).addTo(map);

// Cores de status
const statusColors = {
  encontrado: 'blue',
  em_contato: 'orange',
  aguardando: 'yellow',
  sem_interesse: 'gray',
  em_desenvolvimento: 'green'
};

// Função de geocodificação (endereços para coordenadas)
async function geocode(endereco) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(endereco)}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.length ? [parseFloat(data[0].lat), parseFloat(data[0].lon)] : null;
}

// Adiciona marcador no mapa
function addMarker(cliente) {
const marker = L.circleMarker(cliente.coordenadas, {
  color: statusColors[cliente.status],
  radius: 10
}).addTo(map);

allMarkers.addLayer(marker); // 👈 Adiciona no grupo

marker.bindPopup(`
  <strong>${cliente.nome}</strong><br>
  ${cliente.email}<br>
  ${cliente.telefone}<br>
  <em>Status:</em> ${cliente.status}
`);

}

// Salva cliente no Firebase
async function salvarClienteFirebase(cliente) {
  const refClientes = ref(db, 'clientes');
  await push(refClientes, cliente);
}

// Carrega clientes do Firebase e adiciona no mapa
function carregarClientesFirebase() {
  const refClientes = ref(db, 'clientes');
  onValue(refClientes, (snapshot) => {
    const data = snapshot.val();
    if (!data) return;
Object.values(data).forEach(async (cliente) => {
  let coordenadas;

  // Se já tem lat/lng, usa diretamente
  if (cliente.lat && cliente.lng) {
    coordenadas = [parseFloat(cliente.lat), parseFloat(cliente.lng)];
  } else {
    // Caso não tenha, tenta geocodificar pelo endereço
    coordenadas = await geocode(cliente.endereco);
    if (!coordenadas) return;
  }

  addMarker({ ...cliente, coordenadas });
});

  });

  map.fitBounds(allMarkers.getBounds(), { padding: [50, 50] }); // Ajusta o zoom para caber todos os marcadores

}

// Exibe mensagem de sucesso ou erro
function mostrarMensagem(texto, tipo = 'sucesso') {
  const msg = document.createElement("div");
  msg.textContent = texto;
  msg.className = tipo === 'erro' ? "error-message" : "success-message";
  msg.style.position = "fixed";
  msg.style.top = "20px";
  msg.style.right = "20px";
  msg.style.zIndex = "9999";
  msg.style.padding = "12px 20px";
  msg.style.borderRadius = "6px";
  msg.style.backgroundColor = tipo === 'erro' ? "#f8d7da" : "#d4edda";
  msg.style.color = tipo === 'erro' ? "#721c24" : "#155724";
  msg.style.border = tipo === 'erro' ? "1px solid #f5c6cb" : "1px solid #c3e6cb";
  document.body.appendChild(msg);
  setTimeout(() => msg.remove(), 4000);
}

// Evento de envio do formulário
const form = document.getElementById("clienteForm");
form.addEventListener("submit", async (e) => {
  e.preventDefault();

const nome = document.getElementById("nome").value;
const telefone = document.getElementById("telefone").value;
const email = document.getElementById("email").value;
const endereco = document.getElementById("endereco").value;
const numero = document.getElementById("numero").value;
const cidade = document.getElementById("cidade").value;
const cep = document.getElementById("cep").value;
const status = document.getElementById("status").value;

// Monta o endereço completo para geocodificação
const enderecoCompleto = `${endereco}, ${numero}, ${cidade}, ${cep}, Portugal`;

const coordenadas = await geocode(enderecoCompleto);
if (!coordenadas) {
  mostrarMensagem("Endereço não encontrado!", "erro");
  return;
}

const cliente = {
  nome,
  telefone,
  email,
  endereco,
  numero,
  cidade,
  cep,
  status,
  lat: coordenadas[0],
  lng: coordenadas[1]
};


  try {
    await salvarClienteFirebase(cliente);
    addMarker({ ...cliente, coordenadas });
    form.reset();
    mostrarMensagem("Cliente salvo com sucesso!", "sucesso");
  } catch (err) {
    console.error("Erro ao salvar no Firebase:", err);
    mostrarMensagem("Erro ao salvar cliente!", "erro");
  }
});

// Executa no carregamento
carregarClientesFirebase();
