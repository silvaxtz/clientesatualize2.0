// =========================
// USUÁRIOS
// =========================

const usuarios = [
    { usuario: "adriano", senha: "180405a", tipo: "admin" },
    { usuario: "julio", senha: "suporteatlz", tipo: "tecnico" },
    { usuario: "kristian", senha: "suporteatlz", tipo: "tecnico" },
    { usuario: "jeciana", senha: "suporteatlz", tipo: "tecnico" },
    { usuario: "nubia", senha: "suporteatlz", tipo: "tecnico" },
    { usuario: "jerbson", senha: "suporteatlz", tipo: "tecnico" }
];

// =========================
// ELEMENTOS
// =========================

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

// Elementos de Pesquisa
const pesquisa = document.getElementById("pesquisa");
const resultado = document.getElementById("resultado");
const divHistorico = document.getElementById("historicoPesquisas");

// =========================
// LOGIN
// =========================

function entrar() {
    const usuario = usuarioInput.value.trim().toLowerCase();
    const senha = senhaInput.value;

    const encontrado = usuarios.find(u =>
        u.usuario === usuario &&
        u.senha === senha
    );

    if (!encontrado) {
        erroLogin.textContent = "Usuário ou senha inválidos.";
        return;
    }

    localStorage.setItem("usuarioAtual", JSON.stringify(encontrado));
    carregarSistema();
}

btnLogin.addEventListener("click", entrar);

senhaInput.addEventListener("keypress", e => {
    if (e.key === "Enter") entrar();
});

