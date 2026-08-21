/* =========================================================
   ATUALIZE TELECOM
   SCRIPT PRINCIPAL
   ========================================================= */


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
   ELEMENTOS
   ========================================================= */

const loginTela = document.getElementById("loginTela");
const sistema = document.getElementById("sistema");
const painelAdmin = document.getElementById("painelAdmin");

const usuarioInput = document.getElementById("usuario");
const senhaInput = document.getElementById("senha");
const erroLogin = document.getElementById("erroLogin");

const btnLogin = document.getElementById("btnLogin");
const btnSair = document.getElementById("btnSair");
const btnAdmin = document.getElementById("btnAdmin");
const fecharAdmin = document.getElementById("fecharAdmin");
const usuarioLogado = document.getElementById("usuarioLogado");

const pesquisa = document.getElementById("pesquisa");
const resultado = document.getElementById("resultado");
const divHistorico = document.getElementById("historicoPesquisas");

const inputExcel = document.getElementById("inputExcel");
const btnImportarExcel = document.getElementById("btnImportarExcel");

const banner = document.getElementById("updateBanner");
const btnAtualizar = document.getElementById("btnAtualizarApp");
const versaoTexto = document.getElementById("versaoApp");


/* =========================================================
   DADOS
   ========================================================= */

let clientes = [];
let versaoAtual = null;


/* =========================================================
   LOGIN
   ========================================================= */

function entrar() {

    const usuario = usuarioInput.value.trim().toLowerCase();
    const senha = senhaInput.value;

    const encontrado = usuarios.find(
        u =>
            u.usuario === usuario &&
            u.senha === senha
    );

    if (!encontrado) {

        erroLogin.textContent =
            "Usuário ou senha inválidos.";

        return;
    }

    erroLogin.textContent = "";

    localStorage.setItem(
        "usuarioAtual",
        JSON.stringify(encontrado)
    );

    carregarSistema();
}


btnLogin.addEventListener("click", entrar);


senhaInput.addEventListener("keypress", event => {

    if (event.key === "Enter") {
        entrar();
    }

});


function carregarSistema() {

    let salvo = null;

    try {

        salvo = JSON.parse(
            localStorage.getItem("usuarioAtual")
        );

    } catch {

        salvo = null;

    }


    if (!salvo) {

        loginTela.style.display = "block";
        sistema.style.display = "none";
        painelAdmin.style.display = "none";

        return;
    }


    loginTela.style.display = "none";
    sistema.style.display = "block";
    painelAdmin.style.display = "none";


    usuarioLogado.textContent =
        `👤 ${salvo.usuario} (${salvo.tipo})`;


    btnAdmin.style.display =
        salvo.tipo === "admin"
            ? "inline-block"
            : "none";


    renderizarHistorico();

}


btnSair.addEventListener("click", () => {

    localStorage.removeItem("usuarioAtual");

    location.reload();

});


/* =========================================================
   TEMA CLARO / ESCURO
   ========================================================= */

function aplicarTema(tema) {

    if (tema === "dark") {

        document.body.classList.add(
            "dark-theme"
        );

    } else {

        document.body.classList.remove(
            "dark-theme"
        );

    }

    localStorage.setItem(
        "temaAtual",
        tema
    );

    atualizarBotaoTema();

}


function atualizarBotaoTema() {

    const botao =
        document.getElementById("btnTema");

    if (!botao) return;


    const escuro =
        document.body.classList.contains(
            "dark-theme"
        );


    botao.innerHTML =
        escuro
            ? "☀️ Dia"
            : "🌙 Noite";

    botao.title =
        escuro
            ? "Mudar para modo claro"
            : "Mudar para modo escuro";

}


