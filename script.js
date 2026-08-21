/* =========================================================
   ATUALIZE TELECOM — SCRIPT REMASTER 2.0
========================================================= */

"use strict";

/* =========================================================
   CONFIGURAÇÃO
========================================================= */

const CONFIG = {

    arquivos: {
        clientes: "./clientes.json",
        versao: "./version.json"
    },

    storage: {
        usuario: "atualize_usuario",
        tema: "atualize_tema"
    },

    pesquisa: {
        minimoCaracteres: 3,
        atraso: 180
    }

};


/* =========================================================
   ESTADO
========================================================= */

let clientes = [];
let usuarioAtual = null;
let temaAtual = "light";
let timerPesquisa = null;


/* =========================================================
   USUÁRIOS
========================================================= */

const usuarios = {

    adriano: {
        senha: "180405a",
        admin: true
    },

    julio: {
        senha: "suporteatlz",
        admin: false
    },

    kristian: {
        senha: "suporteatlz",
        admin: false
    },

    jeciana: {
        senha: "suporteatlz",
        admin: false
    },

    nubia: {
        senha: "suporteatlz",
        admin: false
    },

    jerbson: {
        senha: "suporteatlz",
        admin: false
    }

};


/* =========================================================
   ELEMENTOS
========================================================= */

const $ = id => document.getElementById(id);

const loginTela = $("loginTela");
const sistema = $("sistema");
const painelAdmin = $("painelAdmin");

const usuarioInput = $("usuario");
const senhaInput = $("senha");

const btnLogin = $("btnLogin");
const btnSair = $("btnSair");
const btnAdmin = $("btnAdmin");
const fecharAdmin = $("fecharAdmin");

const pesquisa = $("pesquisa");
const resultado = $("resultado");

const btnTemaLogin = $("btnTemaLogin");
const btnTemaSistema = $("btnTemaSistema");
const btnTemaAdmin = $("btnTemaAdmin");

const limparPesquisa = $("limparPesquisa");


/* =========================================================
   INICIALIZAÇÃO
========================================================= */

document.addEventListener("DOMContentLoaded", async () => {

    inicializarTema();

    configurarEventos();

    await carregarClientes();

    verificarSessao();

    registrarServiceWorker();

});


/* =========================================================
   EVENTOS
========================================================= */

function configurarEventos() {

    /* LOGIN */

    const loginForm = $("loginForm");

    if (loginForm) {

        loginForm.addEventListener("submit", event => {

            event.preventDefault();

            fazerLogin();

        });

    }


    if (btnLogin) {

        btnLogin.addEventListener(
            "click",
            fazerLogin
        );

    }


    /* ENTER NOS CAMPOS */

    if (usuarioInput) {

        usuarioInput.addEventListener(
            "keydown",
            event => {

                if (event.key === "Enter") {

                    event.preventDefault();

                    senhaInput.focus();

                }

            }
        );

    }


    if (senhaInput) {

        senhaInput.addEventListener(
            "keydown",
            event => {

                if (event.key === "Enter") {

                    event.preventDefault();

                    fazerLogin();

                }

            }
        );

    }


    /* LOGOUT */

    if (btnSair) {

        btnSair.addEventListener(
            "click",
            sair
        );

    }


    /* ADMIN */

    if (btnAdmin) {

        btnAdmin.addEventListener(
            "click",
            abrirAdmin
        );

    }


    if (fecharAdmin) {

        fecharAdmin.addEventListener(
            "click",
            fecharPainelAdmin
        );

    }


    /* TEMA */

    if (btnTemaLogin) {

        btnTemaLogin.addEventListener(
            "click",
            alternarTema
        );

    }


    if (btnTemaSistema) {

        btnTemaSistema.addEventListener(
            "click",
            alternarTema
        );

    }


    if (btnTemaAdmin) {

        btnTemaAdmin.addEventListener(
            "click",
            alternarTema
        );

    }


    /* PESQUISA */

    if (pesquisa) {

        pesquisa.addEventListener(
            "input",
            pesquisarComAtraso
        );

        pesquisa.addEventListener(
            "keydown",
            event => {

                if (event.key === "Escape") {

                    limparBusca();

                }

            }
        );

    }


    if (limparPesquisa) {

        limparPesquisa.addEventListener(
            "click",
            limparBusca
        );

    }


    /* IMPORTAÇÃO */

    const btnImportarExcel =
        $("btnImportarExcel");

    if (btnImportarExcel) {

        btnImportarExcel.addEventListener(
            "click",
            importarExcel
        );

    }


    /* DOWNLOAD */

    const baixarJson =
        $("baixarJson");

    if (baixarJson) {

        baixarJson.addEventListener(
            "click",
            baixarClientesJson
        );

    }


    /* COPIAR ESTATÍSTICAS */

    const copiarEstatisticas =
        $("copiarEstatisticas");

    if (copiarEstatisticas) {

        copiarEstatisticas.addEventListener(
            "click",
            copiarEstatisticasTexto
        );

    }


    /* ATUALIZAÇÃO */

    const btnAtualizarApp =
        $("btnAtualizarApp");

    if (btnAtualizarApp) {

        btnAtualizarApp.addEventListener(
            "click",
            atualizarAplicativo
        );

    }

}


