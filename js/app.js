/* ======================================================================
   INICIALIZAÇÃO
   ====================================================================== */
window.addEventListener("DOMContentLoaded", ()=>{
    carregarTema();
    ajustarTela();
    carregarMeta();
    renderizar();
    renderizarPontoUI();
    renderizarChaves();

    let abaSalva = localStorage.getItem("abaAtiva") || "ganhos";
    mudarAba(abaSalva);
});
