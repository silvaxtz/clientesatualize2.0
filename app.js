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
const clienteSSID = document.getElementById("clienteSSID");
const clienteStatus = document.getElementById("clienteStatus");

let clientes = [];

// ======================================
// CARREGAR CLIENTES
// ======================================

async function carregarClientes() {

    try {

        const resposta = await fetch("clientes.json");

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

function pesquisarCliente() {

    const termo = campoPesquisa.value.trim().toLowerCase();

    if (!termo) {

        clienteNome.textContent = "---";
        clienteIp.textContent = "---";
        clientePainel.textContent = "---";
        clienteSinal.textContent = "---";
        clienteSSID.textContent = "---";

        return;

    }

    const cliente = clientes.find(c => {

        const ppoe = String(c.ppoe || "").toLowerCase();
        const ip = formatarIP(String(c.ip || "")).toLowerCase();
        const ipOriginal = String(c.ip || "").toLowerCase();
        const ssid = String(c.ssid || "").toLowerCase();
        const painel = String(c.painel || "").toLowerCase();

        return (

            ppoe.includes(termo) ||
            ip.includes(termo) ||
            ipOriginal.includes(termo) ||
            ssid.includes(termo) ||
            painel.includes(termo)

        );

    });

    if (!cliente) {

        clienteNome.textContent = "Não encontrado";
        clienteIp.textContent = "---";
        clientePainel.textContent = "---";
        clienteSinal.textContent = "---";
        clienteSSID.textContent = "---";

        return;

    }

    clienteNome.textContent = cliente.ppoe;
    clienteIp.textContent = formatarIP(cliente.ip);
    clientePainel.textContent = cliente.painel;
    clienteSinal.textContent = cliente.sinal;
    clienteSSID.textContent = cliente.ssid || "---";
    const status = calcularStatus(cliente.sinal);

    clienteStatus.textContent = status.texto;

    clienteStatus.className = status.classe;

    salvarHistorico(cliente.ppoe);

}

// ======================================
// HISTÓRICO
// ======================================

const historyList = document.querySelector(".history-list");

let historico = JSON.parse(localStorage.getItem("historico")) || [];

function salvarHistorico(texto){

    historico = historico.filter(item => item !== texto);

    historico.unshift(texto);

    if(historico.length > 8){

        historico.pop();

    }

    localStorage.setItem("historico", JSON.stringify(historico));

    renderizarHistorico();

}

function renderizarHistorico(){

    historyList.innerHTML = "";

    historico.forEach(item => {

        const botao = document.createElement("button");

        botao.textContent = item;

        botao.onclick = () => {

            campoPesquisa.value = item;

            pesquisarCliente();

        };

        historyList.appendChild(botao);

    });

}

renderizarHistorico();

// ======================================
// PESQUISA EM TEMPO REAL
// ======================================

campoPesquisa.addEventListener("input", () => {

    pesquisarCliente();

});

// ======================================
// SERVICE WORKER
// ======================================

if ("serviceWorker" in navigator) {

    window.addEventListener("load", () => {

        navigator.serviceWorker.register("service-worker.js")

            .then(() => {

                console.log("Service Worker iniciado.");

            })

            .catch(erro => {

                console.error(erro);

            });

    });

}

function formatarIP(ip){

    ip = String(ip);

    if(ip.includes(".")){

        return ip;

    }

    ip = ip.replace(/\D/g,"");

    if(ip.length === 11){

        return `${ip.slice(0,3)}.${ip.slice(3,6)}.${ip.slice(6,9)}.${ip.slice(9)}`;

    }

    if(ip.length === 10){

        return `${ip.slice(0,2)}.${ip.slice(2,5)}.${ip.slice(5,8)}.${ip.slice(8)}`;

    }

    return ip;

}

function calcularStatus(sinal){

    sinal = parseInt(
        String(sinal).replace(/[^\d-]/g, "")
    );

    if(isNaN(sinal)){

        return {
            texto:"Desconhecido",
            classe:"status-cinza"
        };

    }

    if(sinal >= -65){

        return {
            texto:"Bom",
            classe:"status-verde"
        };

    }

    if(sinal >= -75){

        return {
            texto:"Médio",
            classe:"status-amarelo"
        };

    }

    return {

        texto:"Ruim",
        classe:"status-vermelho"

    };

}