/* =========================================================
   LOGIN
========================================================= */

function fazerLogin() {

    const usuario =
        usuarioInput
            ? usuarioInput.value.trim().toLowerCase()
            : "";

    const senha =
        senhaInput
            ? senhaInput.value
            : "";


    const erro =
        $("erroLogin");


    if (!usuario || !senha) {

        mostrarErroLogin(
            "Digite seu usuário e sua senha."
        );

        return;

    }


    const conta =
        usuarios[usuario];


    if (
        !conta ||
        conta.senha !== senha
    ) {

        mostrarErroLogin(
            "Usuário ou senha incorretos."
        );

        return;

    }


    usuarioAtual = {
        nome: usuario,
        admin: conta.admin
    };


    localStorage.setItem(
        CONFIG.storage.usuario,
        JSON.stringify(usuarioAtual)
    );


    if (erro) {

        erro.textContent = "";

    }


    mostrarSistema();

}


function mostrarErroLogin(mensagem) {

    const erro =
        $("erroLogin");

    if (!erro) return;

    erro.textContent = mensagem;

}


/* =========================================================
   SESSÃO
========================================================= */

function verificarSessao() {

    try {

        const salvo =
            localStorage.getItem(
                CONFIG.storage.usuario
            );


        if (!salvo) {

            mostrarLogin();

            return;

        }


        const dados =
            JSON.parse(salvo);


        if (
            !dados ||
            !dados.nome ||
            !usuarios[dados.nome]
        ) {

            localStorage.removeItem(
                CONFIG.storage.usuario
            );

            mostrarLogin();

            return;

        }


        usuarioAtual = {

            nome: dados.nome,

            admin:
                usuarios[dados.nome].admin

        };


        mostrarSistema();

    }

    catch (erro) {

        localStorage.removeItem(
            CONFIG.storage.usuario
        );

        mostrarLogin();

    }

}


/* =========================================================
   TELAS
========================================================= */

function mostrarLogin() {

    if (loginTela) {

        loginTela.style.display = "block";

    }

    if (sistema) {

        sistema.style.display = "none";

    }

    if (painelAdmin) {

        painelAdmin.style.display = "none";

    }

}


function mostrarSistema() {

    if (loginTela) {

        loginTela.style.display = "none";

    }

    if (sistema) {

        sistema.style.display = "block";

    }

    if (painelAdmin) {

        painelAdmin.style.display = "none";

    }


    const usuarioLogado =
        $("usuarioLogado");


    if (usuarioLogado) {

        usuarioLogado.textContent =
            capitalizar(usuarioAtual.nome);

    }


    if (btnAdmin) {

        btnAdmin.style.display =
            usuarioAtual.admin
                ? "flex"
                : "none";

    }


    limparBusca();

}