function criarBotaoTema() {

    if (document.getElementById("btnTema")) {
        return;
    }


    const botao =
        document.createElement("button");

    botao.id = "btnTema";
    botao.type = "button";


    botao.style.width = "auto";
    botao.style.marginTop = "0";
    botao.style.padding = "10px 16px";
    botao.style.fontSize = "14px";


    botao.addEventListener("click", () => {

        const escuro =
            document.body.classList.contains(
                "dark-theme"
            );

        aplicarTema(
            escuro ? "light" : "dark"
        );

    });


    const topo =
        document.querySelector(
            "#sistema .topo"
        );


    if (topo) {

        const areaBotoes =
            topo.querySelector("div");


        if (areaBotoes) {

            areaBotoes.insertBefore(
                botao,
                areaBotoes.firstChild
            );

        } else {

            topo.appendChild(botao);

        }

    }


    atualizarBotaoTema();

}


function carregarTema() {

    const tema =
        localStorage.getItem("temaAtual")
        || "light";

    aplicarTema(tema);

}


/* =========================================================
   FORMATAÇÃO DE IP
   ========================================================= */

function formatarIP(ip) {

    if (
        ip === null ||
        ip === undefined ||
        ip === ""
    ) {
        return "";
    }


    let valor =
        String(ip).trim();


    if (valor.includes(".")) {
        return valor;
    }


    valor =
        valor.replace(/\D/g, "");


    if (valor.length === 12) {

        return valor.replace(
            /(\d{3})(\d{3})(\d{3})(\d{3})/,
            "$1.$2.$3.$4"
        );

    }


    return String(ip);

}


/* =========================================================
   CARREGAR CLIENTES
   ========================================================= */

async function carregarClientes() {

    try {

        const resposta =
            await fetch(
                "clientes.json?v=" +
                Date.now(),
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


        /*
         Aceita tanto:

         [
             {...},
             {...}
         ]

         quanto:

         {
             clientes: [...]
         }
        */

        if (Array.isArray(dados)) {

            clientes = dados;

        } else if (
            dados &&
            Array.isArray(dados.clientes)
        ) {

            clientes = dados.clientes;

        } else {

            throw new Error(
                "Formato do clientes.json inválido."
            );

        }


        console.log(
            `✅ ${clientes.length} clientes carregados.`
        );


        atualizarDashboard();


    } catch (erro) {

        console.error(
            "Erro carregando clientes:",
            erro
        );


        clientes = [];


        resultado.innerHTML = `
            <div class="nao-encontrado">
                <div class="icone">⚠️</div>
                <h2>Não foi possível carregar os clientes</h2>
                <p>
                    Verifique se o arquivo
                    <strong>clientes.json</strong>
                    está disponível.
                </p>
            </div>
        `;

    }

}


/* =========================================================
   PESQUISA
   ========================================================= */

pesquisa.addEventListener(
    "input",
    pesquisarCliente
);


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
                String(
                    c.ppoe ?? ""
                ).toLowerCase();


            const ip =
                String(
                    c.ip ?? ""
                ).toLowerCase();


            return (
                ppoe.includes(texto) ||
                ip.includes(texto)
            );

        });


    if (!cliente) {

        resultado.innerHTML = `
            <div class="nao-encontrado">

                <div class="icone">🔍</div>

                <h2>Cliente não encontrado</h2>

                <p>
                    Verifique o PPOE ou IP informado.
                </p>

                <div class="dica">
                    💡 Você pode pesquisar
                    pelo PPOE ou pelo endereço IP.
                </div>

            </div>
        `;

        return;
    }


    mostrarCliente(cliente);

}


/* =========================================================
   EXIBIR CLIENTE
   ========================================================= */