function carregarSistema() {
    const salvo = JSON.parse(localStorage.getItem("usuarioAtual"));

    if (!salvo) {
        loginTela.style.display = "block";
        sistema.style.display = "none";
        painelAdmin.style.display = "none";
        return;
    }

    loginTela.style.display = "none";
    sistema.style.display = "block";

    usuarioLogado.innerHTML = `👤 ${salvo.usuario} (${salvo.tipo})`;

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

carregarSistema();

// =========================
// CLIENTES & HISTÓRICO
// =========================

let clientes = [];

// Formata IP
function formatarIP(ip){
    if(!ip) return "";
    ip = String(ip);
    if(ip.includes(".")) return ip;
    ip = ip.replace(/\D/g,"");
    if(ip.length===12){
        return ip.replace(/(\d{3})(\d{3})(\d{3})(\d{3})/,"$1.$2.$3.$4");
    }
    return ip;
}

// Carrega clientes do JSON inicial
fetch("clientes.json")
.then(res => {
    if (!res.ok) throw new Error("Sem clientes.json");
    return res.json();
})
.then(data => {
    clientes = data;
    atualizarDashboard();
})
.catch(err => console.log("Arquivo JSON ainda não existe ou está vazio."));

pesquisa.addEventListener("input", () => {
    const texto = pesquisa.value.toLowerCase().trim();

    if (texto === "") {
        resultado.innerHTML = "";
        return;
    }

    const cliente = clientes.find(c => {
        const ppoeCliente = (c.ppoe || "").toLowerCase();
        const ipCliente = String(c.ip || "").toLowerCase();
        
        return ppoeCliente.includes(texto) || ipCliente.includes(texto);
    });

    if (!cliente) {
        resultado.innerHTML = `
            <div class="nao-encontrado">
                <div class="icone">🔍</div>
                <h2>Cliente não encontrado</h2>
                <p>Verifique se o PPOE ou IP foi digitado corretamente.</p>
            </div>
        `;
        return;
    }

    let status = cliente.status;
    let classe = "";

    if (Number(status) === 3) {
        status = "🟢 Bom";
        classe = "status-bom";
    } else if (Number(status) === 2) {
        status = "🟡 Médio";
        classe = "status-medio";
    } else {
        status = "🔴 Ruim";
        classe = "status-ruim";
    }

    // Lógica do sinal com alerta integrado
let sinalValor = parseInt(cliente.sinal);
let alertaHtml = "";

if (!isNaN(sinalValor)) {

    if (sinalValor <= -81) {

        alertaHtml = `
            <div class="alerta-critico">
                ⚠️ Sinal crítico (${cliente.sinal} dBm)<br>
               Verificar o sinal.
            </div>
        `;

    } else if (sinalValor <= -70) {

        alertaHtml = `
            <div class="alerta-critico" style="background:#fff3cd;color:#856404;border:1px solid #ffeeba;">
                ⚠️ Atenção (${cliente.sinal} dBm)<br>
                Sinal fora do ideal.
            </div>
        `;

    }

}

    resultado.innerHTML = `
    <div class="campo">
        <div class="titulo">PPOE</div>
        <div class="valor">${cliente.ppoe}</div>
    </div>
    <div class="campo">
        <div class="titulo">Painel</div>
        <div class="valor">${cliente.painel}</div>
    </div>
    <div class="campo">
        <div class="titulo">IP</div>
        <div class="valor">${formatarIP(cliente.ip)}</div>
    </div>
    <div class="campo">
         <div class="titulo">SSID</div>
        <div class="valor">${cliente.ssid || "Não informado"}</div>
    </div>
    <div class="campo">
        <div class="titulo">Última Medição</div>
        <div class="valor">${cliente.sinal}</div>
    </div>
    ${alertaHtml}
    <div class="campo">
        <div class="titulo">Status</div>
        <div class="${classe}">${status}</div>
    <div class="botoes-copiar">
        <button onclick="copiarEsalvar('${formatarIP(cliente.ip)}', '${cliente.ppoe}')">
            📋 Copiar IP
        </button>

        <button onclick="copiarEsalvar('${cliente.ppoe}', '${cliente.ppoe}')">
            📋 Copiar PPOE
        </button>

        <button onclick="copiarEsalvar('${cliente.ssid}', '${cliente.ppoe}')">
            📋 Copiar SSID
        </button>
     </div>
    `;
});

window.copiarEsalvar = function(textoParaCopiar, ppoeParaHistorico) {
    navigator.clipboard.writeText(textoParaCopiar);
    alert("Copiado!");
    
    let historico = JSON.parse(localStorage.getItem("historico_pesquisas") || "[]");
    historico = historico.filter(h => h !== ppoeParaHistorico); 
    historico.unshift(ppoeParaHistorico); 
    if(historico.length > 5) historico.pop(); 
    
    localStorage.setItem("historico_pesquisas", JSON.stringify(historico));
    renderizarHistorico();
};

function renderizarHistorico() {
    let historico = JSON.parse(localStorage.getItem("historico_pesquisas") || "[]");
    if(historico.length === 0) {
        divHistorico.innerHTML = "";
        return;
    }
    
    divHistorico.innerHTML = historico.map(h => 
        `<button class="btn-historico" onclick="usarHistorico('${h}')">🕒 ${h}</button>`
    ).join("");
}

window.usarHistorico = function(termo) {
    pesquisa.value = termo;
    pesquisa.dispatchEvent(new Event('input'));
};

// =========================
// DASHBOARD ADMIN
// =========================

btnAdmin.addEventListener("click", () => {
    sistema.style.display = "none";
    painelAdmin.style.display = "block";
    atualizarDashboard();
});

fecharAdmin.addEventListener("click", () => {
    painelAdmin.style.display = "none";
    sistema.style.display = "block";
});

function atualizarDashboard() {
    if (clientes.length === 0) return;

    const totalClientes = clientes.length;
    const paineis = [...new Set(clientes.map(c => c.painel))];
    const bom = clientes.filter(c => Number(c.status) === 3).length;
    const medio = clientes.filter(c => Number(c.status) === 2).length;
    const ruim = clientes.filter(c => Number(c.status) !== 3 && Number(c.status) !== 2).length;
    
    document.getElementById("totalClientes").textContent = totalClientes;
    document.getElementById("totalPaineis").textContent = paineis.length;
    document.getElementById("totalBom").textContent = bom;
    document.getElementById("totalMedio").textContent = medio;
    document.getElementById("totalRuim").textContent = ruim;

    const ranking = {};
    clientes.forEach(c => ranking[c.painel] = (ranking[c.painel] || 0) + 1);
    
    const top10 = Object.entries(ranking)
        .sort((a, b) => b[1] - a[1]) 
        .slice(0, 10); 
    
    const divRanking = document.getElementById("rankingPaineis");
    divRanking.innerHTML = ""; 
    
    top10.forEach((item, index) => {
        const linha = document.createElement("div");
        linha.innerHTML = `<strong>${index + 1}º ${item[0]}</strong> - ${item[1]} clientes`;
        linha.style.padding = "5px 0";
        linha.style.borderBottom = "1px solid #ddd";
        divRanking.appendChild(linha);
    });
}

document.getElementById("copiarEstatisticas").addEventListener("click", () => {
    const total = clientes.length;
    const bom = clientes.filter(c => Number(c.status) === 3).length;
    const medio = clientes.filter(c => Number(c.status) === 2).length;
    const ruim = total - bom - medio;
    
    const textoParaCopiar = `📊 Estatísticas Atualize Telecom:
👥 Clientes: ${total}
🟢 Bom: ${bom}
🟡 Médio: ${medio}
🔴 Ruim: ${ruim}`;
    
    navigator.clipboard.writeText(textoParaCopiar);
    alert("Estatísticas copiadas!");
});

document.getElementById("baixarJson").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(clientes, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "clientes.json";
    a.click();
    URL.revokeObjectURL(a.href);
});