function sair() {

    localStorage.removeItem(
        CONFIG.storage.usuario
    );

    usuarioAtual = null;

    mostrarLogin();

    if (usuarioInput) {

        usuarioInput.value = "";

    }

    if (senhaInput) {

        senhaInput.value = "";

    }

    if (usuarioInput) {

        usuarioInput.focus();

    }

}


function abrirAdmin() {

    if (
        !usuarioAtual ||
        !usuarioAtual.admin
    ) {

        return;

    }


    if (sistema) {

        sistema.style.display = "none";

    }

    if (painelAdmin) {

        painelAdmin.style.display = "block";

    }


    atualizarDashboard();

}


function fecharPainelAdmin() {

    if (painelAdmin) {

        painelAdmin.style.display = "none";

    }

    if (sistema) {

        sistema.style.display = "block";

    }

}


/* =========================================================
   TEMA
========================================================= */

function inicializarTema() {

    const salvo =
        localStorage.getItem(
            CONFIG.storage.tema
        );


    if (salvo === "dark") {

        aplicarTema("dark");

    }

    else {

        aplicarTema("light");

    }

}


function aplicarTema(tema) {

    temaAtual =
        tema === "dark"
            ? "dark"
            : "light";


    if (temaAtual === "dark") {

        document.body.classList.add(
            "dark-theme"
        );

    }

    else {

        document.body.classList.remove(
            "dark-theme"
        );

    }


    localStorage.setItem(
        CONFIG.storage.tema,
        temaAtual
    );


    atualizarBotoesTema();

}


function alternarTema() {

    aplicarTema(
        document.body.classList.contains(
            "dark-theme"
        )
            ? "light"
            : "dark"
    );

}


function atualizarBotoesTema() {

    const botoes = [
        btnTemaLogin,
        btnTemaSistema,
        btnTemaAdmin
    ];


    botoes.forEach(botao => {

        if (!botao) return;


        botao.textContent =
            temaAtual === "dark"
                ? "☀️"
                : "🌙";


        botao.title =
            temaAtual === "dark"
                ? "Ativar modo claro"
                : "Ativar modo noite";

    });

}


/* =========================================================
   CLIENTES.JSON
========================================================= */

async function carregarClientes() {

    try {

        const resposta =
            await fetch(
                CONFIG.arquivos.clientes,
                {
                    cache: "no-store"
                }
            );


        if (!resposta.ok) {

            throw new Error(
                "Não foi possível carregar clientes.json"
            );

        }


        const dados =
            await resposta.json();


        if (Array.isArray(dados)) {

            clientes = dados;

        }

        else if (
            dados &&
            Array.isArray(dados.clientes)
        ) {

            clientes = dados.clientes;

        }

        else {

            clientes = [];

        }


        clientes =
            clientes.map(normalizarCliente);


        console.log(
            `Clientes carregados: ${clientes.length}`
        );

    }

    catch (erro) {

        console.error(
            "Erro ao carregar clientes.json:",
            erro
        );

        clientes = [];

    }

}


/* =========================================================
   NORMALIZAÇÃO DOS CLIENTES
========================================================= */

function normalizarCliente(cliente) {

    if (!cliente || typeof cliente !== "object") {

        return {};

    }


    const novo = {};


    Object.keys(cliente).forEach(chave => {

        novo[chave] =
            cliente[chave];

    });


    novo.ppoe =
        pegarCampo(
            cliente,
            [
                "ppoe",
                "PPPOE",
                "PPOE",
                "login",
                "Login"
            ]
        );


    novo.ip =
        pegarCampo(
            cliente,
            [
                "ip",
                "IP",
                "Ip"
            ]
        );


    novo.sinal =
        pegarCampo(
            cliente,
            [
                "sinal",
                "Sinal",
                "signal",
                "Signal"
            ]
        );


    novo.status =
        pegarCampo(
            cliente,
            [
                "status",
                "Status"
            ]
        );


    novo.painel =
        pegarCampo(
            cliente,
            [
                "painel",
                "Painel",
                "PANEL",
                "panel"
            ]
        );


    novo.ipPainel =
        pegarCampo(
            cliente,
            [
                "ipPainel",
                "IPPainel",
                "ip_painel",
                "IP_PAINEL",
                "ipPanel",
                "IPPanel",
                "ip painel",
                "IP painel",
                "ip-do-painel"
            ]
        );


    /* Caso o JSON use "ip do painel" */

    if (!novo.ipPainel) {

        novo.ipPainel =
            encontrarCampoPorNome(
                cliente,
                [
                    "ippainel",
                    "ippainel",
                    "ippanel",
                    "ipdopainel"
                ]
            );

    }


    return novo;

}


