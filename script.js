"use strict";

/* =========================================================
   ATUALIZE TELECOM
   SCRIPT PRINCIPAL — VERSÃO LIMPA
========================================================= */


/* =========================================================
   CONFIGURAÇÃO
========================================================= */

const CONFIG = {

    arquivos: {
        clientes: "./clientes.json",
        versao: "./version.json"
    },

    storage: {
        usuario: "usuarioAtual",
        tema: "temaAtual"
    }

};


/* =========================================================
   USUÁRIOS
========================================================= */

const usuarios = [

    {
        usuario: "adriano",
        senha: "180405a",
        tipo: "admin"
    },

    {
        usuario: "julio",
        senha: "suporteatlz",
        tipo: "tecnico"
    },

    {
        usuario: "kristian",
        senha: "suporteatlz",
        tipo: "tecnico"
    },

    {
        usuario: "jeciana",
        senha: "suporteatlz",
        tipo: "tecnico"
    },

    {
        usuario: "nubia",
        senha: "suporteatlz",
        tipo: "tecnico"
    },

    {
        usuario: "jerbson",
        senha: "suporteatlz",
        tipo: "tecnico"
    }

];


/* =========================================================
   ESTADO
========================================================= */

let clientes = [];

let usuarioAtual = null;

let temaAtual = "light";

let pesquisaTimeout = null;


/* =========================================================
   ELEMENTOS
========================================================= */

const $ = id =>
    document.getElementById(id);


const loginTela =
    $("loginTela");

const sistema =
    $("sistema");

const painelAdmin =
    $("painelAdmin");


const usuarioInput =
    $("usuario");

const senhaInput =
    $("senha");

const erroLogin =
    $("erroLogin");


const btnLogin =
    $("btnLogin");

const btnSair =
    $("btnSair");

const btnAdmin =
    $("btnAdmin");

const fecharAdmin =
    $("fecharAdmin");

const usuarioLogado =
    $("usuarioLogado");


const pesquisa =
    $("pesquisa");

const resultado =
    $("resultado");


const inputExcel =
    $("inputExcel");

const btnImportarExcel =
    $("btnImportarExcel");


const rankingPaineis =
    $("rankingPaineis");

const totalClientes =
    $("totalClientes");

const totalPaineis =
    $("totalPaineis");

const totalBom =
    $("totalBom");

const totalMedio =
    $("totalMedio");

const totalRuim =
    $("totalRuim");


const baixarJson =
    $("baixarJson");

const copiarEstatisticas =
    $("copiarEstatisticas");


const updateBanner =
    $("updateBanner");

const btnAtualizarApp =
    $("btnAtualizarApp");

const versaoApp =
    $("versaoApp");


/* =========================================================
   UTILITÁRIOS
========================================================= */

