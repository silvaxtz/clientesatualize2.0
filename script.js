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
        tema: "temaAtual"
    },

    intervaloAtualizacao: 10000
};

/* =========================
   USUÁRIOS
========================= */

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
let clientesCarregados = false;
let versaoAtual = "1.0.0";


/* =========================================================
   ELEMENTOS
========================================================= */

const $ = (id) => document.getElementById(id);

const loginTela = $("loginTela");
const sistema = $("sistema");
const painelAdmin = $("painelAdmin");

const usuarioInput = $("usuario");
const senhaInput = $("senha");

const btnLogin = $("btnLogin");
const btnSair = $("btnSair");
const btnAdmin = $("btnAdmin");
const fecharAdmin = $("fecharAdmin");

const erroLogin = $("erroLogin");

const usuarioLogado = $("usuarioLogado");

const pesquisa = $("pesquisa");
const resultado = $("resultado");

const inputExcel = $("inputExcel");
const btnImportarExcel = $("btnImportarExcel");

const baixarJson = $("baixarJson");
const copiarEstatisticas = $("copiarEstatisticas");

const rankingPaineis = $("rankingPaineis");

const totalClientes = $("totalClientes");
const totalPaineis = $("totalPaineis");
const totalBom = $("totalBom");
const totalMedio = $("totalMedio");
const totalRuim = $("totalRuim");

const barraSaude = $("barraSaude");
const textoSaude = $("textoSaude");

const updateBanner = $("updateBanner");
const btnAtualizarApp = $("btnAtualizarApp");


/* =========================================================
   INICIALIZAÇÃO
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    inicializarTema();

    inicializarLogin();

    inicializarSistema();

    inicializarAdmin();

    inicializarAtualizacao();

    carregarClientes();

    restaurarSessao();

});


/* =========================================================
   LOGIN
========================================================= */

function inicializarLogin() {

    if (!btnLogin) {
        console.error("❌ btnLogin não encontrado.");
        return;
    }

    btnLogin.addEventListener("click", fazerLogin);

    if (senhaInput) {

        senhaInput.addEventListener("keydown", (event) => {

            if (event.key === "Enter") {
                fazerLogin();
            }

        });

    }

    if (usuarioInput) {

        usuarioInput.addEventListener("keydown", (event) => {

            if (event.key === "Enter") {
                fazerLogin();
            }

        });

    }

}


/* =========================================================
   FAZER LOGIN
========================================================= */

function fazerLogin() {

    const usuario = usuarioInput
        ? usuarioInput.value.trim().toLowerCase()
        : "";

    const senha = senhaInput
        ? senhaInput.value
        : "";

    limparErroLogin();


    if (!usuario || !senha) {

        mostrarErroLogin(
            "Digite o usuário e a senha."
        );

        return;
    }


    const encontrado = usuarios.find((item) => {

        return (
            item.usuario.toLowerCase() === usuario &&
            item.senha === senha
        );

    });


    if (!encontrado) {

        mostrarErroLogin(
            "Usuário ou senha incorretos."
        );

        if (senhaInput) {
            senhaInput.value = "";
            senhaInput.focus();
        }

        return;
    }


    usuarioAtual = encontrado;

    localStorage.setItem(
        CONFIG.armazenamento.usuario,
        JSON.stringify(encontrado)
    );


    entrarNoSistema();

}


/* =========================================================
   ENTRAR NO SISTEMA
========================================================= */

function entrarNoSistema() {

    if (loginTela) {
        loginTela.style.display = "none";
    }

    if (painelAdmin) {
        painelAdmin.style.display = "none";
    }

    if (sistema) {
        sistema.style.display = "block";
    }


    if (usuarioLogado && usuarioAtual) {

        usuarioLogado.textContent =
            `👤 ${usuarioAtual.usuario}`;

    }


    if (btnAdmin) {

        btnAdmin.style.display =
            usuarioAtual &&
            usuarioAtual.tipo === "admin"
                ? "inline-block"
                : "none";

    }


    if (pesquisa) {

        setTimeout(() => {
            pesquisa.focus();
        }, 150);

    }


    carregarClientes();


}