/* =========================================================
   CAMPOS
========================================================= */

function pegarCampo(objeto, nomes) {

    for (const nome of nomes) {

        if (
            Object.prototype.hasOwnProperty.call(
                objeto,
                nome
            )
        ) {

            const valor =
                objeto[nome];


            if (
                valor !== null &&
                valor !== undefined &&
                String(valor).trim() !== ""
            ) {

                return String(valor).trim();

            }

        }

    }


    return "";

}


function encontrarCampoPorNome(
    objeto,
    nomes
) {

    const chaves =
        Object.keys(objeto);


    for (const chave of chaves) {

        const normalizada =
            chave
                .toLowerCase()
                .normalize("NFD")
                .replace(
                    /[\u0300-\u036f]/g,
                    ""
                )
                .replace(
                    /[^a-z0-9]/g,
                    ""
                );


        if (
            nomes.includes(normalizada)
        ) {

            const valor =
                objeto[chave];


            if (
                valor !== null &&
                valor !== undefined
            ) {

                return String(valor).trim();

            }

        }

    }


    return "";

}


/* =========================================================
   PESQUISA
========================================================= */

function pesquisarComAtraso() {

    clearTimeout(timerPesquisa);


    timerPesquisa =
        setTimeout(
            executarPesquisa,
            CONFIG.pesquisa.atraso
        );


    if (limparPesquisa) {

        limparPesquisa.style.display =
            pesquisa.value
                ? "flex"
                : "none";

    }

}


function executarPesquisa() {

    if (!pesquisa) return;


    const termo =
        pesquisa.value
            .trim()
            .toLowerCase();


    if (!termo) {

        mostrarEstadoInicial();

        return;

    }


    if (
        termo.length <
        CONFIG.pesquisa.minimoCaracteres
    ) {

        mostrarMensagemPesquisa(
            "Digite pelo menos 3 caracteres."
        );

        return;

    }


    const encontrados =
        clientes.filter(cliente => {

            const ppoe =
                String(
                    cliente.ppoe || ""
                ).toLowerCase();


            const ip =
                String(
                    cliente.ip || ""
                ).toLowerCase();


            return (
                ppoe.includes(termo) ||
                ip.includes(termo)
            );

        });


    /* =====================================================
       APENAS UM CLIENTE POR VEZ
    ===================================================== */

    if (encontrados.length === 0) {

        mostrarNaoEncontrado();

        return;

    }


    let cliente;


    /*
       Primeiro tenta encontrar correspondência exata.
    */

    cliente =
        encontrados.find(item => {

            return (
                String(item.ppoe || "")
                    .toLowerCase() === termo ||

                String(item.ip || "")
                    .toLowerCase() === termo
            );

        });


    /*
       Se não houver exato,
       mostra somente o primeiro.
    */

    if (!cliente) {

        cliente =
            encontrados[0];

    }


    mostrarCliente(cliente);

}


/* =========================================================
   LIMPAR
========================================================= */

function limparBusca() {

    clearTimeout(timerPesquisa);


    if (pesquisa) {

        pesquisa.value = "";

    }


    if (limparPesquisa) {

        limparPesquisa.style.display =
            "none";

    }


    mostrarEstadoInicial();

}