function normalizar(valor) {

    return String(valor ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();

}


function escaparHTML(valor) {

    return String(valor ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


function formatarIP(ip) {

    if (
        ip === undefined ||
        ip === null ||
        ip === ""
    ) {

        return "";

    }

    return String(ip).trim();

}


/* =========================================================
   NOTIFICAÇÃO
========================================================= */

function notificar(
    mensagem,
    tipo = "info"
) {

    let toast =
        document.getElementById(
            "appToast"
        );


    if (!toast) {

        toast =
            document.createElement("div");

        toast.id =
            "appToast";

        document.body.appendChild(toast);

    }


    toast.textContent =
        mensagem;

    toast.className =
        `app-toast app-toast-${tipo} show`;


    clearTimeout(
        toast._timer
    );


    toast._timer =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            2500
        );

}


/* =========================================================
   MODO NOITE
========================================================= */

function criarBotaoTema() {

    let botao =
        document.getElementById(
            "btnTema"
        );


    if (botao) {
        return botao;
    }


    botao =
        document.createElement("button");

    botao.id =
        "btnTema";

    botao.type =
        "button";

    botao.innerHTML =
        "🌙";

    botao.title =
        "Ativar modo noite";


    /*
       Procura um lugar apropriado
       no topo do sistema.
    */

    const topo =
        sistema?.querySelector(
            ".topo"
        );


    if (topo) {

        topo.insertBefore(
            botao,
            topo.firstChild
        );

    } else {

        document.body.appendChild(
            botao
        );

    }


    botao.addEventListener(
        "click",
        alternarTema
    );


    return botao;

}


function aplicarTema(
    tema
) {

    temaAtual =
        tema === "dark"
            ? "dark"
            : "light";


    document.documentElement
        .setAttribute(
            "data-theme",
            temaAtual
        );


    document.body.classList.toggle(
        "dark-mode",
        temaAtual === "dark"
    );


    document.body.classList.toggle(
        "dark-theme",
        temaAtual === "dark"
    );


    localStorage.setItem(
        CONFIG.storage.tema,
        temaAtual
    );


    const botao =
        document.getElementById(
            "btnTema"
        );


    if (botao) {

        botao.innerHTML =
            temaAtual === "dark"
                ? "☀️"
                : "🌙";


        botao.title =
            temaAtual === "dark"
                ? "Ativar modo claro"
                : "Ativar modo noite";

    }


    /*
       Atualiza theme-color do PWA.
    */

    let meta =
        document.querySelector(
            'meta[name="theme-color"]'
        );


    if (meta) {

        meta.setAttribute(
            "content",
            temaAtual === "dark"
                ? "#111827"
                : "#00b050"
        );

    }

}


function inicializarTema() {

    const salvo =
        localStorage.getItem(
            CONFIG.storage.tema
        );


    if (
        salvo === "dark" ||
        salvo === "light"
    ) {

        aplicarTema(
            salvo
        );

    } else {

        aplicarTema(
            "light"
        );

    }


    criarBotaoTema();

}


function alternarTema() {

    aplicarTema(
        temaAtual === "dark"
            ? "light"
            : "dark"
    );

}


/* =========================================================
   LOGIN
========================================================= */

function entrar() {

    const usuario =
        normalizar(
            usuarioInput?.value
        );


    const senha =
        senhaInput?.value || "";


    if (erroLogin) {

        erroLogin.textContent =
            "";

    }


    if (
        !usuario ||
        !senha
    ) {

        if (erroLogin) {

            erroLogin.textContent =
                "Digite usuário e senha.";

        }

        return;

    }


    const encontrado =
        usuarios.find(
            item =>
                item.usuario === usuario &&
                item.senha === senha
        );


    if (!encontrado) {

        if (erroLogin) {

            erroLogin.textContent =
                "Usuário ou senha inválidos.";

        }

        return;

    }


    usuarioAtual = {
        ...encontrado
    };


    localStorage.setItem(
        CONFIG.storage.usuario,
        JSON.stringify(
            usuarioAtual
        )
    );


    if (senhaInput) {

        senhaInput.value =
            "";

    }


    mostrarSistema();


    notificar(
        `Bem-vindo, ${usuarioAtual.usuario}!`,
        "success"
    );

}


function sair() {

    localStorage.removeItem(
        CONFIG.storage.usuario
    );


    usuarioAtual =
        null;


    if (pesquisa) {

        pesquisa.value =
            "";

    }


    if (resultado) {

        resultado.innerHTML =
            "";

    }


    mostrarLogin();


    notificar(
        "Sessão encerrada.",
        "info"
    );

}


function mostrarLogin() {

    if (loginTela) {

        loginTela.style.display =
            "block";

    }


    if (sistema) {

        sistema.style.display =
            "none";

    }


    if (painelAdmin) {

        painelAdmin.style.display =
            "none";

    }

}


function mostrarSistema() {

    if (loginTela) {

        loginTela.style.display =
            "none";

    }


    if (sistema) {

        sistema.style.display =
            "block";

    }


    if (painelAdmin) {

        painelAdmin.style.display =
            "none";

    }


    if (usuarioLogado) {

        usuarioLogado.innerHTML =
            `
            👤 ${escaparHTML(usuarioAtual.usuario)}
            <span>
                (${escaparHTML(usuarioAtual.tipo)})
            </span>
            `;

    }


    if (btnAdmin) {

        btnAdmin.style.display =
            usuarioAtual.tipo === "admin"
                ? "inline-block"
                : "none";

    }


    criarBotaoTema();

}


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


        const usuario =
            JSON.parse(
                salvo
            );


        const valido =
            usuarios.some(
                item =>
                    item.usuario ===
                    usuario.usuario &&
                    item.senha ===
                    usuario.senha
            );


        if (!valido) {

            localStorage.removeItem(
                CONFIG.storage.usuario
            );

            mostrarLogin();

            return;

        }


        usuarioAtual =
            usuario;


        mostrarSistema();


    } catch {

        localStorage.removeItem(
            CONFIG.storage.usuario
        );

        mostrarLogin();

    }

}