/* =========================================================
   RESTAURAR SESSÃO
========================================================= */

function restaurarSessao() {

    try {

        const salvo = localStorage.getItem(
            CONFIG.armazenamento.usuario
        );

        if (!salvo) {
            return;
        }


        const usuario = JSON.parse(salvo);

        const valido = usuarios.find(
            (item) =>
                item.usuario === usuario.usuario &&
                item.senha === usuario.senha
        );


        if (!valido) {

            localStorage.removeItem(
                CONFIG.armazenamento.usuario
            );

            return;
        }


        usuarioAtual = valido;

        entrarNoSistema();

    } catch (erro) {

        console.error(
            "Erro ao restaurar sessão:",
            erro
        );

        localStorage.removeItem(
            CONFIG.armazenamento.usuario
        );

    }

}


/* =========================================================
   LOGOUT
========================================================= */

function sair() {

    usuarioAtual = null;

    localStorage.removeItem(
        CONFIG.armazenamento.usuario
    );


    if (sistema) {
        sistema.style.display = "none";
    }

    if (painelAdmin) {
        painelAdmin.style.display = "none";
    }

    if (loginTela) {
        loginTela.style.display = "block";
    }


    if (usuarioInput) {
        usuarioInput.value = "";
    }

    if (senhaInput) {
        senhaInput.value = "";
    }


    limparErroLogin();


    if (usuarioInput) {
        usuarioInput.focus();
    }

}


/* =========================================================
   ERRO LOGIN
========================================================= */

function mostrarErroLogin(mensagem) {

    if (!erroLogin) {
        return;
    }

    erroLogin.textContent = mensagem;

}


function limparErroLogin() {

    if (erroLogin) {
        erroLogin.textContent = "";
    }

}


/* =========================================================
   SISTEMA
========================================================= */

function inicializarSistema() {

    if (btnSair) {

        btnSair.addEventListener(
            "click",
            sair
        );

    }


    if (pesquisa) {

        pesquisa.addEventListener(
            "input",
            pesquisarCliente
        );

    }

}


/* =========================================================
   CARREGAR CLIENTES
========================================================= */

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
                `HTTP ${resposta.status}`
            );

        }


        const dados = await resposta.json();


        if (Array.isArray(dados)) {

            clientes = dados;

        } else if (
            dados &&
            Array.isArray(dados.clientes)
        ) {

            clientes = dados.clientes;

        } else {

            throw new Error(
                "Formato inválido do clientes.json."
            );

        }


        clientesCarregados = true;


        console.log(
            `✅ ${clientes.length} clientes carregados.`
        );


        atualizarDashboard();


    } catch (erro) {

        clientesCarregados = false;

        console.error(
            "❌ Erro ao carregar clientes.json:",
            erro
        );

    }

}


