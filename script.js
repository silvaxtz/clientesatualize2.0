/* =========================================================
   ATUALIZE TELECOM — APP CORE v2
   ========================================================= */

"use strict";

/* =========================
   CONFIGURAÇÃO
========================= */

const CONFIG = {
    arquivos: {
        clientes: "clientes.json",
        versao: "version.json"
    },

    armazenamento: {
        usuario: "usuarioAtual",
        historico: "historico_pesquisas",
        tema: "temaAtual"
    },

    historicoLimite: 8,
    intervaloAtualizacao: 10000
};

/* =========================
   USUÁRIOS
========================= */

const usuarios = [
    { usuario: "adriano", senha: "180405a", tipo: "admin" },
    { usuario: "julio", senha: "suporteatlz", tipo: "tecnico" },
    { usuario: "kristian", senha: "suporteatlz", tipo: "tecnico" },
    { usuario: "jeciana", senha: "suporteatlz", tipo: "tecnico" },
    { usuario: "nubia", senha: "suporteatlz", tipo: "tecnico" },
    { usuario: "jerbson", senha: "suporteatlz", tipo: "tecnico" }
];

/* =========================
   ESTADO GLOBAL
========================= */

let clientes = [];
let usuarioAtual = null;
let versaoAtual = null;
let filtroAtual = "";
let ultimaPesquisa = "";
let pesquisaTimeout = null;

/* =========================
   ELEMENTOS
========================= */

const $ = (id) => document.getElementById(id);

const loginTela = $("loginTela");
const sistema = $("sistema");
const painelAdmin = $("painelAdmin");

const usuarioInput = $("usuario");
const senhaInput = $("senha");
const erroLogin = $("erroLogin");

const btnLogin = $("btnLogin");
const btnSair = $("btnSair");
const btnAdmin = $("btnAdmin");
const fecharAdmin = $("fecharAdmin");
const usuarioLogado = $("usuarioLogado");

const pesquisa = $("pesquisa");
const resultado = $("resultado");
const divHistorico = $("historicoPesquisas");

const banner = $("updateBanner");
const btnAtualizar = $("btnAtualizarApp");
const versaoTexto = $("versaoApp");

const inputExcel = $("inputExcel");
const btnImportarExcel = $("btnImportarExcel");

const el = {
    totalClientes: $("totalClientes"),
    totalPaineis: $("totalPaineis"),
    totalBom: $("totalBom"),
    totalMedio: $("totalMedio"),
    totalRuim: $("totalRuim"),
    ranking: $("rankingPaineis"),
    copiarEstatisticas: $("copiarEstatisticas"),
    baixarJson: $("baixarJson")
};

/* =========================
   UTILITÁRIOS
========================= */

