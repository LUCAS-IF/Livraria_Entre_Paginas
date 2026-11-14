"use strict";

// Um item do carrinho guarda um livro e a quantidade escolhida.
class ItemCarrinho {
  constructor(livro, quantidade = 1) {
    if (!(livro instanceof Livro)) {
      throw new TypeError("O item precisa ter um livro válido.");
    }

    this.livro = livro;
    this.quantidade = this.limitarQuantidade(quantidade);
  }

  // Mantém a quantidade entre uma e 99 unidades.
  limitarQuantidade(valor) {
    const quantidade = Number.parseInt(valor, 10);
    if (!Number.isInteger(quantidade)) return 1;
    return Math.min(99, Math.max(1, quantidade));
  }

  alterarQuantidade(novaQuantidade) {
    const quantidade = Number(novaQuantidade);
    if (!Number.isInteger(quantidade) || quantidade < 1 || quantidade > 99) {
      return false;
    }

    this.quantidade = quantidade;
    return true;
  }

  calcularSubtotal() {
    return Math.round(this.livro.preco * 100) * this.quantidade / 100;
  }

  paraJSON() {
    return { livro: this.livro.paraJSON(), quantidade: this.quantidade };
  }
}
