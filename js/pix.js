/* ======================================================================
   PIX - CHAVES
   ====================================================================== */
let chaves = JSON.parse(localStorage.getItem("chavesPix")) || [];
let editandoChaveIndex = null;

function salvarChaves(){
    localStorage.setItem("chavesPix", JSON.stringify(chaves));
}

function renderizarChaves(){
    let lista = document.getElementById("listaChaves");
    let select = document.getElementById("chaveSelect");

    if(chaves.length===0){
        lista.innerHTML = `<div class="semChaves">Nenhuma chave cadastrada</div>`;
        select.innerHTML = `<option value="">Cadastre uma chave Pix primeiro</option>`;
        document.getElementById("btnGerar").disabled = true;
        return;
    }

    document.getElementById("btnGerar").disabled = false;

    lista.innerHTML = "";
    chaves.forEach((c,i)=>{
        let div = document.createElement("div");
        div.className = "chaveItem";
        div.innerHTML = `
            <div class="chaveInfo">
                <div class="chaveNome">${c.nome}</div>
                <div class="chaveValor">${c.valor}</div>
            </div>
            <div class="chaveActions">
                <button onclick="abrirFormChave(${i})">✏️</button>
                <button onclick="excluirChave(${i})">🗑️</button>
            </div>
        `;
        lista.appendChild(div);
    });

    let selecionadoAnterior = select.value;
    select.innerHTML = chaves.map((c,i)=>`<option value="${i}">${c.nome}</option>`).join("");
    if(selecionadoAnterior!=="" && chaves[selecionadoAnterior]) select.value = selecionadoAnterior;
}

function abrirChavesModal(){
    document.getElementById("chavesOverlay").style.display = "block";
}

function fecharChavesModal(){
    document.getElementById("chavesOverlay").style.display = "none";
    cancelarFormChave();
}

function abrirFormChave(index){
    editandoChaveIndex = index;
    let form = document.getElementById("formChave");
    let inputNome = document.getElementById("inputNomeChave");
    let inputValor = document.getElementById("inputValorChave");

    if(index!==null && chaves[index]){
        inputNome.value = chaves[index].nome;
        inputValor.value = chaves[index].valor;
    } else {
        inputNome.value = "";
        inputValor.value = "";
    }

    form.classList.add("visivel");
}

function salvarFormChave(){
    let nome = document.getElementById("inputNomeChave").value.trim();
    let valor = document.getElementById("inputValorChave").value.trim();

    if(!nome || !valor){
        alert("Preencha nome e chave Pix");
        return;
    }

    if(editandoChaveIndex!==null && chaves[editandoChaveIndex]){
        chaves[editandoChaveIndex] = {nome, valor};
    } else {
        chaves.push({nome, valor});
    }

    salvarChaves();
    renderizarChaves();
    cancelarFormChave();
}

function cancelarFormChave(){
    editandoChaveIndex = null;
    document.getElementById("formChave").classList.remove("visivel");
    document.getElementById("inputNomeChave").value = "";
    document.getElementById("inputValorChave").value = "";
}

function excluirChave(index){
    if(!confirm("Excluir esta chave Pix?")) return;
    chaves.splice(index,1);
    salvarChaves();
    renderizarChaves();
}

/* ======================================================================
   PIX - TAXA (+20%)
   ====================================================================== */
let taxaAtiva = false;

function toggleTaxa(){
    taxaAtiva = !taxaAtiva;
    document.getElementById("btnRaio").classList.toggle("ativo", taxaAtiva);
    atualizarInfoTaxa();
}

function atualizarInfoTaxa(){
    let valorInput = document.getElementById("valor");
    let info = document.getElementById("infoTaxa");
    let valor = parseFloat(valorInput.value);

    if(taxaAtiva && !isNaN(valor) && valor>0){
        let comTaxa = valor*1.2;
        info.innerText = `Valor original R$ ${valor.toFixed(2)} + 20% = R$ ${comTaxa.toFixed(2)}`;
        info.classList.add("visivel");
    } else {
        info.innerText = "";
        info.classList.remove("visivel");
    }
}

function montarPayloadPix(chave, valor, nome, cidade){
    nome = (nome||"RECEBEDOR").substring(0,25).toUpperCase();
    cidade = (cidade||"BRASIL").substring(0,15).toUpperCase();

    let merchantAccount = emv("00","BR.GOV.BCB.PIX") + emv("01",chave);
    let campos =
        emv("00","01") +
        emv("26",merchantAccount) +
        emv("52","0000") +
        emv("53","986") +
        (valor ? emv("54",valor.toFixed(2)) : "") +
        emv("58","BR") +
        emv("59",nome) +
        emv("60",cidade) +
        emv("62",emv("05","***"));

    let semCrc = campos + "6304";
    return semCrc + crc16(semCrc);
}

function gerarPix(){
    let select = document.getElementById("chaveSelect");
    let index = select.value;

    if(index===""||!chaves[index]){
        alert("Cadastre e selecione uma chave Pix");
        return;
    }

    let chave = chaves[index];
    let valorInput = parseFloat(document.getElementById("valor").value);
    let valorFinal = !isNaN(valorInput) && valorInput>0
        ? (taxaAtiva ? valorInput*1.2 : valorInput)
        : null;

    let payload = montarPayloadPix(chave.valor, valorFinal, chave.nome, "BRASIL");

    document.getElementById("qrcode").innerHTML = "";
    new QRCode(document.getElementById("qrcode"), {
        text: payload,
        width: 220,
        height: 220
    });

    document.getElementById("formArea").style.display = "none";
    document.getElementById("qrArea").style.display = "block";
}

function voltar(){
    document.getElementById("qrArea").style.display = "none";
    document.getElementById("formArea").style.display = "block";
}

function resetar(){
    if(!confirm("Limpar o formulário de cobrança Pix?")) return;
    document.getElementById("valor").value = "";
    taxaAtiva = false;
    document.getElementById("btnRaio").classList.remove("ativo");
    atualizarInfoTaxa();
    voltar();
}

/* ======================================================================
   PIX - CONFIRMAÇÃO E AVALIAÇÃO
   ====================================================================== */
function confirmar(){
    document.getElementById("overlay").style.display = "block";
    document.querySelectorAll(".star").forEach(s=>s.classList.remove("active"));
}

function avaliar(nota){
    document.querySelectorAll(".star").forEach((s,i)=>{
        s.classList.toggle("active", i<nota);
    });
}

function voltarConfirmacao(){
    document.getElementById("overlay").style.display = "none";
    voltar();
}
