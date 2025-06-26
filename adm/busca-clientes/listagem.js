let clientes = JSON.parse(localStorage.getItem("clientes") || "[]");
const listaClientes = document.getElementById("listaClientes");

function renderizarClientes(lista) {
  listaClientes.innerHTML = "";
  lista.forEach(c => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${c.nome}</td>
      <td>${c.email}</td>
      <td>${c.telefone}</td>
      <td>${c.endereco}</td>
      <td>${c.status}</td>
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
      (!nome || c.nome.toLowerCase().includes(nome)) &&
      (!endereco || c.endereco.toLowerCase().includes(endereco)) &&
      (!status || c.status === status)
    );
  });

  renderizarClientes(filtrados);
}

// Renderiza todos no início
renderizarClientes(clientes);