function mostrarEstadoInicial() {

    if (!resultado) return;


    resultado.innerHTML = `
        <div class="nao-encontrado">
            <div class="icone">📡</div>

            <h2>
                Pronto para pesquisar
            </h2>

            <p>
                Digite o PPOE ou IP do cliente
                para consultar os dados da conexão.
            </p>

            <div class="dica">
                A pesquisa mostra um cliente por vez.
            </div>
        </div>
    `;

}


function mostrarMensagemPesquisa(
    mensagem
) {

    if (!resultado) return;


    resultado.innerHTML = `
        <div class="nao-encontrado">
            <div class="icone">🔎</div>

            <h2>
                Continue digitando
            </h2>

            <p>
                ${escaparHTML(mensagem)}
            </p>
        </div>
    `;

}


function mostrarNaoEncontrado() {

    if (!resultado) return;


    resultado.innerHTML = `
        <div class="nao-encontrado">
            <div class="icone">🔍</div>

            <h2>
                Cliente não encontrado
            </h2>

            <p>
                Nenhum cliente foi localizado
                com esse PPOE ou IP.
            </p>

            <div class="dica">
                Confira os dados digitados e tente novamente.
            </div>
        </div>
    `;

}


/* =========================================================
   MOSTRAR CLIENTE
========================================================= */

function mostrarCliente(cliente) {

    if (!resultado) return;


    const status =
        determinarStatus(cliente);


    const classeStatus =
        status.classe;


    const ppoe =
        cliente.ppoe || "Não informado";


    const ip =
        cliente.ip || "Não informado";


    const painel =
        cliente.painel || "Não informado";


    const ipPainel =
        cliente.ipPainel ||
        encontrarIPPainel(cliente) ||
        "Não informado";


    const sinal =
        cliente.sinal || "Não informado";


    resultado.innerHTML = `

        <div class="cliente-card">

            <div class="cliente-card-header">

                <div class="cliente-identificacao">

                    <div class="cliente-avatar">
                        📡
                    </div>

                    <div>

                        <span class="cliente-dado-label">
                            CLIENTE
                        </span>

                        <h2>
                            ${escaparHTML(ppoe)}
                        </h2>

                    </div>

                </div>


                <span
                    class="cliente-status ${classeStatus}"
                >
                    ${status.icone}
                    ${escaparHTML(status.nome)}
                </span>

            </div>


            <div class="cliente-dados">


                <div class="cliente-dado">

                    <span class="cliente-dado-label">
                        PPOE
                    </span>

                    <strong class="cliente-dado-valor">
                        ${escaparHTML(ppoe)}
                    </strong>

                </div>


                <div class="cliente-dado">

                    <span class="cliente-dado-label">
                        IP DO CLIENTE
                    </span>

                    <strong class="cliente-dado-valor">
                        ${escaparHTML(ip)}
                    </strong>

                </div>


                <div class="cliente-dado">

                    <span class="cliente-dado-label">
                        PAINEL
                    </span>

                    <strong class="cliente-dado-valor">
                        ${escaparHTML(painel)}
                    </strong>

                </div>


                <div class="cliente-dado">

                    <span class="cliente-dado-label">
                        IP DO PAINEL
                    </span>

                    <strong class="cliente-dado-valor">
                        ${escaparHTML(ipPainel)}
                    </strong>

                </div>


                <div class="cliente-dado">

                    <span class="cliente-dado-label">
                        SINAL
                    </span>

                    <strong class="cliente-dado-valor">
                        ${escaparHTML(sinal)}
                    </strong>

                </div>


                <div class="cliente-dado">

                    <span class="cliente-dado-label">
                        STATUS
                    </span>

                    <strong class="cliente-dado-valor">
                        ${escaparHTML(status.nome)}
                    </strong>

                </div>


            </div>


            ${
                status.classe === "ruim"
                    ? `
                        <div class="alerta-critico">
                            ⚠️ Atenção: sinal ruim neste cliente.
                        </div>
                    `
                    : ""
            }

        </div>

    `;

}


/* =========================================================
   IP DO PAINEL
========================================================= */

