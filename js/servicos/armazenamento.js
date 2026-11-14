"use strict";

// Leitura protegida: dados antigos ou corrompidos não devem quebrar a página.
function lerDadosSalvos(chave, valorPadrao) {
  try {
    const conteudo = localStorage.getItem(chave);
    return conteudo === null ? valorPadrao : JSON.parse(conteudo);
  } catch (erro) {
    return valorPadrao;
  }
}

// Centraliza a gravação para tratar situações em que o navegador bloqueia o armazenamento.
function salvarDados(chave, valor) {
  try {
    localStorage.setItem(chave, JSON.stringify(valor));
    return true;
  } catch (erro) {
    return false;
  }
}