/* =========================================================
   PESQUISA
========================================================= */

function pesquisarCliente() {

    if (!pesquisa || !resultado) {
        return;
    }


    const textoOriginal =
        pesquisa.value.trim();


    const termo =
        normalizar(
            textoOriginal
        );


    if (!termo) {

        resultado.innerHTML =
            "";

        return;

    }


    /*
       Não pesquisar com apenas
       uma ou duas letras.
    */

    if (termo.length < 3) {

        resultado.innerHTML = `
            <div class="nao-encontrado">

                <div class="icone">
                    🔎
                </div>

                <h2>
                    Continue digitando
                </h2>

                <p>
                    Digite pelo menos
                    <strong>3 caracteres</strong>.
                </p>

            </div>
        `;

        return;

    }


    /*
       Procura primeiro pelo começo
       do PPOE ou IP.
    */

    const encontrado =
        clientes.find(
            cliente => {

                const ppoe =
                    normalizar(
                        cliente.ppoe
                    );

                const ip =
                    normalizar(
                        cliente.ip
                    );


                return (
                    ppoe.startsWith(termo) ||
                    ip.startsWith(termo)
                );

            }
        );


    /*
       Se não encontrou pelo começo,
       procura pelo painel/SSID.
    */

    const encontradoSecundario =
        encontrado ||
        clientes.find(
            cliente => {

                const painel =
                    normalizar(
                        cliente.painel
                    );

                const ssid =
                    normalizar(
                        cliente.ssid
                    );


                return (
                    painel.startsWith(termo) ||
                    ssid.startsWith(termo)
                );

            }
        );


    if (!encontradoSecundario) {

        resultado.innerHTML = `
            <div class="nao-encontrado">

                <div class="icone">
                    🔍
                </div>

                <h2>
                    Cliente não encontrado
                </h2>

                <p>
                    Nenhum cliente corresponde
                    à pesquisa.
                </p>

            </div>
        `;

        return;

    }


    /*
       MOSTRA SOMENTE UM CLIENTE.
    */

    resultado.innerHTML =
        renderizarCliente(
            encontradoSecundario,
            textoOriginal
        );

}


/* =========================================================
   RENDERIZAR CLIENTE
========================================================= */