function encontrarIPPainel(cliente) {

    if (!cliente) {

        return "";

    }


    const nomesPossiveis = [

        "ipPainel",
        "IPPainel",
        "ip_painel",
        "IP_PAINEL",
        "ipPanel",
        "IPPanel",
        "ip painel",
        "IP painel",
        "ip do painel",
        "IP do painel",
        "ipdopainel",
        "IPDOPAINEL",
        "ip-painel",
        "ip-painel"

    ];


    const direto =
        pegarCampo(
            cliente,
            nomesPossiveis
        );


    if (direto) {

        return direto;

    }


    return encontrarCampoPorNome(
        cliente,
        [
            "ippainel",
            "ippanel",
            "ipdopainel"
        ]
    );

}


/* =========================================================
   STATUS
========================================================= */

function determinarStatus(cliente) {

    const valor =
        String(
            cliente.status || ""
        )
            .toLowerCase()
            .trim();


    const sinal =
        parseFloat(
            String(
                cliente.sinal || ""
            )
                .replace(",", ".")
                .replace("dbm", "")
        );


    if (
        valor === "3" ||
        valor.includes("bom")
    ) {

        return {
            nome: "Bom",
            classe: "bom",
            icone: "🟢"
        };

    }


    if (
        valor === "2" ||
        valor.includes("médio") ||
        valor.includes("medio")
    ) {

        return {
            nome: "Médio",
            classe: "medio",
            icone: "🟡"
        };

    }


    if (
        valor === "1" ||
        valor.includes("ruim")
    ) {

        return {
            nome: "Ruim",
            classe: "ruim",
            icone: "🔴"
        };

    }


    /*
       Se não houver status, tenta pelo sinal.
    */

    if (!isNaN(sinal)) {

        /*
           Sinais de fibra normalmente são negativos.
           Quanto mais próximo de zero, melhor.
        */

        if (sinal >= -25) {

            return {
                nome: "Bom",
                classe: "bom",
                icone: "🟢"
            };

        }


        if (sinal >= -27) {

            return {
                nome: "Médio",
                classe: "medio",
                icone: "🟡"
            };

        }


        return {
            nome: "Ruim",
            classe: "ruim",
            icone: "🔴"
        };

    }


    return {
        nome: "Não informado",
        classe: "medio",
        icone: "⚪"
    };

}


/* =========================================================
   DASHBOARD
========================================================= */

function atualizarDashboard() {

    const total =
        clientes.length;


    const paineis =
        new Set();


    let bom = 0;
    let medio = 0;
    let ruim = 0;


    clientes.forEach(cliente => {

        const painel =
            cliente.painel;


        if (painel) {

            paineis.add(
                String(painel).trim()
            );

        }


        const status =
            determinarStatus(cliente);


        if (status.classe === "bom") {

            bom++;

        }

        else if (
            status.classe === "medio"
        ) {

            medio++;

        }

        else if (
            status.classe === "ruim"
        ) {

            ruim++;

        }

    });


    definirTexto(
        "totalClientes",
        total
    );


    definirTexto(
        "totalPaineis",
        paineis.size
    );


    definirTexto(
        "totalBom",
        bom
    );


    definirTexto(
        "totalMedio",
        medio
    );


    definirTexto(
        "totalRuim",
        ruim
    );


    atualizarSaude(
        total,
        bom
    );


    atualizarRanking();

}


/* =========================================================
   SAÚDE
========================================================= */

function atualizarSaude(
    total,
    bom
) {

    const percentual =
        total > 0
            ? Math.round(
                (bom / total) * 100
            )
            : 0;


    const barra =
        $("barraSaude");


    if (barra) {

        barra.style.width =
            `${percentual}%`;

    }


    const texto =
        $("textoSaude");


    if (texto) {

        texto.textContent =
            `${percentual}%`;

    }


    const percentualElemento =
        $("percentualSaude");


    if (percentualElemento) {

        percentualElemento.textContent =
            `${percentual}%`;

    }

}


/* =========================================================
   RANKING
========================================================= */