function escapeHTML(valor) {
    return String(valor ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function normalizar(valor) {
    return String(valor ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

function lerStorage(chave, fallback = null) {
    try {
        const valor = localStorage.getItem(chave);

        return valor === null
            ? fallback
            : JSON.parse(valor);

    } catch {
        return fallback;
    }
}

function salvarStorage(chave, valor) {
    try {
        localStorage.setItem(
            chave,
            JSON.stringify(valor)
        );

        return true;

    } catch (erro) {
        console.warn(
            "Não foi possível salvar no armazenamento:",
            erro
        );

        return false;
    }
}

function formatarIP(ip) {

    if (!ip) return "";

    let valor = String(ip).trim();

    if (valor.includes(".")) {
        return valor;
    }

    valor = valor.replace(/\D/g, "");

    if (valor.length === 12) {

        return valor.replace(
            /(\d{3})(\d{3})(\d{3})(\d{3})/,
            "$1.$2.$3.$4"
        );
    }

    return valor;
}

function copiarTexto(texto) {

    const valor = String(texto ?? "");

    if (!navigator.clipboard) {

        const textarea =
            document.createElement("textarea");

        textarea.value = valor;

        document.body.appendChild(textarea);

        textarea.select();

        document.execCommand("copy");

        textarea.remove();

        return Promise.resolve();
    }

    return navigator.clipboard.writeText(valor);
}

/* =========================
   NOTIFICAÇÕES
========================= */

function mostrarNotificacao(
    mensagem,
    tipo = "info"
) {

    let toast =
        document.getElementById("appToast");

    if (!toast) {

        toast =
            document.createElement("div");

        toast.id = "appToast";

        toast.setAttribute(
            "role",
            "status"
        );

        document.body.appendChild(toast);
    }

    toast.className =
        `app-toast app-toast-${tipo}`;

    toast.textContent = mensagem;

    toast.classList.add("show");

    clearTimeout(toast._timer);

    toast._timer =
        setTimeout(() => {

            toast.classList.remove("show");

        }, 2400);
}

/* =========================
   TEMA / MODO NOITE
========================= */

function obterTemaInicial() {

    const salvo =
        localStorage.getItem(
            CONFIG.armazenamento.tema
        );

    if (
        salvo === "dark" ||
        salvo === "light"
    ) {
        return salvo;
    }

    if (
        window.matchMedia &&
        window.matchMedia(
            "(prefers-color-scheme: dark)"
        ).matches
    ) {
        return "dark";
    }

    return "light";
}

function aplicarTema(
    tema = obterTemaInicial()
) {

    const modoNoite =
        tema === "dark";

    document.documentElement.dataset.theme =
        modoNoite ? "dark" : "light";

    document.body.classList.toggle(
        "dark-mode",
        modoNoite
    );

    localStorage.setItem(
        CONFIG.armazenamento.tema,
        modoNoite ? "dark" : "light"
    );

    atualizarControlesTema();
}

function alternarTema() {

    const atual =
        document.documentElement.dataset.theme ||
        obterTemaInicial();

    aplicarTema(
        atual === "dark"
            ? "light"
            : "dark"
    );
}

function atualizarControlesTema() {

    const ativo =
        document.documentElement.dataset.theme === "dark" ||
        document.body.classList.contains("dark-mode");

    document
        .querySelectorAll(
            "[data-theme-toggle], #btnTema, #btnModoNoite"
        )
        .forEach(botao => {

            botao.setAttribute(
                "aria-pressed",
                String(ativo)
            );

            botao.title =
                ativo
                    ? "Ativar modo claro"
                    : "Ativar modo noite";

            if (
                botao.dataset.themeToggle === "icon" ||
                botao.id === "btnTema" ||
                botao.id === "btnModoNoite"
            ) {

                botao.innerHTML =
                    ativo
                        ? "☀️"
                        : "🌙";
            }
        });
}

window.alternarTema =
    alternarTema;

function configurarTema() {

    aplicarTema();

    document.addEventListener(
        "click",
        evento => {

            const botao =
                evento.target.closest(
                    "[data-theme-toggle], #btnTema, #btnModoNoite"
                );

            if (!botao) return;

            evento.preventDefault();

            alternarTema();
        }
    );
}

/* =========================
   LOGIN
========================= */

function obterUsuarioSalvo() {

    return lerStorage(
        CONFIG.armazenamento.usuario,
        null
    );
}

function entrar() {

    const usuario =
        normalizar(
            usuarioInput?.value
        );

    const senha =
        senhaInput?.value || "";

    if (erroLogin) {
        erroLogin.textContent = "";
    }

    if (!usuario || !senha) {

        if (erroLogin) {

            erroLogin.textContent =
                "Informe usuário e senha.";
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

        senhaInput?.focus();

        return;
    }

    usuarioAtual = {
        ...encontrado
    };

    salvarStorage(
        CONFIG.armazenamento.usuario,
        usuarioAtual
    );

    carregarSistema();

    if (senhaInput) {
        senhaInput.value = "";
    }

    mostrarNotificacao(
        `Bem-vindo, ${encontrado.usuario}.`,
        "success"
    );
}

function sair() {

    localStorage.removeItem(
        CONFIG.armazenamento.usuario
    );

    usuarioAtual = null;

    if (pesquisa) {
        pesquisa.value = "";
    }

    if (resultado) {
        resultado.innerHTML = "";
    }

    carregarSistema();

    mostrarNotificacao(
        "Sessão encerrada.",
        "info"
    );
}

function carregarSistema() {

    const salvo =
        obterUsuarioSalvo();

    usuarioAtual = salvo;

    if (!salvo) {

        if (loginTela)
            loginTela.style.display = "block";

        if (sistema)
            sistema.style.display = "none";

        if (painelAdmin)
            painelAdmin.style.display = "none";

        atualizarControlesTema();

        return;
    }

    if (loginTela)
        loginTela.style.display = "none";

    if (sistema)
        sistema.style.display = "block";

    if (painelAdmin)
        painelAdmin.style.display = "none";

    if (usuarioLogado) {

        usuarioLogado.innerHTML =
            `👤 ${escapeHTML(salvo.usuario)}
             <span>(${escapeHTML(salvo.tipo)})</span>`;
    }

    if (btnAdmin) {

        btnAdmin.style.display =
            salvo.tipo === "admin"
                ? "inline-block"
                : "none";
    }

    renderizarHistorico();

    atualizarControlesTema();
}

function configurarLogin() {

    btnLogin?.addEventListener(
        "click",
        entrar
    );

    senhaInput?.addEventListener(
        "keydown",
        evento => {

            if (evento.key === "Enter") {
                entrar();
            }
        }
    );

    usuarioInput?.addEventListener(
        "keydown",
        evento => {

            if (evento.key === "Enter") {
                senhaInput?.focus();
            }
        }
    );

    btnSair?.addEventListener(
        "click",
        sair
    );
}

/* =========================
   CLIENTES
========================= */

async function carregarClientes() {

    try {

        const resposta = await fetch(
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

        const dados = await resposta.json();

        if (!Array.isArray(dados)) {
            throw new Error(
                "Formato inválido do clientes.json."
            );
        }

        clientes = dados;

        atualizarDashboard();
        renderizarHistorico();

    } catch (erro) {

        console.warn(
            "Não foi possível carregar clientes:",
            erro
        );

        clientes = [];

        if (resultado && usuarioAtual) {

            resultado.innerHTML = `
                <div class="nao-encontrado">
                    <div class="icone">📡</div>

                    <h2>
                        Dados indisponíveis
                    </h2>

                    <p>
                        Não foi possível carregar
                        a base de clientes.
                    </p>
                </div>
            `;
        }
    }
}


/* =========================
   STATUS DO CLIENTE
========================= */

function obterStatus(status) {

    const numero =
        Number(status);

    if (numero === 3) {

        return {
            texto: "Bom",
            icone: "🟢",
            classe: "status-bom"
        };
    }

    if (numero === 2) {

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


/* =========================
   ALERTA DE SINAL
========================= */

function obterAlertaSinal(sinal) {

    const numero =
        parseFloat(
            String(sinal ?? "")
                .replace(",", ".")
        );

    if (Number.isNaN(numero)) {
        return "";
    }

    if (numero <= -81) {

        return `
            <div class="alerta-critico">

                ⚠️

                <strong>
                    Sinal crítico
                </strong>

                <span>
                    ${escapeHTML(sinal)} dBm
                </span>

                <small>
                    Verificar o sinal imediatamente.
                </small>

            </div>
        `;
    }

    if (numero <= -70) {

        return `
            <div class="alerta-critico alerta-atencao">

                ⚠️

                <strong>
                    Atenção ao sinal
                </strong>

                <span>
                    ${escapeHTML(sinal)} dBm
                </span>

                <small>
                    Sinal fora do ideal.
                </small>

            </div>
        `;
    }

    return "";
}


/* =========================
   ENCONTRAR CLIENTE
========================= */

function encontrarCliente(texto) {

    const busca =
        normalizar(texto);

    if (!busca) {
        return null;
    }

    return clientes.find(cliente => {

        const campos = [

            cliente.ppoe,
            cliente.ip,
            cliente.ssid,
            cliente.painel,
            cliente.ip_painel

        ];

        return campos.some(
            campo =>
                normalizar(campo)
                    .includes(busca)
        );

    }) || null;
}


/* =========================
   DESTACAR PESQUISA
========================= */

function destacarTexto(
    texto,
    termo
) {

    const seguro =
        escapeHTML(texto);

    if (!termo) {
        return seguro;
    }

    const regex =
        new RegExp(
            termo.replace(
                /[.*+?^${}()|[\]\\]/g,
                "\\$&"
            ),
            "gi"
        );

    return seguro.replace(
        regex,
        match =>
            `<mark>${match}</mark>`
    );
}


/* =========================
   PESQUISAR CLIENTE
========================= */

function pesquisarCliente() {

    const texto =
        pesquisa?.value.trim() || "";

    filtroAtual = texto;

    if (!texto) {

        ultimaPesquisa = "";

        if (resultado) {
            resultado.innerHTML = "";
        }

        return;
    }

    const cliente =
        encontrarCliente(texto);

    if (!cliente) {

        resultado.innerHTML = `

            <div class="nao-encontrado">

                <div class="icone">
                    🔍
                </div>

                <h2>
                    Cliente não encontrado
                </h2>

                <p>
                    Pesquise por PPOE,
                    IP, SSID ou painel.
                </p>

            </div>

        `;

        return;
    }

    ultimaPesquisa =
        cliente.ppoe || texto;

    renderizarCliente(
        cliente,
        texto
    );
}


/* =========================
   RENDERIZAR CLIENTE
========================= */

function renderizarCliente(
    cliente,
    termo = ""
) {

    const status =
        obterStatus(
            cliente.status
        );

    const alerta =
        obterAlertaSinal(
            cliente.sinal
        );

    const ip =
        formatarIP(
            cliente.ip
        );

    const ipPainel =
        formatarIP(
            cliente.ip_painel
        );

    const ppoe =
        String(
            cliente.ppoe ?? ""
        );

    const ssid =
        String(
            cliente.ssid ?? ""
        );

    const painel =
        String(
            cliente.painel ?? ""
        );

    const sinal =
        String(
            cliente.sinal ?? ""
        );

    resultado.innerHTML = `

        <article class="cliente-card">

            <div class="cliente-card-topo">

                <div>

                    <span class="cliente-label">
                        CLIENTE
                    </span>

                    <h2>
                        ${destacarTexto(
                            ppoe,
                            termo
                        )}
                    </h2>

                </div>

                <div class="${status.classe}">

                    ${status.icone}

                    ${status.texto}

                </div>

            </div>


            ${alerta}


            <div class="cliente-grid">


                <div class="campo">

                    <div class="titulo">
                        PPOE
                    </div>

                    <div class="valor">
                        ${escapeHTML(ppoe)
                            || "Não informado"}
                    </div>

                </div>


                <div class="campo">

                    <div class="titulo">
                        Painel
                    </div>

                    <div class="valor">
                        ${escapeHTML(painel)
                            || "Não informado"}
                    </div>

                </div>


                <div class="campo">

                    <div class="titulo">
                        IP
                    </div>

                    <div class="valor">
                        ${escapeHTML(ip)
                            || "Não informado"}
                    </div>

                </div>


                <div class="campo">

                    <div class="titulo">
                        IP do Painel
                    </div>

                    <div class="valor">
                        ${escapeHTML(ipPainel)
                            || "Não informado"}
                    </div>

                </div>


                <div class="campo">

                    <div class="titulo">
                        SSID
                    </div>

                    <div class="valor">
                        ${escapeHTML(ssid)
                            || "Não informado"}
                    </div>

                </div>


                <div class="campo">

                    <div class="titulo">
                        Última Medição
                    </div>

                    <div class="valor">

                        ${escapeHTML(sinal)}

                        ${sinal ? " dBm" : ""}

                    </div>

                </div>


            </div>


            <div class="botoes-copiar">


                <button
                    type="button"
                    onclick="copiarEsalvar(
                        '${escapeJS(ip)}',
                        '${escapeJS(ppoe)}'
                    )"
                >
                    📋 Copiar IP
                </button>


                <button
                    type="button"
                    onclick="copiarEsalvar(
                        '${escapeJS(ipPainel)}',
                        '${escapeJS(ppoe)}'
                    )"
                >
                    📋 Copiar IP Painel
                </button>


                <button
                    type="button"
                    onclick="copiarEsalvar(
                        '${escapeJS(ppoe)}',
                        '${escapeJS(ppoe)}'
                    )"
                >
                    📋 Copiar PPOE
                </button>


                <button
                    type="button"
                    onclick="copiarEsalvar(
                        '${escapeJS(ssid)}',
                        '${escapeJS(ppoe)}'
                    )"
                >
                    📋 Copiar SSID
                </button>


            </div>

        </article>

    `;
}


/* =========================
   ESCAPAR TEXTO PARA JS
========================= */

function escapeJS(valor) {

    return String(valor ?? "")

        .replace(
            /\\/g,
            "\\\\"
        )

        .replace(
            /'/g,
            "\\'"
        )

        .replace(
            /\r/g,
            "\\r"
        )

        .replace(
            /\n/g,
            "\\n"
        );
}


/* =========================
   HISTÓRICO
========================= */

function obterHistorico() {

    const historico =
        lerStorage(
            CONFIG.armazenamento.historico,
            []
        );

    return Array.isArray(historico)
        ? historico
        : [];
}


function salvarNoHistorico(
    ppoe
) {

    if (!ppoe) {
        return;
    }

    let historico =
        obterHistorico()
            .filter(
                item =>
                    item !== ppoe
            );

    historico.unshift(ppoe);

    historico =
        historico.slice(
            0,
            CONFIG.historicoLimite
        );

    salvarStorage(
        CONFIG.armazenamento.historico,
        historico
    );

    renderizarHistorico();
}


function renderizarHistorico() {

    if (!divHistorico) {
        return;
    }

    const historico =
        obterHistorico();

    if (!historico.length) {

        divHistorico.innerHTML = "";

        return;
    }

    divHistorico.innerHTML = `

        <div class="historico-cabecalho">

            <span>
                Pesquisas recentes
            </span>

            <button
                type="button"
                class="limpar-historico"
                onclick="limparHistorico()"
            >
                Limpar
            </button>

        </div>


        <div class="historico-lista">

            ${historico.map(item => `

                <button
                    type="button"
                    class="btn-historico"
                    onclick="usarHistorico(
                        '${escapeJS(item)}'
                    )"
                >

                    🕒

                    ${escapeHTML(item)}

                </button>

            `).join("")}

        </div>

    `;
}


function limparHistorico() {

    localStorage.removeItem(
        CONFIG.armazenamento.historico
    );

    renderizarHistorico();

    mostrarNotificacao(
        "Histórico limpo.",
        "success"
    );
}


window.limparHistorico =
    limparHistorico;


window.usarHistorico =
    function(termo) {

        if (!pesquisa) {
            return;
        }

        pesquisa.value =
            termo;

        pesquisarCliente();

        pesquisa.focus();
    };


/* =========================
   COPIAR
========================= */

window.copiarEsalvar =
    async function(
        textoParaCopiar,
        ppoeParaHistorico
    ) {

        try {

            await copiarTexto(
                textoParaCopiar
            );

            if (ppoeParaHistorico) {

                salvarNoHistorico(
                    ppoeParaHistorico
                );
            }

            mostrarNotificacao(
                "Copiado para a área de transferência.",
                "success"
            );

        } catch (erro) {

            console.error(erro);

            mostrarNotificacao(
                "Não foi possível copiar.",
                "error"
            );
        }
    };


/* =========================
   CONFIGURAÇÃO DA PESQUISA
========================= */

function configurarPesquisa() {

    pesquisa?.addEventListener(
        "input",
        () => {

            clearTimeout(
                pesquisaTimeout
            );

            pesquisaTimeout =
                setTimeout(
                    () => {
                        pesquisarCliente();
                    },
                    120
                );
        }
    );


    pesquisa?.addEventListener(
        "keydown",
        evento => {

            if (evento.key === "Escape") {

                pesquisa.value = "";

                pesquisarCliente();
            }
        }
    );
}

/* =========================
   DASHBOARD
========================= */

function calcularEstatisticas(lista = clientes) {

    const total = lista.length;

    const bom =
        lista.filter(
            cliente =>
                Number(cliente.status) === 3
        ).length;

    const medio =
        lista.filter(
            cliente =>
                Number(cliente.status) === 2
        ).length;

    const ruim =
        total - bom - medio;

    const paineis = [
        ...new Set(
            lista
                .map(
                    cliente =>
                        String(
                            cliente.painel ?? ""
                        ).trim()
                )
                .filter(Boolean)
        )
    ];

    const percentualSaude =
        total
            ? Math.round(
                (bom / total) * 100
            )
            : 0;

    return {
        total,
        bom,
        medio,
        ruim,
        paineis: paineis.length,
        percentualSaude
    };
}


/* =========================
   ATUALIZAR DASHBOARD
========================= */

function atualizarDashboard() {

    if (!clientes.length) {

        if (el.totalClientes)
            el.totalClientes.textContent = "0";

        if (el.totalPaineis)
            el.totalPaineis.textContent = "0";

        if (el.totalBom)
            el.totalBom.textContent = "0";

        if (el.totalMedio)
            el.totalMedio.textContent = "0";

        if (el.totalRuim)
            el.totalRuim.textContent = "0";

        if (el.ranking)
            el.ranking.innerHTML = "";

        atualizarIndicadorSaude(0);

        return;
    }


    const dados =
        calcularEstatisticas();


    if (el.totalClientes)
        el.totalClientes.textContent =
            dados.total;


    if (el.totalPaineis)
        el.totalPaineis.textContent =
            dados.paineis;


    if (el.totalBom)
        el.totalBom.textContent =
            dados.bom;


    if (el.totalMedio)
        el.totalMedio.textContent =
            dados.medio;


    if (el.totalRuim)
        el.totalRuim.textContent =
            dados.ruim;


    /* =========================
       RANKING DE PAINÉIS
    ========================= */

    const ranking = {};


    clientes.forEach(
        cliente => {

            const painel =
                String(
                    cliente.painel ?? ""
                ).trim() ||
                "Sem painel";


            ranking[painel] =
                (ranking[painel] || 0) + 1;
        }
    );


    const top10 =
        Object.entries(ranking)
            .sort(
                (a, b) =>
                    b[1] - a[1]
            )
            .slice(0, 10);


    if (el.ranking) {

        if (!top10.length) {

            el.ranking.innerHTML = `
                <div class="sem-dados">
                    Nenhum painel encontrado.
                </div>
            `;

        } else {

            const maior =
                top10[0][1];


            el.ranking.innerHTML =
                top10.map(
                    (item, index) => {

                        const percentual =
                            Math.max(
                                8,
                                (item[1] /
                                    maior) *
                                100
                            );


                        return `

                            <div
                                class="ranking-item"
                                data-painel="${escapeHTML(
                                    item[0]
                                )}"
                            >

                                <span
                                    class="ranking-pos"
                                >
                                    ${index + 1}
                                </span>


                                <div
                                    class="ranking-info"
                                >

                                    <strong>
                                        ${escapeHTML(
                                            item[0]
                                        )}
                                    </strong>

                                    <small>
                                        ${item[1]}
                                        ${
                                            item[1] === 1
                                                ? "cliente"
                                                : "clientes"
                                        }
                                    </small>

                                </div>


                                <span
                                    class="ranking-bar"
                                >
                                    <i
                                        style="
                                            width:${percentual}%
                                        "
                                    ></i>
                                </span>

                            </div>

                        `;
                    }
                ).join("");
        }
    }


    atualizarIndicadorSaude(
        dados.percentualSaude
    );
}


/* =========================
   SAÚDE DA REDE
========================= */

function atualizarIndicadorSaude(
    percentual
) {

    const texto =
        `${percentual}%`;


    const saudeRede =
        $("saudeRede");

    const percentualSaude =
        $("percentualSaude");

    const barraSaude =
        $("barraSaude");


    if (saudeRede) {

        saudeRede.textContent =
            texto;
    }


    if (percentualSaude) {

        percentualSaude.textContent =
            texto;
    }


    if (barraSaude) {

        barraSaude.style.width =
            texto;
    }


    /* Compatibilidade com
       possíveis elementos futuros */

    document
        .querySelectorAll(
            "[data-health-value]"
        )
        .forEach(
            elemento => {

                elemento.textContent =
                    texto;
            }
        );


    document
        .querySelectorAll(
            "[data-health-bar]"
        )
        .forEach(
            elemento => {

                elemento.style.width =
                    texto;
            }
        );
}


/* =========================
   PAINEL ADMINISTRATIVO
========================= */

function abrirAdmin() {

    if (
        !usuarioAtual ||
        usuarioAtual.tipo !== "admin"
    ) {

        mostrarNotificacao(
            "Acesso restrito ao administrador.",
            "error"
        );

        return;
    }


    if (sistema)
        sistema.style.display = "none";


    if (painelAdmin)
        painelAdmin.style.display = "block";


    atualizarDashboard();
}


function fecharPainelAdmin() {

    if (painelAdmin)
        painelAdmin.style.display = "none";


    if (sistema)
        sistema.style.display = "block";
}


/* =========================
   COPIAR ESTATÍSTICAS
========================= */

function copiarEstatisticas() {

    const dados =
        calcularEstatisticas();


    const texto = [

        "📊 Estatísticas Atualize Telecom",

        `👥 Clientes: ${dados.total}`,

        `📡 Painéis: ${dados.paineis}`,

        `🟢 Bom: ${dados.bom}`,

        `🟡 Médio: ${dados.medio}`,

        `🔴 Ruim: ${dados.ruim}`,

        `❤️ Saúde da rede: ${dados.percentualSaude}%`

    ].join("\n");


    copiarTexto(texto)

        .then(
            () => {

                mostrarNotificacao(
                    "Estatísticas copiadas.",
                    "success"
                );
            }
        )

        .catch(
            () => {

                mostrarNotificacao(
                    "Não foi possível copiar.",
                    "error"
                );
            }
        );
}


/* =========================
   BAIXAR JSON
========================= */

function baixarJSON() {

    try {

        const blob =
            new Blob(
                [
                    JSON.stringify(
                        clientes,
                        null,
                        2
                    )
                ],
                {
                    type:
                        "application/json;charset=utf-8"
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


        link.href = url;


        link.download =
            `clientes-${
                new Date()
                    .toISOString()
                    .slice(0, 10)
            }.json`;


        document.body.appendChild(
            link
        );


        link.click();


        link.remove();


        setTimeout(
            () =>
                URL.revokeObjectURL(
                    url
                ),
            500
        );


        mostrarNotificacao(
            "clientes.json exportado.",
            "success"
        );


    } catch (erro) {

        console.error(
            "Erro ao exportar:",
            erro
        );


        mostrarNotificacao(
            "Falha ao exportar os clientes.",
            "error"
        );
    }
}


/* =========================
   CONFIGURAR DASHBOARD
========================= */

function configurarDashboard() {

    btnAdmin?.addEventListener(
        "click",
        abrirAdmin
    );


    fecharAdmin?.addEventListener(
        "click",
        fecharPainelAdmin
    );


    el.copiarEstatisticas
        ?.addEventListener(
            "click",
            copiarEstatisticas
        );


    el.baixarJson
        ?.addEventListener(
            "click",
            baixarJSON
        );
}


/* =========================================================
   IMPORTAÇÃO EXCEL
========================================================= */

function calcularStatusPorSinal(
    sinal
) {

    const numero =
        parseFloat(
            String(sinal ?? "")
                .replace(",", ".")
        );


    if (Number.isNaN(numero)) {
        return 1;
    }


    if (numero >= -65) {
        return 3;
    }


    if (numero >= -75) {
        return 2;
    }


    return 1;
}


/* =========================
   IMPORTAR PLANILHA
========================= */

function importarPlanilha() {

    const arquivo =
        inputExcel?.files?.[0];


    if (!arquivo) {

        mostrarNotificacao(
            "Selecione uma planilha Excel primeiro.",
            "error"
        );

        return;
    }


    const extensao =
        arquivo.name
            .split(".")
            .pop()
            .toLowerCase();


    if (
        !["xlsx", "xls"]
            .includes(extensao)
    ) {

        mostrarNotificacao(
            "Selecione um arquivo Excel válido.",
            "error"
        );

        return;
    }


    if (
        typeof XLSX === "undefined"
    ) {

        mostrarNotificacao(
            "A biblioteca Excel não foi carregada.",
            "error"
        );

        return;
    }


    const reader =
        new FileReader();


    reader.onload =
        evento => {

            try {

                const data =
                    new Uint8Array(
                        evento.target.result
                    );


                const workbook =
                    XLSX.read(
                        data,
                        {
                            type: "array"
                        }
                    );


                const novosClientes = [];

                const abasProcessadas = [];

                const abasIgnoradas = [];


                workbook.SheetNames
                    .forEach(
                        nomeAba => {

                            const worksheet =
                                workbook.Sheets[
                                    nomeAba
                                ];


                            const valorA4 =
                                String(
                                    worksheet[
                                        "A4"
                                    ]?.v ?? ""
                                ).trim();


                            /*
                               Se a aba não tiver
                               identificação do painel,
                               ela é ignorada.
                            */

                            if (!valorA4) {

                                abasIgnoradas
                                    .push(
                                        nomeAba
                                    );

                                return;
                            }


                            const nomePainel =
                                `P ${valorA4}`;


                            const ipPainel =
                                formatarIP(
                                    worksheet[
                                        "D4"
                                    ]?.v ?? ""
                                );


                            const ssid =
                                String(
                                    worksheet[
                                        "J4"
                                    ]?.v ?? ""
                                ).trim();


                            const rows =
                                XLSX.utils
                                    .sheet_to_json(
                                        worksheet,
                                        {
                                            header: 1,
                                            defval: ""
                                        }
                                    );


                            let clientesAba = 0;


                            /*
                               Dados dos clientes
                               começam na linha 8.
                            */

                            for (
                                let i = 7;
                                i < rows.length;
                                i++
                            ) {

                                const row =
                                    rows[i];


                                if (
                                    !Array.isArray(
                                        row
                                    ) ||
                                    !row.length
                                ) {
                                    continue;
                                }


                                const ppoe =
                                    String(
                                        row[0] ?? ""
                                    ).trim();


                                const ip =
                                    String(
                                        row[3] ?? ""
                                    ).trim();


                                const sinalRaw =
                                    row[6];


                                /*
                                   Ignora linha
                                   completamente vazia.
                                */

                                if (
                                    !ppoe &&
                                    !ip &&
                                    (
                                        sinalRaw === "" ||
                                        sinalRaw === null ||
                                        sinalRaw === undefined
                                    )
                                ) {
                                    continue;
                                }


                                const sinal =
                                    String(
                                        sinalRaw ?? ""
                                    ).trim();


                                novosClientes.push({

                                    ppoe,

                                    painel:
                                        nomePainel,

                                    ip,

                                    ip_painel:
                                        ipPainel,

                                    ssid,

                                    sinal,

                                    status:
                                        calcularStatusPorSinal(
                                            sinal
                                        )

                                });


                                clientesAba++;
                            }


                            abasProcessadas.push({

                                nome:
                                    nomeAba,

                                clientes:
                                    clientesAba

                            });

                        }
                    );


                /*
                   Nenhum cliente encontrado.
                */

                if (
                    !novosClientes.length
                ) {

                    mostrarNotificacao(
                        "Nenhum cliente válido foi encontrado.",
                        "error"
                    );

                    return;
                }


                /*
                   Substitui a base atual
                   pela nova importação.
                */

                clientes =
                    novosClientes;


                atualizarDashboard();


                if (inputExcel) {
                    inputExcel.value = "";
                }


                const totalAbas =
                    abasProcessadas.length;


                const totalClientes =
                    novosClientes.length;


                mostrarNotificacao(
                    `Importação concluída: ${totalClientes} clientes em ${totalAbas} abas.`,
                    "success"
                );


                console.info(
                    "Importação Excel:",
                    {
                        clientes:
                            totalClientes,

                        abasProcessadas,

                        abasIgnoradas
                    }
                );


            } catch (erro) {

                console.error(
                    "Erro na importação:",
                    erro
                );


                mostrarNotificacao(
                    `Erro na importação: ${erro.message}`,
                    "error"
                );
            }
        };


    reader.onerror =
        () => {

            mostrarNotificacao(
                "Não foi possível ler o arquivo.",
                "error"
            );
        };


    reader.readAsArrayBuffer(
        arquivo
    );
}


/* =========================
   CONFIGURAR IMPORTAÇÃO
========================= */

function configurarImportacao() {

    btnImportarExcel
        ?.addEventListener(
            "click",
            importarPlanilha
        );
}

/* =========================================================
   ATUALIZAÇÃO DO APLICATIVO
========================================================= */

async function verificarNovaVersao() {

    try {

        const resposta =
            await fetch(
                `${CONFIG.arquivos.versao}?v=${Date.now()}`,
                {
                    cache: "no-store"
                }
            );


        if (!resposta.ok) {

            throw new Error(
                "version.json indisponível"
            );
        }


        const dados =
            await resposta.json();


        const novaVersao =
            String(
                dados.version ?? ""
            ).trim();


        if (!novaVersao) {
            return;
        }


        /*
           Primeira leitura:
           apenas registra a versão atual.
        */

        if (versaoAtual === null) {

            versaoAtual =
                novaVersao;


            if (versaoTexto) {

                versaoTexto.textContent =
                    `Versão ${novaVersao}`;
            }


            return;
        }


        /*
           Se mudou, mostra o banner.
        */

        if (
            novaVersao !==
            versaoAtual
        ) {

            if (banner) {

                banner.style.display =
                    "flex";


                banner.setAttribute(
                    "aria-hidden",
                    "false"
                );
            }
        }


    } catch (erro) {

        /*
           Falha na verificação de versão
           não deve derrubar o sistema.
        */

        console.debug(
            "Verificação de atualização:",
            erro.message
        );
    }
}


/* =========================
   ATUALIZAR APLICATIVO
========================= */

async function atualizarAplicativo() {

    try {

        /*
           Se existir Service Worker,
           tenta buscar uma versão nova.
        */

        const registro =
            await navigator
                .serviceWorker
                ?.getRegistration();


        if (registro) {

            await registro.update();


            /*
               Existe uma nova versão
               esperando ativação.
            */

            if (registro.waiting) {

                registro.waiting
                    .postMessage({

                        type:
                            "SKIP_WAITING"

                    });


                return;
            }
        }


        /*
           Fallback:
           recarrega normalmente.
        */

        window.location.reload(true);


    } catch (erro) {

        console.error(
            "Erro ao atualizar:",
            erro
        );


        window.location.reload();
    }
}


/* =========================
   CONFIGURAR ATUALIZAÇÃO
========================= */

function configurarAtualizacao() {

    btnAtualizar
        ?.addEventListener(
            "click",
            atualizarAplicativo
        );


    /*
       Quando o novo Service Worker
       assumir o controle, recarrega.
    */

    if (
        "serviceWorker" in
        navigator
    ) {

        navigator
            .serviceWorker
            .addEventListener(
                "controllerchange",
                () => {

                    window.location.reload();
                }
            );
    }


    /*
       Primeira verificação.
    */

    verificarNovaVersao();


    /*
       Verifica novamente
       periodicamente.
    */

    setInterval(
        verificarNovaVersao,
        CONFIG.intervaloAtualizacao
    );
}


/* =========================================================
   ATALHOS DE TECLADO
========================================================= */

function configurarAtalhos() {

    document.addEventListener(
        "keydown",
        evento => {

            const tag =
                document.activeElement
                    ?.tagName
                    ?.toLowerCase();


            /*
               "/" abre a pesquisa.
            */

            if (
                evento.key === "/" &&
                ![
                    "input",
                    "textarea"
                ].includes(tag)
            ) {

                evento.preventDefault();

                pesquisa?.focus();
            }


            /*
               ESC fecha o painel administrativo.
            */

            if (
                evento.key === "Escape" &&
                painelAdmin
                    ?.style
                    .display === "block"
            ) {

                fecharPainelAdmin();
            }


            /*
               CTRL + SHIFT + L
               alterna modo claro/noite.
            */

            if (
                evento.ctrlKey &&
                evento.shiftKey &&
                evento.key.toLowerCase() === "l"
            ) {

                evento.preventDefault();

                alternarTema();
            }

        }
    );
}


/* =========================================================
   INICIALIZAÇÃO
========================================================= */

async function iniciarAplicacao() {

    console.log(
        "🚀 Iniciando Atualize Telecom..."
    );


    /*
       Visual / tema
    */

    configurarTema();


    /*
       Login
    */

    configurarLogin();


    /*
       Pesquisa
    */

    configurarPesquisa();


    /*
       Dashboard
    */

    configurarDashboard();


    /*
       Excel
    */

    configurarImportacao();


    /*
       Atualizações
    */

    configurarAtualizacao();


    /*
       Atalhos
    */

    configurarAtalhos();


    /*
       Verifica sessão existente.
    */

    carregarSistema();


    /*
       Carrega clientes.
    */

    await carregarClientes();


    console.log(
        "✅ Atualize Telecom iniciado."
    );
}


/* =========================================================
   INICIAR QUANDO O DOM ESTIVER PRONTO
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
   Permite que outras partes do sistema
   conversem com o JavaScript principal.
========================================================= */

window.AtualizeApp = {

    /*
       Dados
    */

    getClientes:
        () => [...clientes],


    getUsuario:
        () =>
            usuarioAtual
                ? { ...usuarioAtual }
                : null,


    /*
       Pesquisa
    */

    pesquisar:
        pesquisarCliente,


    /*
       Dashboard
    */

    atualizarDashboard:
        atualizarDashboard,


    /*
       Excel
    */

    importarPlanilha:
        importarPlanilha,


    /*
       Tema
    */

    alternarTema:
        alternarTema,


    /*
       Sessão
    */

    sair:
        sair,


    /*
       Histórico
    */

    limparHistorico:
        limparHistorico

};


/* =========================================================
   FIM DO APP CORE
========================================================= */

console.log(
    "📡 Atualize Telecom — Core carregado."
);