/* =========================================================
   PESQUISA
========================================================= */
function pesquisarCliente() {

    if (!pesquisa || !resultado) {
        return;
    }

    const termoOriginal = pesquisa.value.trim();
    const termo = normalizar(termoOriginal);

    if (!termo) {

        resultado.innerHTML = `
            <div class="nao-encontrado">
                <div class="icone">🔎</div>

                <h2>Pesquisar cliente</h2>

                <p>
                    Digite um PPOE ou IP para começar.
                </p>
            </div>
        `;

        return;
    }

    /*
       Evita mostrar resultados demais com pesquisas
       muito curtas.

       1 caractere = não pesquisa
       2 caracteres = ainda não pesquisa
       3 ou mais = pesquisa
    */

    if (termo.length < 3) {

        resultado.innerHTML = `
            <div class="nao-encontrado">
                <div class="icone">⌨️</div>

                <h2>Continue digitando</h2>

                <p>
                    Digite pelo menos <strong>3 caracteres</strong>
                    do PPOE ou IP.
                </p>
            </div>
        `;

        return;
    }

    if (!clientesCarregados) {

        resultado.innerHTML = `
            <div class="nao-encontrado">
                <div class="icone">⏳</div>

                <h2>Carregando clientes...</h2>

                <p>
                    Aguarde um instante e tente novamente.
                </p>
            </div>
        `;

        return;
    }

    const encontrados = clientes.filter((cliente) => {

        const ppoe = normalizar(cliente.ppoe);
        const ip = normalizar(cliente.ip);

        /*
           Pesquisa somente pelo início do PPOE ou IP.
           Exemplo:

           PPOE: cliente123

           "cli"  → encontra
           "ente" → não encontra

           IP: 192.168.1.10

           "192" → encontra
           "168" → não encontra
        */

        return (
            ppoe.startsWith(termo) ||
            ip.startsWith(termo)
        );

    });

    if (encontrados.length === 0) {

        resultado.innerHTML = `
            <div class="nao-encontrado">

                <div class="icone">
                    🔍
                </div>

                <h2>
                    Cliente não encontrado
                </h2>

                <p>
                    Nenhum cliente corresponde a
                    <strong>${escaparHTML(termoOriginal)}</strong>.
                </p>

                <div class="dica">
                    Digite os primeiros caracteres do PPOE
                    ou do IP.
                </div>

            </div>
        `;

        return;
    }

    if (encontrados.length > 20) {

        resultado.innerHTML = `
            <div class="nao-encontrado">

                <div class="icone">📋</div>

                <h2>
                    Muitos resultados
                </h2>

                <p>
                    Foram encontrados
                    <strong>${encontrados.length}</strong>
                    clientes.
                </p>

                <div class="dica">
                    Continue digitando para encontrar
                    o cliente específico.
                </div>

            </div>
        `;

        return;
    }

    // Mostra somente o primeiro resultado encontrado
resultado.innerHTML = renderizarCliente(encontrados[0]);
}

/* =========================================================
   RENDERIZAR CLIENTE
========================================================= */

function renderizarCliente(cliente) {

    const status = obterStatus(
        cliente
    );


    const classeStatus =
        status.classe;


    return `
        <div class="campo">
            <div class="titulo">
                PPOE
            </div>

            <div class="valor">
                ${escaparHTML(cliente.ppoe || "-")}
            </div>
        </div>


        <div class="campo">
            <div class="titulo">
                IP
            </div>

            <div class="valor">
                ${escaparHTML(cliente.ip || "-")}
            </div>
        </div>


        <div class="campo">
            <div class="titulo">
                Sinal
            </div>

            <div class="valor">
                ${escaparHTML(cliente.sinal || "-")}
            </div>
        </div>


        <div class="campo">
            <div class="titulo">
                Status
            </div>

            <div class="valor">

                <span class="${classeStatus}">
                    ${status.texto}
                </span>

            </div>
        </div>


        <div class="campo">
            <div class="titulo">
                Painel
            </div>

            <div class="valor">
                ${escaparHTML(cliente.painel || "-")}
            </div>
        </div>
    `;

}


/* =========================================================
   NORMALIZAÇÃO
========================================================= */

function normalizar(valor) {

    return String(
        valor ?? ""
    )
        .trim()
        .toLowerCase();

}


/* =========================================================
   ESCAPAR HTML
========================================================= */