function renderizarCliente(
    cliente,
    termo = ""
) {

    const status =
        obterStatus(
            cliente.status
        );


    const sinal =
        String(
            cliente.sinal ?? ""
        ).trim();


    const ip =
        formatarIP(
            cliente.ip
        );


    const ipPainel =
        formatarIP(
            cliente.ip_painel ??
            cliente.ipPainel ??
            cliente.ip_do_painel ??
            ""
        );


    const ppoe =
        String(
            cliente.ppoe ?? ""
        ).trim();


    const painel =
        String(
            cliente.painel ?? ""
        ).trim();


    const ssid =
        String(
            cliente.ssid ?? ""
        ).trim();


    const alerta =
        obterAlertaSinal(
            sinal
        );


    return `

        <article class="cliente-card">

            <div class="cliente-card-topo">

                <div>

                    <span class="cliente-label">
                        CLIENTE
                    </span>

                    <h2>
                        ${escaparHTML(ppoe || "-")}
                    </h2>

                </div>

                <div class="${status.classe}">

                    ${status.icone}

                    ${status.texto}

                </div>

            </div>


            ${alerta}


            <div class="campo">

                <div class="titulo">
                    📡 Painel
                </div>

                <div class="valor">
                    ${escaparHTML(
                        painel || "Não informado"
                    )}
                </div>

            </div>


            <div class="campo">

                <div class="titulo">
                    🌐 IP do Painel
                </div>

                <div class="valor">
                    ${escaparHTML(
                        ipPainel || "Não informado"
                    )}
                </div>

            </div>


            <div class="campo">

                <div class="titulo">
                    💻 IP do Cliente
                </div>

                <div class="valor">
                    ${escaparHTML(
                        ip || "Não informado"
                    )}
                </div>

            </div>


            ${
                ssid
                    ? `
                        <div class="campo">

                            <div class="titulo">
                                📶 SSID
                            </div>

                            <div class="valor">
                                ${escaparHTML(ssid)}
                            </div>

                        </div>
                    `
                    : ""
            }


            <div class="campo">

                <div class="titulo">
                    📊 Sinal
                </div>

                <div class="valor">

                    ${escaparHTML(
                        sinal || "Não informado"
                    )}

                    ${
                        sinal &&
                        !normalizar(sinal)
                            .includes("dbm")
                            ? " dBm"
                            : ""
                    }

                </div>

            </div>


            <div class="cliente-acoes">

                ${
                    ip
                        ? `
                            <button
                                type="button"
                                class="btn-copiar-ip"
                                data-ip="${escaparHTML(ip)}"
                            >
                                📋 Copiar IP
                            </button>
                        `
                        : ""
                }


                ${
                    ppoe
                        ? `
                            <button
                                type="button"
                                class="btn-copiar-ppoe"
                                data-ppoe="${escaparHTML(ppoe)}"
                            >
                                📋 Copiar PPOE
                            </button>
                        `
                        : ""
                }

            </div>

        </article>

    `;

}


/* =========================================================
   STATUS
========================================================= */

function obterStatus(
    status
) {

    const valor =
        String(
            status ?? ""
        ).trim().toLowerCase();


    if (
        valor === "3" ||
        valor === "bom"
    ) {

        return {

            texto: "Bom",

            icone: "🟢",

            classe: "status-bom"

        };

    }


    if (
        valor === "2" ||
        valor === "medio" ||
        valor === "médio"
    ) {

        return {

            texto: "Médio",

            icone: "🟡",

            classe: "status-medio"

        };

    }


    return {

        texto: "Ruim",

        icone: "🔴",

        classe: "status-ruim"

    };

}


/* =========================================================
   ALERTA DE SINAL
========================================================= */

function obterAlertaSinal(
    sinal
) {

    const numero =
        parseFloat(
            String(
                sinal ?? ""
            )
            .replace(
                ",",
                "."
            )
        );


    if (
        Number.isNaN(numero)
    ) {

        return "";

    }


    if (
        numero <= -81
    ) {

        return `

            <div class="alerta-critico">

                ⚠️

                <strong>
                    Sinal crítico
                </strong>

                <span>
                    ${escaparHTML(sinal)} dBm
                </span>

                <small>
                    Verificar o sinal imediatamente.
                </small>

            </div>

        `;

    }


    if (
        numero <= -70
    ) {

        return `

            <div class="alerta-critico alerta-atencao">

                ⚠️

                <strong>
                    Atenção ao sinal
                </strong>

                <span>
                    ${escaparHTML(sinal)} dBm
                </span>

            </div>

        `;

    }


    return "";

}


/* =========================================================
   COPIAR IP / PPOE
========================================================= */

document.addEventListener(
    "click",
    evento => {

        const btnIP =
            evento.target.closest(
                ".btn-copiar-ip"
            );


        if (btnIP) {

            const ip =
                btnIP.dataset.ip || "";


            navigator.clipboard
                ?.writeText(ip)
                .then(
                    () =>
                        notificar(
                            "IP copiado!",
                            "success"
                        )
                )
                .catch(
                    () =>
                        notificar(
                            "Não foi possível copiar.",
                            "error"
                        )
                );

            return;

        }


        const btnPPOE =
            evento.target.closest(
                ".btn-copiar-ppoe"
            );


        if (btnPPOE) {

            const ppoe =
                btnPPOE.dataset.ppoe || "";


            navigator.clipboard
                ?.writeText(ppoe)
                .then(
                    () =>
                        notificar(
                            "PPOE copiado!",
                            "success"
                        )
                )
                .catch(
                    () =>
                        notificar(
                            "Não foi possível copiar.",
                            "error"
                        )
                );

        }

    }
);


