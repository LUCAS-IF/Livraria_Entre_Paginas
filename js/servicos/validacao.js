"use strict";

// Reúne validações usadas pelos formulários para manter as regras em um só lugar.
function emailValido(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(email || "").trim());
}

function campoContatoComErro(dados) {
  if (String(dados.nome || "").trim().length < 3) return "nome";
  if (!emailValido(dados.email)) return "email";
  if (String(dados.assunto || "").trim().length < 3) return "assunto";
  if (String(dados.mensagem || "").trim().length < 10) return "mensagem";
  return "";
}

function validarFormularioContato(dados) {
  const campoInvalido = campoContatoComErro(dados);
  const mensagens = {
    nome: "Informe seu nome com pelo menos três caracteres.",
    email: "Informe um endereço de e-mail válido.",
    assunto: "Informe um assunto com pelo menos três caracteres.",
    mensagem: "Escreva uma mensagem com pelo menos dez caracteres."
  };
  return mensagens[campoInvalido] || "";
}

function validarTermoOpenLibrary(termo) {
  return String(termo || "").trim().length >= 2
    ? ""
    : "Digite pelo menos duas letras para pesquisar.";
}

// Verifica se o CEP digitado tem os oito números exigidos pelo ViaCEP.
function cepTemFormatoValido(cep) {
  return /^\d{8}$/.test(String(cep || "").replace(/\D/g, ""));
}

// Confere se a resposta do ViaCEP corresponde ao CEP consultado.
function respostaCepValida(endereco, cepSolicitado) {
  if (!endereco || endereco.erro) return false;
  const cepRetornado = String(endereco.cep || "").replace(/\D/g, "");
  return cepRetornado === String(cepSolicitado || "")
    && Boolean(String(endereco.uf || "").trim())
    && Boolean(String(endereco.localidade || "").trim());
}

// Identifica qual campo do cartão precisa de correção, sem acessar elementos da página.
function campoCartaoComErro(dados) {
  const numero = String(dados.cartaoNumero || "").replace(/\D/g, "");
  if (!/^\d{16}$/.test(numero)) return "cartaoNumero";

  if (String(dados.cartaoTitular || "").trim().length < 3) return "cartaoTitular";

  const validade = String(dados.cartaoValidade || "").trim();
  const partesValidade = validade.match(/^(0[1-9]|1[0-2])\/(\d{2})$/);
  if (!partesValidade) return "cartaoValidade";

  const mes = Number(partesValidade[1]);
  const ano = 2000 + Number(partesValidade[2]);
  const agora = new Date();
  const anoAtual = agora.getFullYear();
  const mesAtual = agora.getMonth() + 1;
  if (ano < anoAtual || (ano === anoAtual && mes < mesAtual)) return "cartaoValidade";

  if (!/^\d{3,4}$/.test(String(dados.cartaoCvv || ""))) return "cartaoCvv";
  return "";
}

// Verifica somente o formato dos dados fictícios; não consulta nem autoriza cartões.
function validarDadosCartao(dados) {
  const campoInvalido = campoCartaoComErro(dados);
  const mensagens = {
    cartaoNumero: "Digite os 16 números fictícios do cartão.",
    cartaoTitular: "Informe um nome fictício para o titular do cartão.",
    cartaoValidade: "Confira a validade no formato MM/AA e use uma data atual ou futura.",
    cartaoCvv: "Informe um CVV fictício com três ou quatro números."
  };
  return mensagens[campoInvalido] || "";
}

function validarDadosCheckout(dados, cepValidado, carrinhoVazio) {
  if (String(dados.nome || "").trim().length < 3) return "Informe seu nome completo (pelo menos três caracteres).";
  if (!emailValido(dados.email)) return "Informe um e-mail válido.";

  const cepInformado = String(dados.cep || "").replace(/\D/g, "");
  if (!cepTemFormatoValido(cepInformado) || cepValidado !== cepInformado) {
    return "Consulte um CEP existente pelo botão Buscar CEP antes de concluir o pedido.";
  }

  if (!String(dados.rua || "").trim() || !String(dados.numero || "").trim()
      || !/^\d+$/.test(String(dados.numero || "").trim())
      || !String(dados.bairro || "").trim() || !String(dados.cidade || "").trim()
      || !String(dados.estado || "").trim()) {
    return "Confira os campos obrigatórios do endereço. O número deve conter somente dígitos.";
  }

  const formasPagamento = ["Pix", "Cartão de crédito", "Boleto"];
  if (!formasPagamento.includes(dados.pagamento)) return "Escolha uma forma de pagamento válida.";

  if (dados.pagamento === "Cartão de crédito") {
    const erroCartao = validarDadosCartao(dados);
    if (erroCartao) return erroCartao;
  }

  if (carrinhoVazio) return "Adicione ao menos um livro antes de concluir o pedido.";
  return "";
}