function escaparHTML(valor) {

    return String(valor ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =========================================================
   STATUS
========================================================= */

function obterStatus(cliente) {

    const status =
        String(
            cliente.status ?? ""
        ).trim();


    if (
        status === "3" ||
        normalizar(status) === "bom"
    ) {

        return {
            texto: "🟢 Bom",
            classe: "status-bom"
        };

    }


    if (
        status === "2" ||
        normalizar(status) === "medio" ||
        normalizar(status) === "médio"
    ) {

        return {
            texto: "🟡 Médio",
            classe: "status-medio"
        };

    }


    if (
        status === "1" ||
        normalizar(status) === "ruim"
    ) {

        return {
            texto: "🔴 Ruim",
            classe: "status-ruim"
        };

    }


    return {
        texto: "⚪ Desconhecido",
        classe: "status-medio"
    };

}


/* =========================================================
   TEMA
========================================================= */

function inicializarTema() {

    aplicarTema(
        localStorage.getItem(
            CONFIG.armazenamento.tema
        ) || "claro"
    );


    document
        .querySelectorAll(".btn-tema")
        .forEach(
            (botao) => {

                botao.addEventListener(
                    "click",
                    alternarTema
                );

            }
        );

}


/* =========================================================
   APLICAR TEMA
========================================================= */

function aplicarTema(tema) {

    const escuro =
        tema === "escuro";


    document.body.classList.toggle(
        "dark-mode",
        escuro
    );


    localStorage.setItem(
        CONFIG.armazenamento.tema,
        escuro
            ? "escuro"
            : "claro"
    );


    document
        .querySelectorAll(".btn-tema")
        .forEach(
            (botao) => {

                botao.textContent =
                    escuro
                        ? "☀️"
                        : "🌙";

                botao.title =
                    escuro
                        ? "Ativar modo claro"
                        : "Ativar modo noite";

            }
        );

}


/* =========================================================
   ALTERNAR TEMA
========================================================= */

function alternarTema() {

    const escuro =
        document.body.classList.contains(
            "dark-mode"
        );


    aplicarTema(
        escuro
            ? "claro"
            : "escuro"
    );

}


/* =========================================================
   FIM DA PARTE 1
========================================================= */

/* =========================================================
   ADMIN
========================================================= */

function inicializarAdmin() {

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


    if (baixarJson) {

        baixarJson.addEventListener(
            "click",
            baixarClientesJson
        );

    }


    if (copiarEstatisticas) {

        copiarEstatisticas.addEventListener(
            "click",
            copiarDadosDashboard
        );

    }


    if (btnImportarExcel) {

        btnImportarExcel.addEventListener(
            "click",
            importarExcel
        );

    }

}


/* =========================================================
   ABRIR ADMIN
========================================================= */

function abrirAdmin() {

    if (
        !usuarioAtual ||
        usuarioAtual.tipo !== "admin"
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


/* =========================================================
   FECHAR ADMIN
========================================================= */

function fecharPainelAdmin() {

    if (painelAdmin) {
        painelAdmin.style.display = "none";
    }


    if (sistema) {
        sistema.style.display = "block";
    }


    if (pesquisa) {
        pesquisa.focus();
    }

}


/* =========================================================
   DASHBOARD
========================================================= */

function atualizarDashboard() {

    if (!clientes.length) {

        atualizarNumerosDashboard(
            0,
            0,
            0,
            0,
            0
        );

        atualizarSaudeRede();

        if (rankingPaineis) {
            rankingPaineis.innerHTML = `
                <div class="nao-encontrado">
                    <div class="icone">📡</div>
                    <p>
                        Nenhum cliente carregado.
                    </p>
                </div>
            `;
        }

        return;
    }


    let bom = 0;
    let medio = 0;
    let ruim = 0;


    const paineis = {};


    clientes.forEach(
        (cliente) => {

            const status =
                String(
                    cliente.status ?? ""
                ).trim();


            if (
                status === "3" ||
                normalizar(status) === "bom"
            ) {

                bom++;

            } else if (
                status === "2" ||
                normalizar(status) === "medio" ||
                normalizar(status) === "médio"
            ) {

                medio++;

            } else if (
                status === "1" ||
                normalizar(status) === "ruim"
            ) {

                ruim++;

            }


            const painel =
                String(
                    cliente.painel ?? ""
                ).trim();


            if (painel) {

                paineis[painel] =
                    (paineis[painel] || 0) + 1;

            }

        }
    );


    atualizarNumerosDashboard(
        clientes.length,
        Object.keys(paineis).length,
        bom,
        medio,
        ruim
    );


    atualizarSaudeRede(
        bom,
        clientes.length
    );


    atualizarRanking(
        paineis
    );

}


/* =========================================================
   NÚMEROS DASHBOARD
========================================================= */

function atualizarNumerosDashboard(
    clientesTotal,
    paineisTotal,
    bom,
    medio,
    ruim
) {

    if (totalClientes) {
        totalClientes.textContent =
            clientesTotal;
    }

    if (totalPaineis) {
        totalPaineis.textContent =
            paineisTotal;
    }

    if (totalBom) {
        totalBom.textContent =
            bom;
    }

    if (totalMedio) {
        totalMedio.textContent =
            medio;
    }

    if (totalRuim) {
        totalRuim.textContent =
            ruim;
    }

}


/* =========================================================
   SAÚDE DA REDE
========================================================= */

function atualizarSaudeRede(
    bom = 0,
    total = clientes.length
) {

    if (!barraSaude || !textoSaude) {
        return;
    }


    if (!total) {

        barraSaude.style.width = "0%";

        textoSaude.textContent =
            "0% dos clientes com sinal bom";

        return;
    }


    const percentual =
        Math.round(
            (bom / total) * 100
        );


    barraSaude.style.width =
        `${percentual}%`;


    textoSaude.textContent =
        `${percentual}% dos clientes com sinal bom`;

}


/* =========================================================
   RANKING DOS PAINÉIS
========================================================= */

function atualizarRanking(paineis) {

    if (!rankingPaineis) {
        return;
    }


    const lista =
        Object.entries(paineis)
            .sort(
                (a, b) =>
                    b[1] - a[1]
            );


    if (!lista.length) {

        rankingPaineis.innerHTML = `
            <div class="nao-encontrado">
                <p>
                    Nenhum painel encontrado.
                </p>
            </div>
        `;

        return;
    }


    const maior =
        lista[0][1];


    rankingPaineis.innerHTML =
        lista
            .slice(0, 20)
            .map(
                ([painel, quantidade], index) => {

                    const percentual =
                        maior > 0
                            ? (
                                quantidade /
                                maior
                            ) * 100
                            : 0;


                    return `
                        <div class="itemPainel">

                            <span>

                                <span>
                                    #${index + 1}
                                    ${escaparHTML(painel)}
                                </span>

                                <strong>
                                    ${quantidade}
                                </strong>

                            </span>


                            <div class="barraPainel">

                                <div
                                    class="preenchimento"
                                    style="width:${percentual}%"
                                ></div>

                            </div>

                        </div>
                    `;

                }
            )
            .join("");

}


/* =========================================================
   BAIXAR JSON
========================================================= */

function baixarClientesJson() {

    if (!clientes.length) {

        alert(
            "Não há clientes carregados."
        );

        return;
    }


    const conteudo =
        JSON.stringify(
            clientes,
            null,
            4
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

async function copiarDadosDashboard() {

    const total =
        clientes.length;


    let bom = 0;
    let medio = 0;
    let ruim = 0;


    const paineis = new Set();


    clientes.forEach(
        (cliente) => {

            const status =
                String(
                    cliente.status ?? ""
                ).trim();


            if (
                status === "3" ||
                normalizar(status) === "bom"
            ) {

                bom++;

            } else if (
                status === "2" ||
                normalizar(status) === "medio" ||
                normalizar(status) === "médio"
            ) {

                medio++;

            } else if (
                status === "1" ||
                normalizar(status) === "ruim"
            ) {

                ruim++;

            }


            if (cliente.painel) {
                paineis.add(
                    String(cliente.painel).trim()
                );
            }

        }
    );


    const percentual =
        total > 0
            ? Math.round(
                (bom / total) * 100
            )
            : 0;


    const texto = `
📊 ATUALIZE TELECOM

👥 Clientes: ${total}
📡 Painéis: ${paineis.size}

🟢 Bom: ${bom}
🟡 Médio: ${medio}
🔴 Ruim: ${ruim}

❤️ Saúde da rede: ${percentual}%
`.trim();


    try {

        await navigator.clipboard.writeText(
            texto
        );


        alert(
            "Estatísticas copiadas!"
        );


    } catch (erro) {

        console.error(
            "Erro ao copiar:",
            erro
        );


        alert(
            "Não foi possível copiar as estatísticas."
        );

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
        inputExcel.files &&
        inputExcel.files[0];


    if (!arquivo) {

        alert(
            "Selecione uma planilha primeiro."
        );

        return;
    }


    if (
        typeof XLSX ===
        "undefined"
    ) {

        alert(
            "A biblioteca do Excel não foi carregada."
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


        const novosClientes = [];


        workbook.SheetNames.forEach(
            (nomeAba) => {

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
                    (linha) => {

                        const ppoe =
                            obterCampoExcel(
                                linha,
                                [
                                    "ppoe",
                                    "PPPOE",
                                    "PPOE",
                                    "usuário",
                                    "usuario"
                                ]
                            );


                        const ip =
                            obterCampoExcel(
                                linha,
                                [
                                    "ip",
                                    "IP"
                                ]
                            );


                        const sinal =
                            obterCampoExcel(
                                linha,
                                [
                                    "sinal",
                                    "Sinal",
                                    "SIGNAL"
                                ]
                            );


                        const painel =
                            obterCampoExcel(
                                linha,
                                [
                                    "painel",
                                    "Painel",
                                    "PANEL"
                                ]
                            );


                        if (
                            !ppoe &&
                            !ip
                        ) {

                            return;

                        }


                        const status =
                            calcularStatusPorSinal(
                                sinal
                            );


                        novosClientes.push({

                            ppoe:
                                String(ppoe).trim(),

                            ip:
                                String(ip).trim(),

                            sinal:
                                String(sinal).trim(),

                            status,

                            painel:
                                String(painel).trim()

                        });

                    }
                );

            }
        );


        if (!novosClientes.length) {

            alert(
                "Nenhum cliente válido foi encontrado na planilha."
            );

            return;
        }


        clientes =
            novosClientes;


        clientesCarregados = true;


        atualizarDashboard();


        alert(
            `${clientes.length} clientes importados com sucesso!`
        );


    } catch (erro) {

        console.error(
            "Erro ao importar Excel:",
            erro
        );


        alert(
            "Não foi possível importar a planilha."
        );

    }

}


/* =========================================================
   CAMPO DA PLANILHA
========================================================= */

function obterCampoExcel(
    linha,
    nomes
) {

    const chaves =
        Object.keys(linha);


    for (
        const nome of nomes
    ) {

        const encontrado =
            chaves.find(
                chave =>
                    normalizar(chave) ===
                    normalizar(nome)
            );


        if (
            encontrado !== undefined
        ) {

            return linha[
                encontrado
            ];

        }

    }


    return "";

}


/* =========================================================
   STATUS PELO SINAL
========================================================= */

function calcularStatusPorSinal(
    sinal
) {

    const texto =
        String(
            sinal ?? ""
        )
        .trim()
        .replace(",", ".");


    const numero =
        parseFloat(texto);


    if (
        Number.isNaN(numero)
    ) {

        return "";

    }


    /*
       Regra padrão para sinal óptico:

       >= -25  -> Bom
       >= -28  -> Médio
       <  -28  -> Ruim

       Se sua planilha já possui status,
       o valor original pode ser preservado
       em uma atualização posterior.
    */


    if (numero >= -25) {
        return "3";
    }


    if (numero >= -28) {
        return "2";
    }


    return "1";

}


/* =========================================================
   FIM DA PARTE 2
========================================================= */

/* =========================================================
   ATUALIZAÇÃO DO APLICATIVO
========================================================= */

function inicializarAtualizacao() {

    if (btnAtualizarApp) {

        btnAtualizarApp.addEventListener(
            "click",
            atualizarAplicativo
        );

    }


    verificarNovaVersao();

}


/* =========================================================
   VERIFICAR NOVA VERSÃO
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
            return;
        }


        const dados =
            await resposta.json();


        if (!dados.version) {
            return;
        }


        versaoAtual =
            String(dados.version);


        const versaoNaTela =
            document.getElementById(
                "versaoApp"
            );


        if (versaoNaTela) {

            versaoNaTela.textContent =
                `Versão ${versaoAtual}`;

        }


        const versaoSalva =
            localStorage.getItem(
                "versaoAplicativo"
            );


        if (
            versaoSalva &&
            versaoSalva !== versaoAtual
        ) {

            mostrarBannerAtualizacao();

        }


        localStorage.setItem(
            "versaoAplicativo",
            versaoAtual
        );


    } catch (erro) {

        console.warn(
            "Não foi possível verificar a versão.",
            erro
        );

    }

}


/* =========================================================
   MOSTRAR BANNER
========================================================= */

function mostrarBannerAtualizacao() {

    if (!updateBanner) {
        return;
    }


    updateBanner.style.display =
        "flex";

}


/* =========================================================
   ATUALIZAR APLICATIVO
========================================================= */

async function atualizarAplicativo() {

    try {

        if (
            "serviceWorker" in
            navigator
        ) {

            const registrations =
                await navigator
                    .serviceWorker
                    .getRegistrations();


            for (
                const registration
                of registrations
            ) {

                try {

                    await registration.update();

                } catch (erro) {

                    console.warn(
                        "Erro atualizando Service Worker:",
                        erro
                    );

                }

            }

        }


        if (window.caches) {

            const cachesAtuais =
                await caches.keys();


            await Promise.all(
                cachesAtuais.map(
                    nome =>
                        caches.delete(nome)
                )
            );

        }


    } catch (erro) {

        console.warn(
            "Erro limpando cache:",
            erro
        );

    }


    window.location.reload(
        true
    );

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
                    await navigator
                        .serviceWorker
                        .register(
                            "./service-worker.js"
                        );


                console.log(
                    "✅ Service Worker registrado.",
                    registro
                );


                registro.addEventListener(
                    "updatefound",
                    () => {

                        const novo =
                            registro.installing;


                        if (!novo) {
                            return;
                        }


                        novo.addEventListener(
                            "statechange",
                            () => {

                                if (
                                    novo.state ===
                                    "installed"
                                ) {

                                    if (
                                        navigator
                                            .serviceWorker
                                            .controller
                                    ) {

                                        mostrarBannerAtualizacao();

                                    }

                                }

                            }
                        );

                    }
                );


            } catch (erro) {

                console.error(
                    "❌ Erro no Service Worker:",
                    erro
                );

            }

        }
    );

}


/* =========================================================
   TRATAMENTO GLOBAL DE ERROS
========================================================= */

window.addEventListener(
    "error",
    (evento) => {

        console.error(
            "Erro no aplicativo:",
            evento.error ||
            evento.message
        );

    }
);


window.addEventListener(
    "unhandledrejection",
    (evento) => {

        console.error(
            "Promise rejeitada:",
            evento.reason
        );

    }
);


/* =========================================================
   EVENTOS EXTRAS
========================================================= */

document.addEventListener(
    "keydown",
    (evento) => {

        /*
           ESC fecha o painel administrativo.
        */

        if (
            evento.key === "Escape" &&
            painelAdmin &&
            painelAdmin.style.display !== "none"
        ) {

            fecharPainelAdmin();

        }

    }
);


/* =========================================================
   GARANTIR ESTADO INICIAL
========================================================= */

function garantirEstadoInicial() {

    if (
        !usuarioAtual &&
        loginTela &&
        sistema
    ) {

        loginTela.style.display =
            "block";

        sistema.style.display =
            "none";

    }


    if (
        !usuarioAtual &&
        painelAdmin
    ) {

        painelAdmin.style.display =
            "none";

    }

}


/* =========================================================
   INICIAR SERVICE WORKER
========================================================= */

registrarServiceWorker();


/* =========================================================
   ESTADO FINAL
========================================================= */

garantirEstadoInicial();


console.log(
    "🚀 Atualize Telecom carregado com sucesso."
);


/* =========================================================
   FIM DO SCRIPT
========================================================= */
