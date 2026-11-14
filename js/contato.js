"use strict";

// Valida o formulário de contato e mostra o retorno sem usar alert().
(() => {
  const formulario = document.querySelector("#formulario-contato");
  if (!formulario) return;

  const mensagem = document.querySelector("#mensagem-contato");

  function mostrarMensagem(texto, sucesso) {
    mensagem.textContent = texto;
    mensagem.className = sucesso
      ? "mensagem-formulario mensagem-sucesso"
      : "mensagem-formulario mensagem-erro";
  }

  formulario.addEventListener("submit", evento => {
    evento.preventDefault();

    const nome = formulario.elements.nome.value.trim();
    const email = formulario.elements.email.value.trim();
    const assunto = formulario.elements.assunto.value.trim();
    const texto = formulario.elements.mensagem.value.trim();

    const erro = validarFormularioContato({ nome, email, assunto, mensagem: texto });
    if (erro) {
      mostrarMensagem(erro, false);
      const campoInvalido = campoContatoComErro({ nome, email, assunto, mensagem: texto });
      if (campoInvalido) formulario.elements[campoInvalido].focus();
      return;
    }

    mostrarMensagem("Mensagem validada! Como este é um projeto demonstrativo, ela não foi enviada a um servidor.", true);
    formulario.reset();
  });
})();
