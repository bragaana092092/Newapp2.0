/* ======================================================================
   ABAS
   ====================================================================== */
function mudarAba(aba){
    document.getElementById("tabGanhos").classList.toggle("active", aba==="ganhos");
    document.getElementById("tabPix").classList.toggle("active", aba==="pix");
    document.getElementById("tabBtnGanhos").classList.toggle("active", aba==="ganhos");
    document.getElementById("tabBtnPix").classList.toggle("active", aba==="pix");

    document.getElementById("topBar").style.display = aba==="pix" ? "none" : "block";
    document.getElementById("tabsBar").style.display = aba==="pix" ? "none" : "flex";

    localStorage.setItem("abaAtiva", aba);
}

/* ======================================================================
   ATUALIZAR APP (limpa cache do navegador, preserva dados salvos)
   ====================================================================== */
async function atualizarApp(){
    let btn = document.getElementById("btnAtualizar");
    btn.innerHTML = "⏳ Atualizando...";
    btn.disabled = true;

    try{
        if("caches" in window){
            let nomes = await caches.keys();
            await Promise.all(nomes.map(n=>caches.delete(n)));
        }
        if("serviceWorker" in navigator){
            let regs = await navigator.serviceWorker.getRegistrations();
            await Promise.all(regs.map(r=>r.unregister()));
        }
    }catch(e){
        console.warn("Erro ao limpar cache:", e);
    }

    let url = new URL(window.location.href);
    url.searchParams.set("_r", Date.now());
    window.location.href = url.toString();
}

/* ======================================================================
   RESPONSIVIDADE - reconhece a tela do usuário
   ====================================================================== */
function ajustarTela(){
    document.body.classList.toggle("compact", window.innerWidth < 360);
}
window.addEventListener("resize", ajustarTela);

function toggleTheme(){
    let body=document.body;
    let tema=body.classList.contains("dark")?"light":"dark";
    body.className=tema;
    if(document.body.classList.contains("compact")===false && window.innerWidth<360){
        body.classList.add("compact");
    }
    localStorage.setItem("tema",tema);
}

function carregarTema(){
    document.body.className=localStorage.getItem("tema")||"dark";
}

/* ======================================================================
   FUNÇÕES UTILITÁRIAS - CRC16 e EMV (usadas na geração do payload Pix)
   ====================================================================== */
function crc16(str){
    let crc = 0xFFFF;
    for(let i=0;i<str.length;i++){
        crc ^= str.charCodeAt(i) << 8;
        for(let b=0;b<8;b++){
            crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) : (crc << 1);
            crc &= 0xFFFF;
        }
    }
    return crc.toString(16).toUpperCase().padStart(4,"0");
}

function emv(id,value){
    let len = value.length.toString().padStart(2,"0");
    return `${id}${len}${value}`;
}
