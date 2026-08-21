/* =========================================================
   ATUALIZE TELECOM
   SCRIPT PRINCIPAL - V2
   ========================================================= */


/* =========================================================
   CONFIGURAÇÕES
   ========================================================= */

const CONFIG = {
    historicoMaximo: 8,
    intervaloVersao: 30000,
    chaveUsuario: "usuarioAtual",
    chaveHistorico: "historico_pesquisas",
    chaveTema: "tema_atualize",
    arquivoClientes: "clientes.json"
};


/* =========================================================
   USUÁRIOS
   ========================================================= */

const usuarios = [
    { usuario: "adriano", senha: "180405a", tipo: "admin" },
    { usuario: "julio", senha: "suporteatlz", tipo: "tecnico" },
    { usuario: "kristian", senha: "suporteatlz", tipo: "tecnico" },
    { usuario: "jeciana", senha: "suporteatlz", tipo: "tecnico" },
    { usuario: "nubia", senha: "suporteatlz", tipo: "tecnico" },
    { usuario: "jerbson", senha: "suporteatlz", tipo: "tecnico" }
];


/* =========================================================
   VARIÁVEIS
   ========================================================= */

let clientes = [];
let versaoAtual = null;
let buscaTimeout = null;


/* =========================================================
   ELEMENTOS
   ========================================================= */

const $ = id => document.getElementById(id);

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

const inputExcel = $("inputExcel");
const btnImportarExcel = $("btnImportarExcel");

const btnCopiarEstatisticas = $("copiarEstatisticas");
const btnBaixarJson = $("baixarJson");

const banner = $("updateBanner");
const btnAtualizar = $("btnAtualizarApp");
const versaoTexto = $("versaoApp");


/* =========================================================
   UTILIDADES
   ========================================================= */