function atualizarRanking() {

    const elemento =
        $("rankingPaineis");


    if (!elemento) return;


    const mapa =
        {};


    clientes.forEach(cliente => {

        const painel =
            String(
                cliente.painel || ""
            ).trim();


        if (!painel) return;


        if (!mapa[painel]) {

            mapa[painel] = 0;

        }


        mapa[painel]++;

    });


    const ranking =
        Object.entries(mapa)
            .sort(
                (a, b) =>
                    b[1] - a[1]
            )
            .slice(0, 10);


    if (!ranking.length) {

        elemento.innerHTML = `
            <div class="nao-encontrado">
                <div class="icone">📡</div>

                <h2>
                    Nenhum painel disponível
                </h2>

                <p>
                    Os dados dos painéis aparecerão aqui.
                </p>
            </div>
        `;

        return;

    }


    const maior =
        ranking[0][1];


    elemento.innerHTML =
        ranking.map(
            ([painel, quantidade], indice) => {

                const largura =
                    maior > 0
                        ? Math.round(
                            (quantidade / maior) * 100
                        )
                        : 0;


                return `

                    <div class="itemPainel">

                        <span>

                            <span>
                                ${String(
                                    indice + 1
                                ).padStart(2, "0")}
                                — 
                                ${escaparHTML(painel)}
                            </span>

                            <strong>
                                ${quantidade}
                            </strong>

                        </span>


                        <div class="barraPainel">

                            <div
                                class="preenchimento"
                                style="width:${largura}%"
                            ></div>

                        </div>

                    </div>

                `;

            }
        )
        .join("");

}


/* =========================================================
   IMPORTAR EXCEL
========================================================= */

async function importarExcel() {

    const input =
        $("inputExcel");


    if (
        !input ||
        !input.files ||
        !input.files.length
    ) {

        alert(
            "Selecione uma planilha Excel primeiro."
        );

        return;

    }


    if (
        typeof XLSX === "undefined"
    ) {

        alert(
            "A biblioteca XLSX não foi carregada."
        );

        return;

    }


    const arquivo =
        input.files[0];


    try {

        const dados =
            await arquivo.arrayBuffer();


        const workbook =
            XLSX.read(
                dados,
                {
                    type: "array"
                }
            );


        const importados = [];


        workbook.SheetNames.forEach(
            nomeAba => {

                const planilha =
                    workbook.Sheets[nomeAba];


                const linhas =
                    XLSX.utils.sheet_to_json(
                        planilha,
                        {
                            defval: ""
                        }
                    );


                linhas.forEach(
                    linha => {

                        const cliente =
                            normalizarCliente(
                                linha
                            );


                        if (
                            cliente.ppoe ||
                            cliente.ip
                        ) {

                            if (
                                !cliente.painel
                            ) {

                                /*
                                   Se a aba representa o painel,
                                   usa o nome da aba.
                                */

                                cliente.painel =
                                    nomeAba;

                            }


                            importados.push(
                                cliente
                            );

                        }

                    }
                );

            }
        );


        clientes =
            importados;


        atualizarDashboard();


        baixarClientesJson();


        alert(
            `Importação concluída!\n\n${clientes.length} clientes carregados.`
        );


        input.value = "";


    }

    catch (erro) {

        console.error(
            "Erro ao importar:",
            erro
        );


        alert(
            "Não foi possível importar a planilha."
        );

    }

}


/* =========================================================
   BAIXAR JSON
========================================================= */

function baixarClientesJson() {

    const conteudo =
        JSON.stringify(
            clientes,
            null,
            2
        );


    const blob =
        new Blob(
            [conteudo],
            {
                type:
                    "application/json;charset=utf-8"
            }
        );


    const url =
        URL.createObjectURL(blob);


    const link =
        document.createElement("a");


    link.href = url;

    link.download =
        "clientes.json";


    document.body.appendChild(link);

    link.click();

    link.remove();


    URL.revokeObjectURL(url);

}


/* =========================================================
   COPIAR ESTATÍSTICAS
========================================================= */