/* =========================================================
   CARREGAR CLIENTES
========================================================= */

async function carregarClientes() {

    try {

        const resposta =
            await fetch(
                `${CONFIG.arquivos.clientes}?v=${Date.now()}`,
                {
                    cache: "no-store"
                }
            );


        if (!resposta.ok) {

            throw new Error(
                "clientes.json não encontrado."
            );

        }


        const dados =
            await resposta.json();


        if (!Array.isArray(dados)) {

            throw new Error(
                "clientes.json precisa ser um array."
            );

        }


        clientes =
            dados;


        console.log(
            `📡 ${clientes.length} clientes carregados.`
        );


        atualizarDashboard();


    } catch (erro) {

        console.error(
            "Erro carregando clientes:",
            erro
        );


        clientes = [];


        if (resultado) {

            resultado.innerHTML = `

                <div class="nao-encontrado">

                    <div class="icone">
                        📡
                    </div>

                    <h2>
                        Base de clientes indisponível
                    </h2>

                    <p>
                        Não foi possível carregar
                        o clientes.json.
                    </p>

                </div>

            `;

        }

    }

}


/* =========================================================
   DASHBOARD
========================================================= */

function calcularDashboard() {

    let bom = 0;

    let medio = 0;

    let ruim = 0;


    const paineis =
        {};


    clientes.forEach(
        cliente => {

            const status =
                String(
                    cliente.status ?? ""
                )
                .trim()
                .toLowerCase();


            if (
                status === "3" ||
                status === "bom"
            ) {

                bom++;

            } else if (
                status === "2" ||
                status === "medio" ||
                status === "médio"
            ) {

                medio++;

            } else if (
                status === "1" ||
                status === "ruim"
            ) {

                ruim++;

            }


            const painel =
                String(
                    cliente.painel ?? ""
                ).trim();


            if (painel) {

                paineis[painel] =
                    (
                        paineis[painel] ||
                        0
                    ) + 1;

            }

        }
    );


    return {

        total:
            clientes.length,

        bom,

        medio,

        ruim,

        paineis

    };

}


function atualizarDashboard() {

    const dados =
        calcularDashboard();


    if (totalClientes) {

        totalClientes.textContent =
            dados.total;

    }


    if (totalPaineis) {

        totalPaineis.textContent =
            Object.keys(
                dados.paineis
            ).length;

    }


    if (totalBom) {

        totalBom.textContent =
            dados.bom;

    }


    if (totalMedio) {

        totalMedio.textContent =
            dados.medio;

    }


    if (totalRuim) {

        totalRuim.textContent =
            dados.ruim;

    }


    atualizarSaude(
        dados.bom,
        dados.total
    );


    atualizarRanking(
        dados.paineis
    );

}


/* =========================================================
   SAÚDE DA REDE
========================================================= */

function atualizarSaude(
    bom,
    total
) {

    const percentual =
        total > 0
            ? Math.round(
                (
                    bom /
                    total
                ) * 100
            )
            : 0;


    const barra =
        $("barraSaude");


    const texto =
        $("textoSaude");


    const percentualSaude =
        $("percentualSaude");


    const saudeRede =
        $("saudeRede");


    if (barra) {

        barra.style.width =
            `${percentual}%`;

    }


    if (texto) {

        texto.textContent =
            `${percentual}% dos clientes com sinal bom`;

    }


    if (percentualSaude) {

        percentualSaude.textContent =
            `${percentual}%`;

    }


    if (saudeRede) {

        saudeRede.textContent =
            `${percentual}%`;

    }


    document
        .querySelectorAll(
            "[data-health-bar]"
        )
        .forEach(
            elemento => {

                elemento.style.width =
                    `${percentual}%`;

            }
        );


    document
        .querySelectorAll(
            "[data-health-value]"
        )
        .forEach(
            elemento => {

                elemento.textContent =
                    `${percentual}%`;

            }
        );

}