function mostrarCliente(cliente) {

    let statusTexto = "🔴 Ruim";
    let classeStatus = "status-ruim";


    if (Number(cliente.status) === 3) {

        statusTexto = "🟢 Bom";
        classeStatus = "status-bom";

    } else if (Number(cliente.status) === 2) {

        statusTexto = "🟡 Médio";
        classeStatus = "status-medio";

    }


    const sinalValor =
        parseFloat(
            String(cliente.sinal)
                .replace(",", ".")
        );


    let alertaHtml = "";


    if (!isNaN(sinalValor)) {

        if (sinalValor <= -81) {

            alertaHtml = `
                <div class="alerta-critico">
                    ⚠️ Sinal crítico
                    (${cliente.sinal} dBm)
                    <br>
                    Verificar o sinal.
                </div>
            `;

        } else if (sinalValor <= -70) {

            alertaHtml = `
                <div
                    class="alerta-critico"
                    style="
                        background:#fff3cd;
                        color:#856404;
                        border-color:#ffeeba;
                    "
                >
                    ⚠️ Atenção
                    (${cliente.sinal} dBm)
                    <br>
                    Sinal fora do ideal.
                </div>
            `;

        }

    }


    const ip =
        formatarIP(cliente.ip);


    const ipPainel =
        formatarIP(cliente.ip_painel);


    resultado.innerHTML = `

        <div class="campo">
            <div class="titulo">PPOE</div>
            <div class="valor">
                ${escaparHTML(cliente.ppoe)}
            </div>
        </div>


        <div class="campo">
            <div class="titulo">Painel</div>
            <div class="valor">
                ${escaparHTML(cliente.painel)}
            </div>
        </div>


        <div class="campo">
            <div class="titulo">IP</div>
            <div class="valor">
                ${escaparHTML(ip)}
            </div>
        </div>


        <div class="campo">
            <div class="titulo">IP do Painel</div>
            <div class="valor">
                ${escaparHTML(
                    ipPainel || "Não informado"
                )}
            </div>
        </div>


        <div class="campo">
            <div class="titulo">SSID</div>
            <div class="valor">
                ${escaparHTML(
                    cliente.ssid ||
                    "Não informado"
                )}
            </div>
        </div>


        <div class="campo">
            <div class="titulo">Última Medição</div>
            <div class="valor">
                ${escaparHTML(
                    cliente.sinal ??
                    "Não informado"
                )}
            </div>
        </div>


        ${alertaHtml}


        <div class="campo">

            <div class="titulo">Status</div>

            <div class="${classeStatus}">
                ${statusTexto}
            </div>

        </div>


        <div class="botoes-copiar">

            <button
                onclick="copiarEsalvar(
                    '${escaparAtributo(ip)}',
                    '${escaparAtributo(cliente.ppoe)}'
                )"
            >
                📋 Copiar IP
            </button>


            <button
                onclick="copiarEsalvar(
                    '${escaparAtributo(ipPainel)}',
                    '${escaparAtributo(cliente.ppoe)}'
                )"
            >
                📋 Copiar IP Painel
            </button>


            <button
                onclick="copiarEsalvar(
                    '${escaparAtributo(cliente.ppoe)}',
                    '${escaparAtributo(cliente.ppoe)}'
                )"
            >
                📋 Copiar PPOE
            </button>


            <button
                onclick="copiarEsalvar(
                    '${escaparAtributo(cliente.ssid || "")}',
                    '${escaparAtributo(cliente.ppoe)}'
                )"
            >
                📋 Copiar SSID
            </button>

        </div>
    `;


    salvarHistorico(cliente.ppoe);

}


/* =========================================================
   SEGURANÇA HTML
   ========================================================= */