// =========================
// IMPORTAÇÃO DE EXCEL
// =========================

const inputExcel = document.getElementById("inputExcel");
const btnImportarExcel = document.getElementById("btnImportarExcel");

btnImportarExcel.addEventListener("click", () => {
    const arquivo = inputExcel.files[0];

    if (!arquivo) {
        alert("Por favor, selecione uma planilha Excel (.xlsx) primeiro.");
        return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: "array" });

            let novosClientes = [];

            workbook.SheetNames.forEach(nomeAba => {

                const worksheet = workbook.Sheets[nomeAba];

                // Nome do painel
                const valorA4 = String(worksheet["A4"]?.v || "").trim();
                if (!valorA4) return;

                const nomePainel = "P " + valorA4;

                // SSID do painel (J4)
                const ssid = String(worksheet["J4"]?.v || "").trim();

                // Linhas da planilha
                const rows = XLSX.utils.sheet_to_json(worksheet, {
                    header: 1,
                    defval: ""
                });

                for (let i = 7; i < rows.length; i++) {

                    const row = rows[i];

                    if (!row || row.length === 0) continue;

                    const ppoe = String(row[0] || "").trim();
                    const ip = String(row[3] || "").trim();
                    const sinalRaw = row[6];

                    if (
                        !ppoe &&
                        !ip &&
                        (sinalRaw === "" || sinalRaw === null || sinalRaw === undefined)
                    ) {
                        continue;
                    }

                    const sinal = String(sinalRaw).trim();

                    let status = 1;

                    const sinalNum = parseFloat(sinal);

                    if (!isNaN(sinalNum)) {
                        if (sinalNum >= -65) {
                            status = 3;
                        } else if (sinalNum >= -75) {
                            status = 2;
                        } else {
                            status = 1;
                        }
                    }

                    novosClientes.push({
                        ppoe: ppoe,
                        painel: nomePainel,
                        ip: ip,
                        ssid: ssid,
                        sinal: sinal,
                        status: status
                    });
                }
            });

            clientes = novosClientes;

            atualizarDashboard();

            alert(`✅ Importação concluída!\n\n${clientes.length} clientes carregados.`);

            inputExcel.value = "";

        } catch (erro) {
            console.error(erro);
            alert("❌ " + erro.message);
        }
    };

    reader.readAsArrayBuffer(arquivo);
});
// ===============================
// SISTEMA DE ATUALIZAÇÃO
// ===============================

const banner = document.getElementById("updateBanner");
const btnAtualizar = document.getElementById("btnAtualizarApp");
const versaoTexto = document.getElementById("versaoApp");

let versaoAtual = null;

async function verificarNovaVersao() {

    try {

        // Busca a versão sem usar cache
        const resposta = await fetch("version.json?v=" + Date.now(), {
            cache: "no-store"
        });

        const dados = await resposta.json();

        if (versaoAtual === null) {

            versaoAtual = dados.version;

            if (versaoTexto) {
                versaoTexto.textContent = "Versão " + dados.version;
            }

            return;
        }

        if (dados.version !== versaoAtual) {

            banner.style.display = "flex";

        }

    } catch (erro) {

        console.log("Erro ao verificar atualização:", erro);

    }

}

// verifica a cada 10 segundos
setInterval(verificarNovaVersao,10000);

// primeira verificação
verificarNovaVersao();

btnAtualizar.onclick = async () => {

    const registro = await navigator.serviceWorker.getRegistration();

    if (registro) {

        await registro.update();

        if (registro.waiting) {

            registro.waiting.postMessage("SKIP_WAITING");

        }

    }

};

navigator.serviceWorker.addEventListener("controllerchange", () => {

    window.location.reload();

});