/* =========================================================
   RANKING
========================================================= */

function atualizarRanking(
    paineis
) {

    if (!rankingPaineis) {
        return;
    }


    const lista =
        Object.entries(
            paineis
        )
        .sort(
            (a, b) =>
                b[1] - a[1]
        )
        .slice(
            0,
            10
        );


    if (!lista.length) {

        rankingPaineis.innerHTML =
            `
            <div class="sem-dados">
                Nenhum painel encontrado.
            </div>
            `;

        return;

    }


    const maior =
        lista[0][1];


    rankingPaineis.innerHTML =
        lista
            .map(
                (
                    [painel, quantidade],
                    index
                ) => {

                    const percentual =
                        maior > 0
                            ? (
                                quantidade /
                                maior
                            ) * 100
                            : 0;


                    return `

                        <div class="ranking-item">

                            <span class="ranking-pos">
                                ${index + 1}
                            </span>


                            <div class="ranking-info">

                                <strong>
                                    ${escaparHTML(painel)}
                                </strong>

                                <small>
                                    ${quantidade}
                                    ${
                                        quantidade === 1
                                            ? "cliente"
                                            : "clientes"
                                    }
                                </small>

                            </div>


                            <span class="ranking-bar">

                                <i
                                    style="
                                        width:${percentual}%
                                    "
                                ></i>

                            </span>

                        </div>

                    `;

                }
            )
            .join("");

}


/* =========================================================
   ABRIR / FECHAR ADMIN
========================================================= */

function abrirAdmin() {

    if (
        !usuarioAtual ||
        usuarioAtual.tipo !== "admin"
    ) {

        return;

    }


    if (sistema) {

        sistema.style.display =
            "none";

    }


    if (painelAdmin) {

        painelAdmin.style.display =
            "block";

    }


    atualizarDashboard();

}


function fecharPainelAdmin() {

    if (painelAdmin) {

        painelAdmin.style.display =
            "none";

    }


    if (sistema) {

        sistema.style.display =
            "block";

    }

}


/* =========================================================
   IMPORTAÇÃO EXCEL
========================================================= */

async function importarExcel() {

    if (!inputExcel) {
        return;
    }


    const arquivo =
        inputExcel.files?.[0];


    if (!arquivo) {

        notificar(
            "Selecione uma planilha.",
            "error"
        );

        return;

    }


    if (
        typeof XLSX ===
        "undefined"
    ) {

        alert(
            "A biblioteca XLSX não foi carregada."
        );

        return;

    }


    try {

        const buffer =
            await arquivo.arrayBuffer();


        const workbook =
            XLSX.read(
                buffer,
                {
                    type: "array"
                }
            );


        const novosClientes =
            [];


        workbook.SheetNames.forEach(
            nomeAba => {

                const planilha =
                    workbook.Sheets[
                        nomeAba
                    ];


                const linhas =
                    XLSX.utils.sheet_to_json(
                        planilha,
                        {
                            defval: ""
                        }
                    );


                linhas.forEach(
                    linha => {

                        const ppoe =
                            obterCampo(
                                linha,
                                [
                                    "ppoe",
                                    "PPOE",
                                    "usuário",
                                    "usuario"
                                ]
                            );


                        const ip =
                            obterCampo(
                                linha,
                                [
                                    "ip",
                                    "IP"
                                ]
                            );


                        const sinal =
                            obterCampo(
                                linha,
                                [
                                    "sinal",
                                    "Sinal",
                                    "SIGNAL"
                                ]
                            );


                        const painel =
                            obterCampo(
                                linha,
                                [
                                    "painel",
                                    "Painel"
                                ]
                            );


                        const ipPainel =
                            obterCampo(
                                linha,
                                [
                                    "ip_painel",
                                    "ip painel",
                                    "IP Painel",
                                    "IP do Painel",
                                    "ip do painel"
                                ]
                            );


                        if (
                            !ppoe &&
                            !ip
                        ) {

                            return;

                        }


                        const status =
                            obterCampo(
                                linha,
                                [
                                    "status",
                                    "Status"
                                ]
                            );


                        novosClientes.push({

                            ppoe:
                                String(
                                    ppoe
                                ).trim(),

                            ip:
                                String(
                                    ip
                                ).trim(),

                            sinal:
                                String(
                                    sinal
                                ).trim(),

                            status:
                                status
                                    ? String(status).trim()
                                    : calcularStatus(
                                        sinal
                                    ),

                            painel:
                                String(
                                    painel
                                ).trim(),

                            ip_painel:
                                String(
                                    ipPainel
                                ).trim()

                        });

                    }
                );

            }
        );


        if (
            !novosClientes.length
        ) {

            alert(
                "Nenhum cliente encontrado na planilha."
            );

            return;

        }


        clientes =
            novosClientes;


        atualizarDashboard();


        notificar(
            `${clientes.length} clientes importados!`,
            "success"
        );


    } catch (erro) {

        console.error(
            erro
        );


        alert(
            "Erro ao importar a planilha."
        );

    }

}


