// ======================================
// MENU LATERAL
// ======================================

const menu = document.querySelector(".sidebar");
const overlay = document.querySelector(".overlay");
const btnMenu = document.getElementById("menuBtn");

btnMenu.addEventListener("click", () => {

    menu.classList.toggle("show");
    overlay.classList.toggle("show");

});

overlay.addEventListener("click", () => {

    menu.classList.remove("show");
    overlay.classList.remove("show");

});

// ======================================
// ELEMENTOS DA PESQUISA
// ======================================

const campoPesquisa = document.getElementById("pesquisa");
const btnPesquisar = document.getElementById("btnPesquisar");

const clienteNome = document.getElementById("clienteNome");
const clienteIp = document.getElementById("clienteIp");
const clientePainel = document.getElementById("clientePainel");
const clienteSinal = document.getElementById("clienteSinal");

let clientes = [];

// ======================================
// CARREGAR CLIENTES
// ======================================

async function carregarClientes() {

    try {

        const resposta = await fetch("data/clientes.json");

        if (!resposta.ok) {

            throw new Error("Erro ao carregar clientes.json");

        }

        clientes = await resposta.json();

        console.log(`${clientes.length} clientes carregados.`);

    }

    catch (erro) {

        console.error(erro);

        alert("Não foi possível carregar a base de clientes.");

    }

}

carregarClientes();

// ======================================
// PESQUISAR CLIENTE
// ======================================

btnPesquisar.addEventListener("click", pesquisarCliente);

campoPesquisa.addEventListener("keydown", (e) => {

    if (e.key === "Enter") {

        pesquisarCliente();

    }

});

function pesquisarCliente() {

    const termo = campoPesquisa.value.trim().toLowerCase();

    if (!termo) return;

    const cliente = clientes.find(c =>

        c.ppoe.toLowerCase() === termo ||

        c.ip.toLowerCase() === termo

    );

    if (!cliente) {

        clienteNome.textContent = "Não encontrado";
        clienteIp.textContent = "---";
        clientePainel.textContent = "---";
        clienteSinal.textContent = "---";

        return;

    }

    clienteNome.textContent = cliente.ppoe;
    clienteIp.textContent = cliente.ip;
    clientePainel.textContent = cliente.painel;
    clienteSinal.textContent = cliente.sinal;

}