function escaparHTML(valor) {

    if (valor === null || valor === undefined) {
        return "";
    }

    return String(valor)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function formatarIP(ip) {

    if (ip === null || ip === undefined || ip === "") {
        return "";
    }

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


function numeroSinal(valor) {

    if (valor === null || valor === undefined) {
        return NaN;
    }

    const texto = String(valor)
        .replace(",", ".")
        .replace(/[^\d.-]/g, "");

    return parseFloat(texto);
}


function copiarTexto(texto) {

    if (!texto) {
        mostrarToast("Nada para copiar.", "error");
        return Promise.reject();
    }

    if (navigator.clipboard && window.isSecureContext) {

        return navigator.clipboard.writeText(texto);

    }

    const textarea = document.createElement("textarea");

    textarea.value = texto;

    textarea.style.position = "fixed";
    textarea.style.opacity = "0";

    document.body.appendChild(textarea);

    textarea.select();

    try {
        document.execCommand("copy");
    } catch (erro) {
        console.error(erro);
    }

    textarea.remove();

    return Promise.resolve();
}


/* =========================================================
   TOAST
   ========================================================= */

function mostrarToast(mensagem, tipo = "success") {

    let toast = document.getElementById("appToast");

    if (!toast) {

        toast = document.createElement("div");

        toast.id = "appToast";

        toast.className = "app-toast";

        document.body.appendChild(toast);
    }

    toast.className =
        `app-toast show app-toast-${tipo}`;

    toast.textContent = mensagem;

    clearTimeout(toast._timer);

    toast._timer = setTimeout(() => {

        toast.classList.remove("show");

    }, 2500);
}


/* =========================================================
   TEMA
   ========================================================= */

function aplicarTema(tema) {

    if (tema === "dark") {

        document.documentElement.setAttribute(
            "data-theme",
            "dark"
        );

    } else {

        document.documentElement.setAttribute(
            "data-theme",
            "light"
        );

    }

    localStorage.setItem(
        CONFIG.chaveTema,
        tema
    );

    atualizarBotaoTema();
}


function iniciarTema() {

    let tema = localStorage.getItem(
        CONFIG.chaveTema
    );

    if (!tema) {

        tema =
            window.matchMedia &&
            window.matchMedia("(prefers-color-scheme: dark)").matches
                ? "dark"
                : "light";
    }

    aplicarTema(tema);
}


function alternarTema() {

    const atual =
        document.documentElement.getAttribute("data-theme");

    aplicarTema(
        atual === "dark"
            ? "light"
            : "dark"
    );
}


function criarBotaoTema() {

    if (document.getElementById("btnTema")) {
        return;
    }

    const botao = document.createElement("button");

    botao.id = "btnTema";

    botao.className = "icon-button";

    botao.type = "button";

    botao.title = "Alternar modo claro/escuro";

    botao.addEventListener(
        "click",
        alternarTema
    );

    const alvo =
        document.querySelector(".topo");

    if (alvo) {

        alvo.appendChild(botao);

    } else {

        botao.style.position = "fixed";
        botao.style.top = "15px";
        botao.style.right = "15px";
        botao.style.zIndex = "9999";

        document.body.appendChild(botao);
    }

    atualizarBotaoTema();
}


function atualizarBotaoTema() {

    const botao = document.getElementById("btnTema");

    if (!botao) {
        return;
    }

    const tema =
        document.documentElement.getAttribute("data-theme");

    if (tema === "dark") {

        botao.textContent = "☀️";
        botao.title = "Ativar modo claro";

    } else {

        botao.textContent = "🌙";
        botao.title = "Ativar modo noite";
    }
}


/* =========================================================
   LOGIN
   ========================================================= */

function entrar() {

    const usuario =
        usuarioInput.value
            .trim()
            .toLowerCase();

    const senha =
        senhaInput.value;

    if (!usuario || !senha) {

        erroLogin.textContent =
            "Digite usuário e senha.";

        return;
    }

    const encontrado =
        usuarios.find(u =>
            u.usuario === usuario &&
            u.senha === senha
        );

    if (!encontrado) {

        erroLogin.textContent =
            "Usuário ou senha inválidos.";

        senhaInput.select();

        return;
    }

    erroLogin.textContent = "";

    localStorage.setItem(
        CONFIG.chaveUsuario,
        JSON.stringify(encontrado)
    );

    carregarSistema();

    mostrarToast(
        `Bem-vindo, ${encontrado.usuario}!`
    );
}


function carregarSistema() {

    let salvo = null;

    try {

        salvo =
            JSON.parse(
                localStorage.getItem(
                    CONFIG.chaveUsuario
                )
            );

    } catch {

        salvo = null;
    }

    if (!salvo) {

        if (loginTela) {
            loginTela.style.display = "";
        }

        if (sistema) {
            sistema.style.display = "none";
        }

        if (painelAdmin) {
            painelAdmin.style.display = "none";
        }

        return;
    }

    if (loginTela) {
        loginTela.style.display = "none";
    }

    if (sistema) {
        sistema.style.display = "block";
    }

    if (painelAdmin) {
        painelAdmin.style.display = "none";
    }

    if (usuarioLogado) {

        usuarioLogado.innerHTML =
            `👤 ${escaparHTML(salvo.usuario)} ` +
            `<span>(${escaparHTML(salvo.tipo)})</span>`;
    }

    if (btnAdmin) {

        btnAdmin.style.display =
            salvo.tipo === "admin"
                ? "inline-block"
                : "none";
    }

    renderizarHistorico();

    criarBotaoTema();
}


function sair() {

    localStorage.removeItem(
        CONFIG.chaveUsuario
    );

    location.reload();
}


/* =========================================================
   EVENTOS LOGIN
   ========================================================= */

if (btnLogin) {

    btnLogin.addEventListener(
        "click",
        entrar
    );
}


if (senhaInput) {

    senhaInput.addEventListener(
        "keydown",
        evento => {

            if (evento.key === "Enter") {
                entrar();
            }

        }
    );
}


if (usuarioInput) {

    usuarioInput.addEventListener(
        "keydown",
        evento => {

            if (evento.key === "Enter") {
                senhaInput.focus();
            }

        }
    );
}


if (btnSair) {

    btnSair.addEventListener(
        "click",
        sair
    );
}


/* =========================================================
   CARREGAR CLIENTES
   ========================================================= */

async function carregarClientes() {

    try {

        const resposta =
            await fetch(
                `${CONFIG.arquivoClientes}?v=${Date.now()}`,
                {
                    cache: "no-store"
                }
            );

        if (!resposta.ok) {
            throw new Error(
                "Não foi possível carregar clientes.json."
            );
        }

        const dados =
            await resposta.json();

        if (!Array.isArray(dados)) {
            throw new Error(
                "clientes.json não possui um formato válido."
            );
        }

        clientes = dados;

        atualizarDashboard();

    } catch (erro) {

        console.warn(
            "clientes.json:",
            erro.message
        );

        clientes = [];

        if (resultado) {

            resultado.innerHTML = `
                <div class="nao-encontrado">
                    <div class="icone">📡</div>
                    <h2>Base de clientes indisponível</h2>
                    <p>
                        O arquivo clientes.json ainda não foi
                        carregado ou não está disponível.
                    </p>
                </div>
            `;
        }
    }
}


/* =========================================================
   STATUS
   ========================================================= */

function obterStatus(status) {

    const numero = Number(status);

    if (numero === 3) {

        return {
            texto: "🟢 Bom",
            classe: "status-bom"
        };

    }

    if (numero === 2) {

        return {
            texto: "🟡 Médio",
            classe: "status-medio"
        };

    }

    return {
        texto: "🔴 Ruim",
        classe: "status-ruim"
    };
}


/* =========================================================
   ALERTA DE SINAL
   ========================================================= */

function gerarAlertaSinal(sinal) {

    const valor =
        numeroSinal(sinal);

    if (Number.isNaN(valor)) {
        return "";
    }

    if (valor <= -81) {

        return `
            <div class="alerta-critico">
                ⚠️ Sinal crítico:
                <strong>${escaparHTML(sinal)} dBm</strong>
                <small>Verificar sinal</small>
            </div>
        `;
    }

    if (valor <= -70) {

        return `
            <div
                class="alerta-critico"
                style="
                    background:rgba(202,138,4,.10);
                    color:#ca8a04;
                    border-color:rgba(202,138,4,.25);
                "
            >
                ⚠️ Atenção:
                <strong>${escaparHTML(sinal)} dBm</strong>
                <small>Sinal fora do ideal</small>
            </div>
        `;
    }

    return "";
}


/* =========================================================
   PESQUISA
   ========================================================= */

function pesquisarCliente() {

    const texto =
        pesquisa.value
            .toLowerCase()
            .trim();

    if (!texto) {

        resultado.innerHTML = "";

        return;
    }

    const cliente =
        clientes.find(c => {

            const ppoe =
                String(c.ppoe || "")
                    .toLowerCase();

            const ip =
                String(c.ip || "")
                    .toLowerCase();

            const painel =
                String(c.painel || "")
                    .toLowerCase();

            const ssid =
                String(c.ssid || "")
                    .toLowerCase();

            return (
                ppoe.includes(texto) ||
                ip.includes(texto) ||
                painel.includes(texto) ||
                ssid.includes(texto)
            );
        });


    if (!cliente) {

        resultado.innerHTML = `
            <div class="nao-encontrado">
                <div class="icone">🔍</div>

                <h2>Cliente não encontrado</h2>

                <p>
                    Nenhum cliente corresponde à pesquisa.
                </p>

                <div class="dica">
                    Tente pesquisar pelo
                    <strong>PPOE</strong>,
                    <strong>IP</strong>,
                    <strong>painel</strong>
                    ou <strong>SSID</strong>.
                </div>
            </div>
        `;

        return;
    }

    renderizarCliente(cliente);
}


function renderizarCliente(cliente) {

    const status =
        obterStatus(cliente.status);

    const ip =
        formatarIP(cliente.ip);

    const ipPainel =
        formatarIP(cliente.ip_painel);

    const ppoe =
        String(cliente.ppoe || "");

    const ssid =
        String(cliente.ssid || "");

    const painel =
        String(cliente.painel || "");

    const sinal =
        String(cliente.sinal || "");

    const alerta =
        gerarAlertaSinal(sinal);


    resultado.innerHTML = `

        <div class="cliente-card">

            <div class="cliente-card-topo">

                <div>
                    <div class="cliente-label">
                        CLIENTE ENCONTRADO
                    </div>

                    <h2>
                        ${escaparHTML(ppoe || "Sem PPOE")}
                    </h2>
                </div>

                <div class="${status.classe}">
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
                        ${escaparHTML(ppoe || "Não informado")}
                    </div>

                </div>


                <div class="campo">

                    <div class="titulo">
                        Painel
                    </div>

                    <div class="valor">
                        ${escaparHTML(painel || "Não informado")}
                    </div>

                </div>


                <div class="campo">

                    <div class="titulo">
                        IP
                    </div>

                    <div class="valor">
                        ${escaparHTML(ip || "Não informado")}
                    </div>

                </div>


                <div class="campo">

                    <div class="titulo">
                        IP do Painel
                    </div>

                    <div class="valor">
                        ${escaparHTML(
                            ipPainel || "Não informado"
                        )}
                    </div>

                </div>


                <div class="campo">

                    <div class="titulo">
                        SSID
                    </div>

                    <div class="valor">
                        ${escaparHTML(
                            ssid || "Não informado"
                        )}
                    </div>

                </div>


                <div class="campo">

                    <div class="titulo">
                        Sinal
                    </div>

                    <div class="valor">
                        ${escaparHTML(
                            sinal || "Não informado"
                        )}
                    </div>

                </div>

            </div>


            <div class="botoes-copiar">

                <button
                    type="button"
                    onclick="copiarEsalvar(
                        '${escaparAtributo(ip)}',
                        '${escaparAtributo(ppoe)}'
                    )"
                >
                    📋 Copiar IP
                </button>


                <button
                    type="button"
                    onclick="copiarEsalvar(
                        '${escaparAtributo(ipPainel)}',
                        '${escaparAtributo(ppoe)}'
                    )"
                >
                    📋 IP Painel
                </button>


                <button
                    type="button"
                    onclick="copiarEsalvar(
                        '${escaparAtributo(ppoe)}',
                        '${escaparAtributo(ppoe)}'
                    )"
                >
                    📋 Copiar PPOE
                </button>


                <button
                    type="button"
                    onclick="copiarEsalvar(
                        '${escaparAtributo(ssid)}',
                        '${escaparAtributo(ppoe)}'
                    )"
                >
                    📋 Copiar SSID
                </button>

            </div>

        </div>
    `;
}


/* =========================================================
   SEGURANÇA PARA ONCLICK
   ========================================================= */

function escaparAtributo(valor) {

    return String(valor || "")
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'")
        .replace(/\n/g, "\\n")
        .replace(/\r/g, "\\r");
}


/* =========================================================
   PESQUISA COM DEBOUNCE
   ========================================================= */

if (pesquisa) {

    pesquisa.addEventListener(
        "input",
        () => {

            clearTimeout(
                buscaTimeout
            );

            buscaTimeout =
                setTimeout(
                    pesquisarCliente,
                    80
                );
        }
    );
}


/* =========================================================
   HISTÓRICO
   ========================================================= */

function obterHistorico() {

    try {

        const historico =
            JSON.parse(
                localStorage.getItem(
                    CONFIG.chaveHistorico
                ) || "[]"
            );

        return Array.isArray(historico)
            ? historico
            : [];

    } catch {

        return [];
    }
}


function salvarHistorico(termo) {

    if (!termo) {
        return;
    }

    let historico =
        obterHistorico();

    historico =
        historico.filter(
            item => item !== termo
        );

    historico.unshift(termo);

    historico =
        historico.slice(
            0,
            CONFIG.historicoMaximo
        );

    localStorage.setItem(
        CONFIG.chaveHistorico,
        JSON.stringify(historico)
    );

    renderizarHistorico();
}


function renderizarHistorico() {

    if (!divHistorico) {
        return;
    }

    const historico =
        obterHistorico();

    if (historico.length === 0) {

        divHistorico.innerHTML = "";

        return;
    }

    divHistorico.innerHTML = `
        <div class="historico-cabecalho">
            <span>Pesquisas recentes</span>

            <button
                class="limpar-historico"
                type="button"
                onclick="limparHistorico()"
            >
                Limpar
            </button>
        </div>

        <div class="historico-lista">

            ${historico.map(
                termo => `
                    <button
                        class="btn-historico"
                        type="button"
                        onclick="usarHistorico(
                            '${escaparAtributo(termo)}'
                        )"
                    >
                        🕒 ${escaparHTML(termo)}
                    </button>
                `
            ).join("")}

        </div>
    `;
}


window.usarHistorico =
    function(termo) {

        pesquisa.value = termo;

        pesquisarCliente();

    };


window.limparHistorico =
    function() {

        localStorage.removeItem(
            CONFIG.chaveHistorico
        );

        renderizarHistorico();

        mostrarToast(
            "Histórico limpo."
        );
    };


window.copiarEsalvar =
    async function(texto, ppoe) {

        try {

            await copiarTexto(texto);

            salvarHistorico(ppoe);

            mostrarToast(
                "Copiado para a área de transferência!"
            );

        } catch {

            mostrarToast(
                "Não foi possível copiar.",
                "error"
            );
        }
    };


/* =========================================================
   ADMIN
   ========================================================= */

if (btnAdmin) {

    btnAdmin.addEventListener(
        "click",
        () => {

            sistema.style.display = "none";

            painelAdmin.style.display = "block";

            atualizarDashboard();

        }
    );
}


if (fecharAdmin) {

    fecharAdmin.addEventListener(
        "click",
        () => {

            painelAdmin.style.display = "none";

            sistema.style.display = "block";

        }
    );
}


/* =========================================================
   DASHBOARD
   ========================================================= */

function atualizarDashboard() {

    if (!clientes.length) {
        return;
    }

    const total =
        clientes.length;

    const paineis =
        [
            ...new Set(
                clientes
                    .map(c => c.painel)
                    .filter(Boolean)
            )
        ];

    const bom =
        clientes.filter(
            c => Number(c.status) === 3
        ).length;

    const medio =
        clientes.filter(
            c => Number(c.status) === 2
        ).length;

    const ruim =
        clientes.filter(
            c => Number(c.status) !== 3 &&
                 Number(c.status) !== 2
        ).length;


    atualizarElemento(
        "totalClientes",
        total
    );

    atualizarElemento(
        "totalPaineis",
        paineis.length
    );

    atualizarElemento(
        "totalBom",
        bom
    );

    atualizarElemento(
        "totalMedio",
        medio
    );

    atualizarElemento(
        "totalRuim",
        ruim
    );


    renderizarRanking();

    renderizarSaude(
        total,
        bom
    );
}


function atualizarElemento(id, valor) {

    const elemento =
        $(id);

    if (elemento) {
        elemento.textContent = valor;
    }
}


/* =========================================================
   SAÚDE DA REDE
   ========================================================= */

function renderizarSaude(total, bom) {

    const percentual =
        total > 0
            ? Math.round(
                (bom / total) * 100
            )
            : 0;

    let barra =
        $("barraSaude");

    let texto =
        $("textoSaude");

    /*
       Caso esses elementos ainda não estejam
       no HTML antigo, criamos automaticamente.
    */

    if (!barra || !texto) {

        const dashboard =
            painelAdmin;

        if (!dashboard) {
            return;
        }

        let bloco =
            document.getElementById(
                "saudeRede"
            );

        if (!bloco) {

            bloco =
                document.createElement("div");

            bloco.id =
                "saudeRede";

            bloco.innerHTML = `
                <h2>❤️ Saúde da Rede</h2>

                <div class="barra-saude">
                    <div id="barraSaude"></div>
                </div>

                <div id="textoSaude"></div>
            `;

            const ranking =
                $("rankingPaineis");

            if (ranking) {
                ranking.parentNode.insertBefore(
                    bloco,
                    ranking
                );
            } else {
                dashboard.appendChild(
                    bloco
                );
            }
        }

        barra =
            $("barraSaude");

        texto =
            $("textoSaude");
    }

    barra.style.width =
        `${percentual}%`;

    texto.textContent =
        `${percentual}% dos clientes com sinal bom`;
}


/* =========================================================
   RANKING DE PAINÉIS
   ========================================================= */

function renderizarRanking() {

    const divRanking =
        $("rankingPaineis");

    if (!divRanking) {
        return;
    }

    const ranking = {};

    clientes.forEach(cliente => {

        const painel =
            cliente.painel ||
            "Painel não informado";

        ranking[painel] =
            (ranking[painel] || 0) + 1;
    });


    const top10 =
        Object.entries(ranking)
            .sort(
                (a, b) => b[1] - a[1]
            )
            .slice(0, 10);


    const maior =
        top10.length
            ? top10[0][1]
            : 1;


    divRanking.innerHTML =
        top10.map(
            ([painel, quantidade], index) => {

                const largura =
                    Math.round(
                        (quantidade / maior) * 100
                    );

                return `
                    <div class="itemPainel">

                        <span>
                            <strong>
                                ${index + 1}º
                                ${escaparHTML(painel)}
                            </strong>

                            <strong>
                                ${quantidade}
                            </strong>
                        </span>

                        <div class="barraPainel">

                            <div
                                class="preenchimento"
                                style="
                                    width:${largura}%;
                                "
                            ></div>

                        </div>

                    </div>
                `;
            }
        ).join("");
}


/* =========================================================
   COPIAR ESTATÍSTICAS
   ========================================================= */

if (btnCopiarEstatisticas) {

    btnCopiarEstatisticas.addEventListener(
        "click",
        async () => {

            const total =
                clientes.length;

            const bom =
                clientes.filter(
                    c => Number(c.status) === 3
                ).length;

            const medio =
                clientes.filter(
                    c => Number(c.status) === 2
                ).length;

            const ruim =
                total - bom - medio;

            const paineis =
                new Set(
                    clientes.map(
                        c => c.painel
                    )
                ).size;


            const saude =
                total
                    ? Math.round(
                        (bom / total) * 100
                    )
                    : 0;


            const texto = `
📊 ATUALIZE TELECOM

👥 Clientes: ${total}
📡 Painéis: ${paineis}

🟢 Bom: ${bom}
🟡 Médio: ${medio}
🔴 Ruim: ${ruim}

❤️ Saúde da rede: ${saude}%
            `.trim();


            try {

                await copiarTexto(
                    texto
                );

                mostrarToast(
                    "Estatísticas copiadas!"
                );

            } catch {

                mostrarToast(
                    "Erro ao copiar estatísticas.",
                    "error"
                );
            }
        }
    );
}


/* =========================================================
   BAIXAR JSON
   ========================================================= */

if (btnBaixarJson) {

    btnBaixarJson.addEventListener(
        "click",
        () => {

            if (!clientes.length) {

                mostrarToast(
                    "Não há clientes para exportar.",
                    "error"
                );

                return;
            }


            const json =
                JSON.stringify(
                    clientes,
                    null,
                    2
                );


            const blob =
                new Blob(
                    [json],
                    {
                        type:
                            "application/json"
                    }
                );


            const url =
                URL.createObjectURL(
                    blob
                );


            const a =
                document.createElement("a");

            a.href = url;

            a.download =
                "clientes.json";

            document.body.appendChild(a);

            a.click();

            a.remove();

            URL.revokeObjectURL(url);


            mostrarToast(
                `${clientes.length} clientes exportados!`
            );
        }
    );
}


/* =========================================================
   IMPORTAÇÃO EXCEL
   ========================================================= */

if (inputExcel) {

    inputExcel.addEventListener(
        "change",
        () => {

            const arquivo =
                inputExcel.files[0];

            if (!arquivo) {
                return;
            }

            atualizarNomeArquivo(
                arquivo.name
            );
        }
    );
}


function atualizarNomeArquivo(nome) {

    let elemento =
        document.getElementById(
            "nomeArquivoSelecionado"
        );

    if (!elemento) {

        elemento =
            document.createElement("div");

        elemento.id =
            "nomeArquivoSelecionado";

        elemento.style.marginTop =
            "10px";

        elemento.style.fontSize =
            "12px";

        elemento.style.color =
            "var(--texto-secundario)";

        inputExcel.parentNode.appendChild(
            elemento
        );
    }

    elemento.textContent =
        `📄 ${nome}`;
}


if (btnImportarExcel) {

    btnImportarExcel.addEventListener(
        "click",
        importarExcel
    );
}


function importarExcel() {

    const arquivo =
        inputExcel.files[0];


    if (!arquivo) {

        mostrarToast(
            "Selecione uma planilha Excel primeiro.",
            "error"
        );

        return;
    }


    if (
        typeof XLSX === "undefined"
    ) {

        mostrarToast(
            "Biblioteca Excel não carregada.",
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


                workbook.SheetNames
                    .forEach(
                        nomeAba => {

                            const worksheet =
                                workbook.Sheets[
                                    nomeAba
                                ];

                            if (!worksheet) {
                                return;
                            }


                            /*
                               A4 = nome do painel
                            */

                            const valorA4 =
                                String(
                                    worksheet["A4"]?.v || ""
                                ).trim();


                            if (!valorA4) {
                                return;
                            }


                            const nomePainel =
                                valorA4
                                    .startsWith("P ")
                                    ? valorA4
                                    : `P ${valorA4}`;


                            /*
                               D4 = IP do painel
                            */

                            const ipPainel =
                                formatarIP(
                                    worksheet["D4"]?.v || ""
                                );


                            /*
                               J4 = SSID
                            */

                            const ssid =
                                String(
                                    worksheet["J4"]?.v || ""
                                ).trim();


                            /*
                               Converte planilha
                               inteira em matriz.
                            */

                            const rows =
                                XLSX.utils
                                    .sheet_to_json(
                                        worksheet,
                                        {
                                            header: 1,
                                            defval: ""
                                        }
                                    );


                            /*
                               Clientes começam
                               na linha 8.
                            */

                            for (
                                let i = 7;
                                i < rows.length;
                                i++
                            ) {

                                const row =
                                    rows[i];


                                if (
                                    !row ||
                                    !row.length
                                ) {
                                    continue;
                                }


                                /*
                                   A = PPOE
                                   D = IP
                                   G = Sinal
                                */

                                const ppoe =
                                    String(
                                        row[0] || ""
                                    ).trim();


                                const ip =
                                    String(
                                        row[3] || ""
                                    ).trim();


                                const sinal =
                                    String(
                                        row[6] || ""
                                    ).trim();


                                /*
                                   Ignora linha vazia.
                                */

                                if (
                                    !ppoe &&
                                    !ip &&
                                    !sinal
                                ) {
                                    continue;
                                }


                                /*
                                   Classificação:

                                   >= -65 = BOM
                                   >= -75 = MÉDIO
                                   <  -75 = RUIM
                                */

                                const sinalNum =
                                    numeroSinal(
                                        sinal
                                    );


                                let status = 1;


                                if (
                                    !Number.isNaN(
                                        sinalNum
                                    )
                                ) {

                                    if (
                                        sinalNum >= -65
                                    ) {

                                        status = 3;

                                    } else if (
                                        sinalNum >= -75
                                    ) {

                                        status = 2;

                                    } else {

                                        status = 1;
                                    }
                                }


                                novosClientes.push({

                                    ppoe,

                                    painel:
                                        nomePainel,

                                    ip,

                                    ip_painel:
                                        ipPainel,

                                    ssid,

                                    sinal,

                                    status

                                });
                            }
                        }
                    );


                if (!novosClientes.length) {

                    throw new Error(
                        "Nenhum cliente válido foi encontrado na planilha."
                    );
                }


                clientes =
                    novosClientes;


                /*
                   Salva uma cópia local.
                   Assim o sistema consegue
                   continuar usando os dados
                   mesmo após a importação.
                */

                try {

                    localStorage.setItem(
                        "clientes_cache",
                        JSON.stringify(
                            clientes
                        )
                    );

                } catch (erro) {

                    console.warn(
                        "Não foi possível salvar cache.",
                        erro
                    );
                }


                atualizarDashboard();


                inputExcel.value = "";


                const arquivoSelecionado =
                    document.getElementById(
                        "nomeArquivoSelecionado"
                    );

                if (arquivoSelecionado) {
                    arquivoSelecionado.textContent =
                        "";
                }


                mostrarToast(
                    `✅ ${clientes.length} clientes carregados!`
                );

            } catch (erro) {

                console.error(
                    "Erro na importação:",
                    erro
                );

                mostrarToast(
                    `Erro: ${erro.message}`,
                    "error"
                );
            }
        };


    reader.onerror =
        () => {

            mostrarToast(
                "Erro ao ler a planilha.",
                "error"
            );
        };


    reader.readAsArrayBuffer(
        arquivo
    );
}


/* =========================================================
   CACHE LOCAL
   ========================================================= */

function carregarCacheLocal() {

    try {

        const cache =
            localStorage.getItem(
                "clientes_cache"
            );

        if (!cache) {
            return;
        }

        const dados =
            JSON.parse(cache);

        if (
            Array.isArray(dados) &&
            dados.length
        ) {

            clientes = dados;

            atualizarDashboard();
        }

    } catch (erro) {

        console.warn(
            "Cache inválido:",
            erro
        );
    }
}


/* =========================================================
   ATUALIZAÇÃO DO APLICATIVO
   ========================================================= */

async function verificarNovaVersao() {

    try {

        const resposta =
            await fetch(
                `version.json?v=${Date.now()}`,
                {
                    cache: "no-store"
                }
            );


        if (!resposta.ok) {
            return;
        }


        const dados =
            await resposta.json();


        if (!dados.version) {
            return;
        }


        if (versaoAtual === null) {

            versaoAtual =
                dados.version;


            if (versaoTexto) {

                versaoTexto.textContent =
                    `Versão ${dados.version}`;
            }


            return;
        }


        if (
            dados.version !== versaoAtual
        ) {

            if (banner) {
                banner.style.display =
                    "flex";
            }
        }

    } catch (erro) {

        console.log(
            "Versão:",
            erro.message
        );
    }
}


/* =========================================================
   BOTÃO ATUALIZAR
   ========================================================= */

if (btnAtualizar) {

    btnAtualizar.addEventListener(
        "click",
        async () => {

            btnAtualizar.disabled =
                true;

            btnAtualizar.textContent =
                "Atualizando...";


            try {

                if (
                    "serviceWorker" in navigator
                ) {

                    const registro =
                        await navigator
                            .serviceWorker
                            .getRegistration();


                    if (registro) {

                        await registro.update();


                        if (
                            registro.waiting
                        ) {

                            registro.waiting.postMessage(
                                {
                                    type:
                                        "SKIP_WAITING"
                                }
                            );

                        }

                    }

                }


                setTimeout(
                    () => {

                        location.reload(
                            true
                        );

                    },
                    500
                );

            } catch (erro) {

                console.error(
                    erro
                );

                location.reload(
                    true
                );
            }
        }
    );
}


/* =========================================================
   SERVICE WORKER
   ========================================================= */

if (
    "serviceWorker" in navigator
) {

    window.addEventListener(
        "load",
        () => {

            navigator.serviceWorker
                .register(
                    "service-worker.js"
                )
                .then(
                    registro => {

                        console.log(
                            "Service Worker ativo:",
                            registro.scope
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


    navigator.serviceWorker
        .addEventListener(
            "controllerchange",
            () => {

                if (
                    !window._recarregandoSW
                ) {

                    window._recarregandoSW =
                        true;

                    location.reload();
                }
            }
        );
}


/* =========================================================
   ATALHOS
   ========================================================= */

document.addEventListener(
    "keydown",
    evento => {

        /*
           Ctrl + K
           Foca pesquisa
        */

        if (
            (evento.ctrlKey ||
             evento.metaKey) &&
            evento.key.toLowerCase() === "k"
        ) {

            evento.preventDefault();

            if (
                sistema.style.display !== "none"
            ) {

                pesquisa.focus();

                pesquisa.select();
            }
        }


        /*
           ESC
           Limpa pesquisa
        */

        if (
            evento.key === "Escape"
        ) {

            if (
                document.activeElement === pesquisa
            ) {

                pesquisa.value = "";

                resultado.innerHTML = "";

                pesquisa.blur();
            }
        }


        /*
           Ctrl + Shift + L
           Alterna tema
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


/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        iniciarTema();

        carregarSistema();

        carregarCacheLocal();

        carregarClientes();

        verificarNovaVersao();

        setInterval(
            verificarNovaVersao,
            CONFIG.intervaloVersao
        );

    }
);


/* =========================================================
   FALLBACK CASO DOM JÁ TENHA CARREGADO
   ========================================================= */

if (
    document.readyState !== "loading"
) {

    iniciarTema();

    carregarSistema();

    carregarCacheLocal();

    carregarClientes();

    verificarNovaVersao();

    setInterval(
        verificarNovaVersao,
        CONFIG.intervaloVersao
    );
}