function escaparHTML(valor) {

    return String(
        valor ?? ""
    )
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


function escaparAtributo(valor) {

    return String(
        valor ?? ""
    )
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'")
        .replace(/"/g, "&quot;");

}


/* =========================================================
   COPIAR
   ========================================================= */

window.copiarEsalvar =
async function(
    textoParaCopiar,
    ppoeParaHistorico
) {

    try {

        await navigator.clipboard.writeText(
            textoParaCopiar
        );

        mostrarAviso(
            "📋 Copiado com sucesso!"
        );


        salvarHistorico(
            ppoeParaHistorico
        );


    } catch (erro) {

        console.error(erro);

        alert(
            "Não foi possível copiar."
        );

    }

};


/* =========================================================
   HISTÓRICO
   ========================================================= */

function salvarHistorico(ppoe) {

    if (!ppoe) return;


    let historico = [];


    try {

        historico =
            JSON.parse(
                localStorage.getItem(
                    "historico_pesquisas"
                ) || "[]"
            );

    } catch {

        historico = [];

    }


    historico =
        historico.filter(
            item => item !== ppoe
        );


    historico.unshift(ppoe);


    if (historico.length > 5) {
        historico = historico.slice(0, 5);
    }


    localStorage.setItem(
        "historico_pesquisas",
        JSON.stringify(historico)
    );


    renderizarHistorico();

}


function renderizarHistorico() {

    if (!divHistorico) return;


    let historico = [];


    try {

        historico =
            JSON.parse(
                localStorage.getItem(
                    "historico_pesquisas"
                ) || "[]"
            );

    } catch {

        historico = [];

    }


    if (!historico.length) {

        divHistorico.innerHTML = "";

        return;
    }


    divHistorico.innerHTML =
        historico.map(
            h => `
                <button
                    class="btn-historico"
                    onclick="usarHistorico(
                        '${escaparAtributo(h)}'
                    )"
                >
                    🕒 ${escaparHTML(h)}
                </button>
            `
        ).join("");

}


window.usarHistorico =
function(termo) {

    pesquisa.value = termo;

    pesquisarCliente();

};


/* =========================================================
   DASHBOARD
   ========================================================= */

btnAdmin.addEventListener(
    "click",
    () => {

        sistema.style.display = "none";

        painelAdmin.style.display = "block";

        atualizarDashboard();

    }
);


fecharAdmin.addEventListener(
    "click",
    () => {

        painelAdmin.style.display = "none";

        sistema.style.display = "block";

    }
);


function atualizarDashboard() {

    if (!clientes.length) {

        atualizarNumeros(
            0,
            0,
            0,
            0,
            0
        );

        atualizarSaude(0);

        const ranking =
            document.getElementById(
                "rankingPaineis"
            );

        if (ranking) {
            ranking.innerHTML =
                "<p>Nenhum cliente carregado.</p>";
        }

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
        total - bom - medio;


    atualizarNumeros(
        total,
        paineis.length,
        bom,
        medio,
        ruim
    );


    /*
       SAÚDE DA REDE

       Consideramos saúde:
       clientes com status Bom
       dividido pelo total.
    */

    const percentualSaude =
        total > 0
            ? (bom / total) * 100
            : 0;


    atualizarSaude(
        percentualSaude
    );


    atualizarRanking();

}


/* =========================================================
   NÚMEROS DO DASHBOARD
   ========================================================= */

function atualizarNumeros(
    total,
    paineis,
    bom,
    medio,
    ruim
) {

    const elementos = {

        totalClientes: total,

        totalPaineis: paineis,

        totalBom: bom,

        totalMedio: medio,

        totalRuim: ruim

    };


    Object.entries(elementos)
        .forEach(
            ([id, valor]) => {

                const elemento =
                    document.getElementById(id);

                if (elemento) {

                    elemento.textContent =
                        valor;

                }

            }
        );

}


/* =========================================================
   BARRA DE SAÚDE
   ========================================================= */

function criarBarraSaude() {

    let barra =
        document.getElementById(
            "barraSaude"
        );


    let texto =
        document.getElementById(
            "textoSaude"
        );


    /*
       Se não existir no HTML,
       cria automaticamente.
    */

    if (!barra) {

        const titulo =
            document.createElement("h2");

        titulo.textContent =
            "❤️ Saúde da Rede";


        const container =
            document.createElement("div");

        container.className =
            "barra-saude";


        barra =
            document.createElement("div");

        barra.id =
            "barraSaude";


        container.appendChild(barra);


        texto =
            document.createElement("div");

        texto.id =
            "textoSaude";


        const ranking =
            document.getElementById(
                "rankingPaineis"
            );


        if (ranking) {

            ranking.parentNode.insertBefore(
                titulo,
                ranking
            );

            ranking.parentNode.insertBefore(
                container,
                ranking
            );

            ranking.parentNode.insertBefore(
                texto,
                ranking
            );

        }

    }


    return {
        barra,
        texto
    };

}


function atualizarSaude(percentual) {

    const elementos =
        criarBarraSaude();


    if (!elementos) return;


    const valor =
        Math.max(
            0,
            Math.min(
                100,
                percentual
            )
        );


    elementos.barra.style.width =
        valor.toFixed(1) + "%";


    elementos.texto.textContent =
        `Saúde da rede: ${valor.toFixed(1)}%`;

}


/* =========================================================
   RANKING DOS PAINÉIS
   ========================================================= */

function atualizarRanking() {

    const divRanking =
        document.getElementById(
            "rankingPaineis"
        );


    if (!divRanking) return;


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


    if (!top10.length) {

        divRanking.innerHTML =
            "<p>Nenhum painel encontrado.</p>";

        return;

    }


    const maiorQuantidade =
        top10[0][1];


    divRanking.innerHTML =
        top10.map(
            (item, index) => {

                const painel =
                    item[0];

                const quantidade =
                    item[1];


                const percentual =
                    maiorQuantidade > 0
                        ? (
                            quantidade /
                            maiorQuantidade
                        ) * 100
                        : 0;


                return `

                    <div class="itemPainel">

                        <span>
                            <span>
                                ${index + 1}º
                                ${escaparHTML(painel)}
                            </span>

                            <span>
                                ${quantidade} clientes
                            </span>
                        </span>

                        <div class="barraPainel">

                            <div
                                class="preenchimento"
                                style="
                                    width:${percentual}%;
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

document
    .getElementById("copiarEstatisticas")
    ?.addEventListener(
        "click",
        async () => {

            const total =
                clientes.length;


            const bom =
                clientes.filter(
                    c =>
                        Number(c.status) === 3
                ).length;


            const medio =
                clientes.filter(
                    c =>
                        Number(c.status) === 2
                ).length;


            const ruim =
                total - bom - medio;


            const saude =
                total > 0
                    ? (
                        bom /
                        total
                    ) * 100
                    : 0;


            const texto =

`📊 ATUALIZE TELECOM

👥 Clientes: ${total}
📡 Painéis: ${
                new Set(
                    clientes
                        .map(c => c.painel)
                        .filter(Boolean)
                ).size
            }

🟢 Bom: ${bom}
🟡 Médio: ${medio}
🔴 Ruim: ${ruim}

❤️ Saúde da rede: ${saude.toFixed(1)}%`;


            try {

                await navigator.clipboard.writeText(
                    texto
                );

                mostrarAviso(
                    "📋 Estatísticas copiadas!"
                );

            } catch {

                alert(
                    "Não foi possível copiar."
                );

            }

        }
    );


/* =========================================================
   BAIXAR JSON
   ========================================================= */

document
    .getElementById("baixarJson")
    ?.addEventListener(
        "click",
        () => {

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
                            "application/json"
                    }
                );


            const url =
                URL.createObjectURL(
                    blob
                );


            const link =
                document.createElement("a");


            link.href = url;

            link.download =
                "clientes.json";


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
                1000
            );

        }
    );


/* =========================================================
   IMPORTAÇÃO DE EXCEL
   ========================================================= */

btnImportarExcel?.addEventListener(
    "click",
    importarExcel
);


function importarExcel() {

    const arquivo =
        inputExcel?.files?.[0];


    if (!arquivo) {

        alert(
            "Selecione uma planilha Excel primeiro."
        );

        return;
    }


    if (
        typeof XLSX ===
        "undefined"
    ) {

        alert(
            "A biblioteca Excel não foi carregada."
        );

        return;
    }


    const reader =
        new FileReader();


    reader.onload =
        event => {

            try {

                const data =
                    new Uint8Array(
                        event.target.result
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
                                workbook
                                    .Sheets[nomeAba];


                            const valorA4 =
                                String(
                                    worksheet["A4"]?.v ||
                                    ""
                                ).trim();


                            if (!valorA4) {
                                return;
                            }


                            const nomePainel =
                                valorA4
                                    .startsWith("P ")
                                    ? valorA4
                                    : "P " +
                                      valorA4;


                            const ipPainel =
                                formatarIP(
                                    worksheet["D4"]?.v ||
                                    ""
                                );


                            const ssid =
                                String(
                                    worksheet["J4"]?.v ||
                                    ""
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


                            /*
                               Começa na linha 8
                               da planilha,
                               igual ao sistema
                               original.
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


                                const ppoe =
                                    String(
                                        row[0] ??
                                        ""
                                    ).trim();


                                const ip =
                                    String(
                                        row[3] ??
                                        ""
                                    ).trim();


                                const sinal =
                                    String(
                                        row[6] ??
                                        ""
                                    ).trim();


                                if (
                                    !ppoe &&
                                    !ip &&
                                    !sinal
                                ) {
                                    continue;
                                }


                                const sinalNum =
                                    parseFloat(
                                        sinal.replace(
                                            ",",
                                            "."
                                        )
                                    );


                                let status = 1;


                                if (
                                    !isNaN(
                                        sinalNum
                                    )
                                {

                                    if (
                                        sinalNum >=
                                        -65
                                    ) {

                                        status = 3;

                                    } else if (
                                        sinalNum >=
                                        -75
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


                clientes =
                    novosClientes;


                atualizarDashboard();


                inputExcel.value = "";


                alert(
                    `✅ Importação concluída!\n\n` +
                    `${clientes.length} clientes carregados.\n\n` +
                    `Agora baixe o clientes.json ` +
                    `e substitua o arquivo no GitHub.`
                );


            } catch (erro) {

                console.error(
                    erro
                );


                alert(
                    "❌ Erro ao importar Excel:\n" +
                    erro.message
                );

            }

        };


    reader.onerror =
        () => {

            alert(
                "❌ Não foi possível ler a planilha."
            );

        };


    reader.readAsArrayBuffer(
        arquivo
    );

}


/* =========================================================
   AVISOS
   ========================================================= */

function mostrarAviso(mensagem) {

    const aviso =
        document.createElement(
            "div"
        );


    aviso.textContent =
        mensagem;


    aviso.style.position =
        "fixed";


    aviso.style.left =
        "50%";


    aviso.style.bottom =
        "25px";


    aviso.style.transform =
        "translateX(-50%)";


    aviso.style.background =
        "#00b050";


    aviso.style.color =
        "#fff";


    aviso.style.padding =
        "12px 20px";


    aviso.style.borderRadius =
        "12px";


    aviso.style.fontWeight =
        "bold";


    aviso.style.zIndex =
        "999999";


    aviso.style.boxShadow =
        "0 8px 25px rgba(0,0,0,.25)";


    document.body.appendChild(
        aviso
    );


    setTimeout(
        () => {

            aviso.remove();

        },
        1800
    );

}


/* =========================================================
   ATUALIZAÇÃO DO APLICATIVO
   ========================================================= */

async function verificarNovaVersao() {

    try {

        const resposta =
            await fetch(
                "version.json?v=" +
                Date.now(),
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
                    "Versão " +
                    dados.version;

            }


            return;
        }


        if (
            dados.version !==
            versaoAtual
        ) {

            if (banner) {

                banner.style.display =
                    "flex";

            }

        }

    } catch (erro) {

        console.log(
            "Erro verificando versão:",
            erro
        );

    }

}


btnAtualizar?.addEventListener(
    "click",
    async () => {

        try {

            const registro =
                await navigator
                    .serviceWorker
                    .getRegistration();


            if (!registro) {

                location.reload();

                return;
            }


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

            } else {

                location.reload();

            }

        } catch (erro) {

            console.error(
                erro
            );

            location.reload();

        }

    }
);


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
                    "./service-worker.js"
                )
                .then(
                    registro => {

                        console.log(
                            "✅ Service Worker ativo."
                        );

                        registro.update();

                    }
                )
                .catch(
                    erro => {

                        console.error(
                            "Erro no Service Worker:",
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

                window.location.reload();

            }
        );

}


/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */

function iniciarAplicativo() {

    carregarTema();

    carregarSistema();

    carregarClientes();

    renderizarHistorico();

    criarBotaoTema();

    verificarNovaVersao();

}


iniciarAplicativo();


/*
   Verifica atualização a cada 1 minuto.
*/

setInterval(
    verificarNovaVersao,
    60000
);
