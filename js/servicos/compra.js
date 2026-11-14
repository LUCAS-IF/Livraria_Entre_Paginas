"use strict";

// Valores e regras comerciais da simulação da livraria.
const VALOR_FRETE = 12.90;
const LIMITE_FRETE_GRATIS = 150;
const DESCONTO_CUPOM = 0.10;

function validarCupom(codigo) {
  return String(codigo || "").trim().toUpperCase() === "LIVRO10" ? "LIVRO10" : "";
}

function calcularResumoCompra(subtotal, cupomAplicado) {
  const frete = subtotal === 0 || subtotal >= LIMITE_FRETE_GRATIS ? 0 : VALOR_FRETE;
  const desconto = cupomAplicado === "LIVRO10" ? subtotal * DESCONTO_CUPOM : 0;
  return {
    subtotal,
    frete,
    desconto,
    total: Math.max(0, Math.round((subtotal + frete - desconto) * 100) / 100)
  };
}