async function copiarEstatisticasTexto() {

    const total =
        clientes.length;


    const bom =
        clientes.filter(
            cliente =>
                determinarStatus(
                    cliente
                ).classe === "bom"
        ).length;


    const medio =
        clientes.filter(
            cliente =>
                determinarStatus(
                    cliente
                ).classe === "medio"
        ).length;


    const ruim =
        clientes.filter(
            cliente =>
                determinarStatus(
                    cliente
                ).classe === "ruim"
        ).length;


    const paineis =
        new Set(
            clientes
                .map(
                    cliente =>
                        String(
                            cliente.painel || ""
                        ).trim()
                )
                .filter(Boolean)
        ).size;


    const saude =
        total
            ? Math.round(
                (bom / total) * 100
            )
            : 0;


    const texto = `

ATUALIZE TELECOM
RELATÓRIO DA REDE

Clientes: ${total}
Painéis: ${paineis}

🟢 Bom: ${bom}
🟡 Médio: ${medio}
🔴 Ruim: ${ruim}

❤️ Saúde da rede: ${saude}%

`;


    try {

        await navigator.clipboard.writeText(
            texto.trim()
        );


        alert(
            "Estatísticas copiadas!"
        );

    }

    catch (erro) {

        alert(
            "Não foi possível copiar as estatísticas."
        );

    }

}


/* =========================================================
   SERVICE WORKER
========================================================= */

function registrarServiceWorker() {

    if (
        !("serviceWorker" in navigator)
    ) {

        return;

    }


    window.addEventListener(
        "load",
        async () => {

            try {

                const registro =
                    await navigator.serviceWorker.register(
                        "./service-worker.js"
                    );


                registro.addEventListener(
                    "updatefound",
                    () => {

                        const novo =
                            registro.installing;


                        if (!novo) return;


                        novo.addEventListener(
                            "statechange",
                            () => {

                                if (
                                    novo.state ===
                                    "installed" &&
                                    navigator.serviceWorker.controller
                                ) {

                                    mostrarBannerAtualizacao(
                                        novo
                                    );

                                }

                            }
                        );

                    }
                );

            }

            catch (erro) {

                console.error(
                    "Service Worker:",
                    erro
                );

            }

        }
    );

}


/* =========================================================
   ATUALIZAÇÃO DO APLICATIVO
========================================================= */

function mostrarBannerAtualizacao(
    worker
) {

    const banner =
        $("updateBanner");


    if (!banner) return;


    banner.style.display =
        "flex";


    const botao =
        $("btnAtualizarApp");


    if (!botao) return;


    botao.onclick = () => {

        worker.postMessage(
            "SKIP_WAITING"
        );


        window.location.reload();

    };

}


async function atualizarAplicativo() {

    try {

        const registrations =
            await navigator
                .serviceWorker
                .getRegistrations();


        for (
            const registro
            of registrations
        ) {

            await registro.update();

        }


        window.location.reload();

    }

    catch (erro) {

        window.location.reload();

    }

}


/* =========================================================
   SERVICE WORKER — ATUALIZAÇÃO FORÇADA
========================================================= */

if (
    "serviceWorker" in navigator
) {

    navigator.serviceWorker.addEventListener(
        "controllerchange",
        () => {

            if (
                window.__recarregandoSW
            ) {

                return;

            }


            window.__recarregandoSW =
                true;


            window.location.reload();

        }
    );

}


/* =========================================================
   UTILIDADES
========================================================= */

function definirTexto(
    id,
    texto
) {

    const elemento =
        $(id);


    if (elemento) {

        elemento.textContent =
            texto;

    }

}


function capitalizar(texto) {

    if (!texto) return "";

    return (
        texto.charAt(0).toUpperCase() +
        texto.slice(1)
    );

}


function escaparHTML(valor) {

    return String(
        valor ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================================
   INICIALIZAÇÃO DA PESQUISA
========================================================= */

window.addEventListener(
    "load",
    () => {

        mostrarEstadoInicial();

    }
);
