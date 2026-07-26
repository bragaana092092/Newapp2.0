/* ======================================================================
   GANHOS POR HORA / CONTROLE DE CORRIDAS
   ====================================================================== */
let META = parseFloat(localStorage.getItem("metaHora")) || 30;
let corridas = JSON.parse(localStorage.getItem("corridas")) || [];

function salvar(){
    localStorage.setItem("corridas", JSON.stringify(corridas));
}

function chaveHora(timestamp){
    let d = new Date(timestamp);
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}-${d.getHours()}`;
}

function renderizar(){
    let container = document.getElementById("listaHoras");
    container.innerHTML="";document.getElementById("totalGeral").innerText="R$ "+corridas.reduce((a,c)=>a+c.valor,0).toFixed(2);

    let grupos = {};

    corridas.forEach((corrida,index)=>{
        let chave = chaveHora(corrida.timestamp);
        if(!grupos[chave]) grupos[chave]=[];
        grupos[chave].push({...corrida,index});
    });

    let chaves = Object.keys(grupos).sort().reverse();

    chaves.forEach(chave=>{
        let lista = grupos[chave];
        let data = new Date(lista[0].timestamp);
        let hora = data.getHours().toString().padStart(2,"0");
        let total = lista.reduce((s,c)=>s+c.valor,0);

        let bloco = document.createElement("div");
        bloco.className = "hourBlock";

        let statusHTML = "";
        if(total>=META){
            statusHTML=`<div class="status" style="color:#00c853">✅ Meta batida!</div>`;
        } else {
            statusHTML=`<div class="status" style="color:#ff9800">Faltam R$ ${(META-total).toFixed(2)}</div>`;
        }

        bloco.innerHTML = `
            <div class="hourTitle">Hora ${hora}:00 - ${hora}:59</div>
            <div class="hourTotal">R$ ${total.toFixed(2)}</div>
            ${statusHTML}
        `;

        lista.forEach(corrida=>{
            let div = document.createElement("div");
            div.className = "ride";

            let horaMin = new Date(corrida.timestamp).toLocaleTimeString([],{
                hour:'2-digit',
                minute:'2-digit'
            });

            div.innerHTML = `
                <div>${horaMin} → R$ ${corrida.valor.toFixed(2)}</div>
                <div class="actions">
                    <button onclick="editarCorrida(${corrida.index})">✏️</button>
                    <button onclick="excluirCorrida(${corrida.index})">🗑️</button>
                </div>
            `;

            bloco.appendChild(div);
        });

        container.appendChild(bloco);
    });

    criarHoraAtualSeNecessario();
}

function criarHoraAtualSeNecessario(){
    let agora = new Date();
    let chaveAtual = chaveHora(agora.toISOString());
    let existe = corridas.some(c=>chaveHora(c.timestamp)===chaveAtual);

    if(!existe){
        let container = document.getElementById("listaHoras");
        let hora = agora.getHours().toString().padStart(2,"0");

        let bloco = document.createElement("div");
        bloco.className = "hourBlock";
        bloco.innerHTML = `
            <div class="hourTitle">Hora ${hora}:00 - ${hora}:59</div>
            <div class="hourTotal">R$ 0.00</div>
            <div class="status" style="color:#ff9800">Faltam R$ ${META.toFixed(2)}</div>
        `;
        container.prepend(bloco);
    }
}

function adicionarCorrida(){
    let input = document.getElementById("valorCorrida");
    let valor = parseFloat(input.value);

    if(isNaN(valor)||valor<=0){
        alert("Digite valor válido");
        return;
    }

    corridas.unshift({
        valor,
        timestamp:new Date().toISOString()
    });

    input.value="";
    salvar();
    renderizar();
}

function editarCorrida(index){
    let novo = prompt("Novo valor:",corridas[index].valor);

    if(novo!==null){
        novo = parseFloat(novo);
        if(!isNaN(novo)&&novo>0){
            corridas[index].valor = novo;
            salvar();
            renderizar();
        }
    }
}

function excluirCorrida(index){
    corridas.splice(index,1);
    salvar();
    renderizar();
}

function toggleMetaMenu(){
    let menu=document.getElementById("metaOptions");
    menu.style.display = menu.style.display==="flex" ? "none" : "flex";
}

function alterarMeta(valor){
    META = valor;
    localStorage.setItem("metaHora", valor);
    document.getElementById("metaAtual").innerText = valor;
    document.getElementById("metaOptions").style.display = "none";
    renderizar();
}

function carregarMeta(){
    document.getElementById("metaAtual").innerText = META;
}

/* ===== Controle de Ponto ===== */
let ponto = JSON.parse(localStorage.getItem("ponto")) || {estado:"parado", inicio:null, intervalos:[], fim:null};

function salvarPonto(){
    localStorage.setItem("ponto", JSON.stringify(ponto));
}

function formatarHora(ts){
    return new Date(ts).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
}

function formatarDuracao(ms){
    if(ms<0) ms=0;
    let totalMin = Math.floor(ms/60000);
    let h = Math.floor(totalMin/60);
    let m = totalMin%60;
    return `${h}h ${m}min`;
}

function calcularTotalTrabalhado(){
    if(!ponto.inicio) return 0;
    let fim = ponto.fim ? new Date(ponto.fim) : new Date();
    let totalMs = fim - new Date(ponto.inicio);

    ponto.intervalos.forEach(iv=>{
        let ivFim = iv.fim ? new Date(iv.fim) : new Date();
        totalMs -= (ivFim - new Date(iv.inicio));
    });

    return totalMs;
}

function renderizarPontoUI(){
    let status = document.getElementById("pontoStatus");
    let botoes = document.getElementById("pontoBotoes");

    if(ponto.estado==="parado"){
        status.innerHTML = ponto.fim
            ? `Último turno: ${formatarHora(ponto.inicio)} → ${formatarHora(ponto.fim)} (${formatarDuracao(calcularTotalTrabalhado())} trabalhados)`
            : "Turno não iniciado";
        botoes.innerHTML = `<button class="primary" onclick="iniciarTrabalho()">▶ Iniciar turno</button>`;
    } else if(ponto.estado==="trabalhando"){
        status.innerHTML = `🟢 Trabalhando desde ${formatarHora(ponto.inicio)} · ${formatarDuracao(calcularTotalTrabalhado())}`;
        botoes.innerHTML = `
            <div style="display:flex;gap:8px">
                <button class="toggle" style="flex:1;margin-bottom:0" onclick="pausarTrabalho()">⏸ Pausar</button>
                <button class="metaBtn" style="flex:1;margin-bottom:0" onclick="encerrarTrabalho()">⏹ Encerrar</button>
            </div>`;
    } else if(ponto.estado==="pausado"){
        status.innerHTML = `🟠 Pausado · trabalhado até agora: ${formatarDuracao(calcularTotalTrabalhado())}`;
        botoes.innerHTML = `
            <div style="display:flex;gap:8px">
                <button class="primary" style="flex:1;margin-bottom:0" onclick="retomarTrabalho()">▶ Retomar</button>
                <button class="metaBtn" style="flex:1;margin-bottom:0" onclick="encerrarTrabalho()">⏹ Encerrar</button>
            </div>`;
    }
}

function iniciarTrabalho(){
    let km = prompt("KM inicial (opcional, deixe em branco para pular):","");
    let kmInicial = null;
    if(km!==null && km.trim()!==""){
        let n = parseFloat(km);
        if(!isNaN(n)) kmInicial = n;
    }

    ponto = {
        estado:"trabalhando",
        inicio:new Date().toISOString(),
        intervalos:[],
        fim:null,
        kmInicial,
        kmFinal:null
    };
    salvarPonto();
    renderizarPontoUI();
}

function pausarTrabalho(){
    if(ponto.estado!=="trabalhando") return;
    ponto.intervalos.push({inicio:new Date().toISOString(), fim:null});
    ponto.estado = "pausado";
    salvarPonto();
    renderizarPontoUI();
}

function retomarTrabalho(){
    if(ponto.estado!=="pausado") return;
    let ultimo = ponto.intervalos[ponto.intervalos.length-1];
    if(ultimo && !ultimo.fim) ultimo.fim = new Date().toISOString();
    ponto.estado = "trabalhando";
    salvarPonto();
    renderizarPontoUI();
}

function encerrarTrabalho(){
    if(ponto.estado==="parado") return;

    if(ponto.estado==="pausado"){
        let ultimo = ponto.intervalos[ponto.intervalos.length-1];
        if(ultimo && !ultimo.fim) ultimo.fim = new Date().toISOString();
    }

    let km = prompt("KM final (opcional, deixe em branco para pular):","");
    if(km!==null && km.trim()!==""){
        let n = parseFloat(km);
        if(!isNaN(n)) ponto.kmFinal = n;
    }

    ponto.fim = new Date().toISOString();
    ponto.estado = "parado";
    salvarPonto();
    renderizarPontoUI();
}

function resetarPonto(){
    if(!confirm("Resetar o controle de ponto? Isso não apaga as corridas já registradas.")) return;
    ponto = {estado:"parado", inicio:null, intervalos:[], fim:null, kmInicial:null, kmFinal:null};
    salvarPonto();
    renderizarPontoUI();
}

/* ======================================================================
   RELATÓRIO
   ====================================================================== */
function baixarRelatorio(){
    let hoje = new Date();
    let corridasHoje = corridas.filter(c=>{
        let d = new Date(c.timestamp);
        return d.toDateString()===hoje.toDateString();
    });

    let total = corridasHoje.reduce((a,c)=>a+c.valor,0);

    let linhas = corridasHoje.map(c=>{
        let h = new Date(c.timestamp).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
        return `${h} - R$ ${c.valor.toFixed(2)}`;
    });

    let texto =
        `Relatório de corridas - ${hoje.toLocaleDateString()}\n` +
        `${"=".repeat(30)}\n` +
        linhas.join("\n") +
        `\n${"=".repeat(30)}\n` +
        `Total: R$ ${total.toFixed(2)}\n` +
        `Corridas: ${corridasHoje.length}`;

    let blob = new Blob([texto], {type:"text/plain"});
    let url = URL.createObjectURL(blob);
    let a = document.createElement("a");
    a.href = url;
    a.download = `relatorio-${hoje.toISOString().slice(0,10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
}
