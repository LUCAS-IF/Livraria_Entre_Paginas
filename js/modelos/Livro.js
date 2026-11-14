"use strict";

// Representa um livro e concentra os dados usados no catálogo, nos detalhes e no carrinho.
class Livro {
  constructor(dados = {}) {
    dados = dados && typeof dados === "object" ? dados : {};
    this.id = String(dados.id ?? "livro-sem-id");
    this.titulo = dados.titulo || "Título não informado";
    this.autor = dados.autor || "Autor não informado";
    this.editora = dados.editora || "Editora não informada";
    this.ano = Number(dados.ano) || 0;
    this.paginas = Number(dados.paginas) || 0;
    this.preco = Number(dados.preco) || 0;
    this.categoria = dados.categoria || "Literatura";
    this.sinopse = dados.sinopse || "Sinopse não disponível.";
    this.capa = dados.capa || "assets/images/capa-generica.svg";
    this.textoAlternativo = dados.textoAlternativo || `Capa do livro ${this.titulo}`;
    this.avaliacao = Number(dados.avaliacao) || 0;
    this.quantidadeAvaliacoes = Number(dados.quantidadeAvaliacoes) || 0;
    this.destaque = Boolean(dados.destaque);
    this.origemApi = Boolean(dados.origemApi);
    this.linkOrigem = dados.linkOrigem || "";
  }

  // Retorna um objeto simples para guardar o livro junto ao carrinho.
  paraJSON() {
    return { ...this };
  }
}
