import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getDatabase, ref, onValue, remove, update } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-database.js";

// Firebase Config
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
const listaClientes = document.getElementById("listaClientes");
let clientes = [];

function renderizarClientes(lista) {
  listaClientes.innerHTML = "";
  lista.forEach(c => {
    const tr = document.createElement("tr");
    const enderecoCompleto = `${c.endereco}, ${c.numero}, ${c.cidade} - ${c.cep}`;

    tr.innerHTML = `
      <td data-label="Nome">${c.nome}</td>
      <td data-label="Email">${c.email}</td>
      <td data-label="Telefone">${c.telefone}</td>
      <td data-label="Endereço">${enderecoCompleto}</td>
      <td data-label="Status">${c.status}</td>
      <td>
        <button onclick="editarCliente('${c._id}')">✏️</button>
        <button onclick="deletarCliente('${c._id}')">🗑️</button>
      </td>
    `;
    listaClientes.appendChild(tr);
  });
}

function aplicarFiltros() {
  const nome = document.getElementById("filtroNome").value.toLowerCase();
  const endereco = document.getElementById("filtroEndereco").value.toLowerCase();
  const status = document.getElementById("filtroStatus").value;

  const filtrados = clientes.filter(c => {
    return (
      (!nome || c.nome?.toLowerCase().includes(nome)) &&
      (!endereco || c.endereco?.toLowerCase().includes(endereco)) &&
      (!status || c.status === status)
    );
  });

  renderizarClientes(filtrados);
}

function carregarClientesFirebase() {
  const refClientes = ref(db, 'clientes');
  onValue(refClientes, (snapshot) => {
    const data = snapshot.val();
    if (!data) {
      mostrarMensagem("Nenhum cliente encontrado!", "erro");
      return;
    }

    clientes = Object.entries(data).map(([key, val]) => ({ _id: key, ...val }));
    renderizarClientes(clientes);
  }, (err) => {
    console.error("Erro ao buscar dados:", err);
    mostrarMensagem("Erro ao buscar clientes!", "erro");
  });
}

window.deletarCliente = async function(id) {
  if (confirm("Deseja realmente apagar este cliente?")) {
    try {
      await remove(ref(db, `clientes/${id}`));
      mostrarMensagem("Cliente removido com sucesso.");
    } catch (err) {
      console.error("Erro ao deletar:", err);
      mostrarMensagem("Erro ao deletar cliente", "erro");
    }
  }
};

window.editarCliente = function(id) {
  const cliente = clientes.find(c => c._id === id);
  if (!cliente) return;

  const nome = prompt("Editar Nome", cliente.nome);
  const email = prompt("Editar Email", cliente.email);
  const telefone = prompt("Editar Telefone", cliente.telefone);
  const endereco = prompt("Editar Endereço", cliente.endereco);
  const numero = prompt("Editar Número", cliente.numero);
  const cidade = prompt("Editar Cidade", cliente.cidade);
  const cep = prompt("Editar CEP", cliente.cep);
  const status = prompt("Editar Status (ex: encontrado)", cliente.status);

  if (!nome || !email) return;

  const clienteAtualizado = {
    nome, email, telefone, endereco, numero, cidade, cep, status
  };

  update(ref(db, `clientes/${id}`), clienteAtualizado)
    .then(() => mostrarMensagem("Cliente atualizado com sucesso."))
    .catch(err => {
      console.error("Erro ao atualizar:", err);
      mostrarMensagem("Erro ao atualizar cliente", "erro");
    });
};

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

carregarClientesFirebase();
window.aplicarFiltros = aplicarFiltros;
