"use strict";

// Reúne as operações principais do carrinho para não misturar regras com a interface.
class Carrinho {
  constructor(itensSalvos = []) {
    const registrosValidos = Array.isArray(itensSalvos)
      ? itensSalvos.filter(item => item && item.livro && typeof item.livro === "object" && item.livro.id)
      : [];

    this.itens = registrosValidos.map(item => {
      const livro = item.livro instanceof Livro ? item.livro : new Livro(item.livro);
      return new ItemCarrinho(livro, item.quantidade);
    });
  }

  adicionar(livro) {
    if (!(livro instanceof Livro)) return false;

    const itemExistente = this.itens.find(item => item.livro.id === livro.id);
    if (itemExistente) {
      if (itemExistente.quantidade >= 99) return false;
      itemExistente.alterarQuantidade(itemExistente.quantidade + 1);
      return true;
    }

    this.itens.push(new ItemCarrinho(livro));
    return true;
  }

  alterarQuantidade(idLivro, quantidade) {
    const item = this.itens.find(atual => atual.livro.id === String(idLivro));
    if (!item) return false;

    if (quantidade <= 0) {
      this.remover(idLivro);
      return true;
    }

    return item.alterarQuantidade(quantidade);
  }

  remover(idLivro) {
    const quantidadeAnterior = this.itens.length;
    this.itens = this.itens.filter(item => item.livro.id !== String(idLivro));
    return this.itens.length < quantidadeAnterior;
  }

  esvaziar() {
    this.itens = [];
  }

  calcularSubtotal() {
    const totalEmCentavos = this.itens.reduce(
      (soma, item) => soma + Math.round(item.livro.preco * 100) * item.quantidade,
      0
    );
    return totalEmCentavos / 100;
  }

  contarUnidades() {
    return this.itens.reduce((total, item) => total + item.quantidade, 0);
  }

  estaVazio() {
    return this.itens.length === 0;
  }

  paraJSON() {
    return this.itens.map(item => item.paraJSON());
  }
}