function obterCampo(
    linha,
    nomes
) {

    const chaves =
        Object.keys(
            linha
        );


    for (
        const nome of nomes
    ) {

        const chave =
            chaves.find(
                item =>
                    normalizar(item) ===
                    normalizar(nome)
            );


        if (
            chave !== undefined
        ) {

            return linha[chave];

        }

    }


    return "";

}


function calcularStatus(
    sinal
) {

    const numero =
        parseFloat(
            String(
                sinal ?? ""
            )
            .replace(
                ",",
                "."
            )
        );


    if (
        Number.isNaN(numero)
    ) {

        return "";

    }


    if (
        numero >= -25
    ) {

        return "3";

    }


    if (
        numero >= -28
    ) {

        return "2";

    }


    return "1";

}


/* =========================================================
   BAIXAR JSON
========================================================= */

function baixarClientesJSON() {

    if (!clientes.length) {

        alert(
            "Nenhum cliente carregado."
        );

        return;

    }


    const blob =
        new Blob(
            [
                JSON.stringify(
                    clientes,
                    null,
                    4
                )
            ],
            {
                type:
                    "application/json"
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement(
            "a"
        );


    link.href =
        url;

    link.download =
        "clientes.json";


    document.body.appendChild(
        link
    );


    link.click();


    link.remove();


    URL.revokeObjectURL(
        url
    );

}


/* =========================================================
   COPIAR ESTATÍSTICAS
========================================================= */

async function copiarEstatisticasApp() {

    const dados =
        calcularDashboard();


    const percentual =
        dados.total > 0
            ? Math.round(
                (
                    dados.bom /
                    dados.total
                ) * 100
            )
            : 0;


    const texto = `

📊 ATUALIZE TELECOM

👥 Clientes: ${dados.total}
📡 Painéis: ${
        Object.keys(
            dados.paineis
        ).length
    }

🟢 Bom: ${dados.bom}
🟡 Médio: ${dados.medio}
🔴 Ruim: ${dados.ruim}

❤️ Saúde da rede: ${percentual}%

    `.trim();


    try {

        await navigator.clipboard.writeText(
            texto
        );


        notificar(
            "Estatísticas copiadas!",
            "success"
        );


    } catch {

        alert(
            texto
        );

    }

}


/* =========================================================
   ATUALIZAÇÃO DO PWA
========================================================= */

async function verificarVersao() {

    if (!versaoApp) {
        return;
    }


    try {

        const resposta =
            await fetch(
                `${CONFIG.arquivos.versao}?v=${Date.now()}`,
                {
                    cache: "no-store"
                }
            );


        if (!resposta.ok) {
            return;
        }


        const dados =
            await resposta.json();


        if (
            dados.version
        ) {

            versaoApp.textContent =
                `Versão ${dados.version}`;

        }


    } catch {

        console.warn(
            "Não foi possível verificar a versão."
        );

    }

}


async function atualizarAplicativo() {

    try {

        if (
            "serviceWorker" in
            navigator
        ) {

            const registros =
                await navigator
                    .serviceWorker
                    .getRegistrations();


            for (
                const registro
                of registros
            ) {

                await registro.update();

            }

        }


        if (
            window.caches
        ) {

            const nomes =
                await caches.keys();


            await Promise.all(
                nomes.map(
                    nome =>
                        caches.delete(
                            nome
                        )
                )
            );

        }

    } catch (erro) {

        console.warn(
            erro
        );

    }


    window.location.reload();

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
        () => {

            navigator.serviceWorker
                .register(
                    "./service-worker.js"
                )
                .then(
                    registro => {

                        console.log(
                            "✅ Service Worker registrado.",
                            registro
                        );

                    }
                )
                .catch(
                    erro => {

                        console.warn(
                            "Service Worker:",
                            erro
                        );

                    }
                );

        }
    );

}


/* =========================================================
   EVENTOS
========================================================= */

function configurarEventos() {

    /*
       LOGIN
    */

    btnLogin?.addEventListener(
        "click",
        evento => {

            evento.preventDefault();

            entrar();

        }
    );


    senhaInput?.addEventListener(
        "keydown",
        evento => {

            if (
                evento.key ===
                "Enter"
            ) {

                evento.preventDefault();

                entrar();

            }

        }
    );


    usuarioInput?.addEventListener(
        "keydown",
        evento => {

            if (
                evento.key ===
                "Enter"
            ) {

                evento.preventDefault();

                senhaInput?.focus();

            }

        }
    );


    /*
       SAIR
    */

    btnSair?.addEventListener(
        "click",
        evento => {

            evento.preventDefault();

            sair();

        }
    );


    /*
       ADMIN
    */

    btnAdmin?.addEventListener(
        "click",
        evento => {

            evento.preventDefault();

            abrirAdmin();

        }
    );


    fecharAdmin?.addEventListener(
        "click",
        evento => {

            evento.preventDefault();

            fecharPainelAdmin();

        }
    );


    /*
       PESQUISA
    */

    pesquisa?.addEventListener(
        "input",
        () => {

            clearTimeout(
                pesquisaTimeout
            );


            pesquisaTimeout =
                setTimeout(
                    pesquisarCliente,
                    120
                );

        }
    );


    /*
       EXCEL
    */

    btnImportarExcel?.addEventListener(
        "click",
        importarExcel
    );


    /*
       JSON
    */

    baixarJson?.addEventListener(
        "click",
        baixarClientesJSON
    );


    /*
       ESTATÍSTICAS
    */

    copiarEstatisticas?.addEventListener(
        "click",
        copiarEstatisticasApp
    );


    /*
       ATUALIZAÇÃO
    */

    btnAtualizarApp?.addEventListener(
        "click",
        atualizarAplicativo
    );


    /*
       ESC
    */

    document.addEventListener(
        "keydown",
        evento => {

            if (
                evento.key ===
                "Escape"
            ) {

                if (
                    painelAdmin &&
                    painelAdmin.style.display !==
                    "none"
                ) {

                    fecharPainelAdmin();

                }

            }

        }
    );

}


/* =========================================================
   INICIALIZAÇÃO
========================================================= */

async function iniciarAplicacao() {

    console.log(
        "🚀 Atualize Telecom iniciando..."
    );


    /*
       Tema primeiro.
    */

    inicializarTema();


    /*
       Eventos.
    */

    configurarEventos();


    /*
       Sessão.
    */

    verificarSessao();


    /*
       Clientes.
    */

    await carregarClientes();


    /*
       Versão.
    */

    verificarVersao();


    /*
       Service Worker.
    */

    registrarServiceWorker();


    console.log(
        "✅ Atualize Telecom pronto."
    );

}


/* =========================================================
   INICIAR
========================================================= */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        iniciarAplicacao,
        {
            once: true
        }
    );

} else {

    iniciarAplicacao();

}


/* =========================================================
   API GLOBAL
========================================================= */

window.AtualizeApp = {

    clientes:
        () => [...clientes],

    usuario:
        () =>
            usuarioAtual
                ? { ...usuarioAtual }
                : null,

    pesquisar:
        pesquisarCliente,

    atualizarDashboard:
        atualizarDashboard,

    alternarTema:
        alternarTema,

    entrar:
        entrar,

    sair:
        sair

};


console.log(
    "📡 Atualize Telecom — script carregado."
);
