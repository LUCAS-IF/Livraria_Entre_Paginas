"use strict";

// Regras e interações principais da livraria.
(() => {
  const CHAVE_CARRINHO = "entre_paginas_carrinho_v1";
  const CHAVE_TEMA = "entre_paginas_tema_v1";
  const CHAVE_FAVORITOS = "entre_paginas_favoritos_v1";
  const CHAVE_CUPOM = "entre_paginas_cupom_v1";
  const CHAVE_AVALIACOES = "entre_paginas_avaliacoes_v1";
  const CHAVE_LIVROS_API = "entre_paginas_livros_api_v1";
  const LIVROS_POR_PAGINA = 8;

  const livrosLocais = window.DADOS_LIVROS.map(dados => new Livro(dados));
  const livrosOnlineSalvos = lerDadosSalvos(CHAVE_LIVROS_API, []);
  let livrosOnline = Array.isArray(livrosOnlineSalvos)
    ? livrosOnlineSalvos.map(dados => {
        const livro = new Livro(dados);
        // Corrige registros antigos que usavam o nome da API como se fosse categoria.
        if (!livro.categoria || ["openlibrary", "open library"].includes(normalizarTexto(livro.categoria))) {
          livro.categoria = "Literatura";
        }
        return livro;
      })
    : [];
  // Mantém a categoria corrigida também nos dados já salvos de pesquisas anteriores.
  salvarDados(CHAVE_LIVROS_API, livrosOnline.map(livro => livro.paraJSON()));
  const carrinhoSalvo = lerDadosSalvos(CHAVE_CARRINHO, []);
  const favoritosSalvos = lerDadosSalvos(CHAVE_FAVORITOS, []);
  const avaliacoesSalvas = lerDadosSalvos(CHAVE_AVALIACOES, {});
  let carrinho = new Carrinho(Array.isArray(carrinhoSalvo) ? carrinhoSalvo : []);
  let favoritos = new Set(Array.isArray(favoritosSalvos) ? favoritosSalvos : []);
  let avaliacoes = avaliacoesSalvas && typeof avaliacoesSalvas === "object" ? avaliacoesSalvas : {};
  let cupomAplicado = lerDadosSalvos(CHAVE_CUPOM, "") === "LIVRO10" ? "LIVRO10" : "";
  let categoriaSelecionada = "Todas";
  let mostrarSomenteFavoritos = false;
  let quantidadeVisivel = LIVROS_POR_PAGINA;
  let livroSelecionado = null;
  let temaAtual = lerDadosSalvos(CHAVE_TEMA, "claro");
  let cepValidado = "";
  const consultasEmCache = new Map();

  const elementos = {
    paginas: document.querySelectorAll(".pagina"),
    linksMenu: document.querySelectorAll("[data-pagina]"),
    menu: document.querySelector("#menu-principal"),
    botaoMenu: document.querySelector("#botao-menu"),
    botaoTema: document.querySelector("#botao-tema"),
    iconeTema: document.querySelector("#icone-tema"),
    botaoCarrinho: document.querySelector("#botao-carrinho"),
    contadorCarrinho: document.querySelector("#contador-carrinho"),
    anoAtual: document.querySelector("#ano-atual"),
    listaDestaques: document.querySelector("#lista-destaques"),
    listaLivros: document.querySelector("#lista-livros"),
    formularioBusca: document.querySelector("#formulario-busca"),
    campoBusca: document.querySelector("#campo-busca"),
    filtrosCategoria: document.querySelector("#filtros-categoria"),
    ordenacao: document.querySelector("#ordenacao"),
    botaoFavoritos: document.querySelector("#botao-favoritos"),
    contadorFavoritos: document.querySelector("#contador-favoritos"),
    resultadoCatalogo: document.querySelector("#resultado-catalogo"),
    estadoVazio: document.querySelector("#estado-vazio"),
    limparFiltros: document.querySelector("#limpar-filtros"),
    carregarMais: document.querySelector("#botao-carregar-mais"),
    formularioOpenLibrary: document.querySelector("#formulario-openlibrary"),
    campoOpenLibrary: document.querySelector("#campo-openlibrary"),
    botaoOpenLibrary: document.querySelector("#botao-openlibrary"),
    mensagemApi: document.querySelector("#mensagem-api"),
    detalheCapa: document.querySelector("#detalhe-capa"),
    detalheCategoria: document.querySelector("#detalhe-categoria"),
    tituloDetalhes: document.querySelector("#titulo-detalhes"),
    detalheAutor: document.querySelector("#detalhe-autor"),
    estrelasMedia: document.querySelector("#estrelas-media"),
    textoAvaliacao: document.querySelector("#texto-avaliacao"),
    detalheSinopse: document.querySelector("#detalhe-sinopse"),
    detalheEditora: document.querySelector("#detalhe-editora"),
    detalheAno: document.querySelector("#detalhe-ano"),
    detalhePaginas: document.querySelector("#detalhe-paginas"),
    detalheCategoriaDado: document.querySelector("#detalhe-categoria-dado"),
    detalhePreco: document.querySelector("#detalhe-preco"),
    linkOrigemApi: document.querySelector("#link-origem-api"),
    adicionarDetalhe: document.querySelector("#adicionar-detalhe"),
    botoesAvaliacao: document.querySelector("#botoes-avaliacao"),
    mensagemAvaliacao: document.querySelector("#mensagem-avaliacao"),
    listaCarrinho: document.querySelector("#lista-carrinho"),
    valorSubtotal: document.querySelector("#valor-subtotal"),
    valorFrete: document.querySelector("#valor-frete"),
    linhaDesconto: document.querySelector("#linha-desconto"),
    valorDesconto: document.querySelector("#valor-desconto"),
    valorTotal: document.querySelector("#valor-total"),
    formularioCupom: document.querySelector("#formulario-cupom"),
    campoCupom: document.querySelector("#campo-cupom"),
    mensagemCupom: document.querySelector("#mensagem-cupom"),
    avisoFrete: document.querySelector("#aviso-frete"),
    botaoIrCheckout: document.querySelector("#botao-ir-checkout"),
    botaoEsvaziar: document.querySelector("#botao-esvaziar"),
    areaCheckout: document.querySelector("#area-checkout"),
    formularioCheckout: document.querySelector("#formulario-checkout"),
    checkoutCep: document.querySelector("#checkout-cep"),
    buscarCep: document.querySelector("#buscar-cep"),
    mensagemCep: document.querySelector("#mensagem-cep"),
    mensagemCheckout: document.querySelector("#mensagem-checkout"),
    voltarResumo: document.querySelector("#voltar-resumo"),
    detalhesPix: document.querySelector("#detalhes-pagamento-pix"),
    detalhesCartao: document.querySelector("#detalhes-pagamento-cartao"),
    detalhesBoleto: document.querySelector("#detalhes-pagamento-boleto"),
    pixConfirmacao: document.querySelector("#pix-confirmacao"),
    pedidoConcluido: document.querySelector("#pedido-concluido"),
    mensagemPedido: document.querySelector("#mensagem-pedido"),
    notificacoes: document.querySelector("#notificacoes")
  };

  // Formata preços no padrão brasileiro.
  function formatarMoeda(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });
  }

  // Padroniza textos para a busca não diferenciar acentos ou letras maiúsculas.
  function normalizarTexto(texto) {
    return String(texto || "")
      .toLocaleLowerCase("pt-BR")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function obterTodosOsLivros() {
    return [...livrosLocais, ...livrosOnline];
  }

  function buscarLivroPorId(id) {
    return obterTodosOsLivros().find(livro => livro.id === String(id))
      || carrinho.itens.find(item => item.livro.id === String(id))?.livro
      || null;
  }

  function salvarCarrinho() {
    salvarDados(CHAVE_CARRINHO, carrinho.paraJSON());
    salvarDados(CHAVE_CUPOM, cupomAplicado);
  }

  function salvarFavoritos() {
    salvarDados(CHAVE_FAVORITOS, [...favoritos]);
    elementos.contadorFavoritos.textContent = favoritos.size;
  }

  function mostrarNotificacao(mensagem, tipo = "sucesso") {
    const aviso = document.createElement("p");
    aviso.className = `notificacao ${tipo}`;
    aviso.textContent = mensagem;
    elementos.notificacoes.appendChild(aviso);
    window.setTimeout(() => aviso.remove(), 3200);
  }

  // Mostra apenas a página escolhida e mantém o cabeçalho e o rodapé compartilhados.
  function navegarPara(nomePagina, moverFoco = true) {
    const paginasPermitidas = ["inicio", "catalogo", "detalhes", "carrinho", "sobre"];
    const pagina = paginasPermitidas.includes(nomePagina) ? nomePagina : "inicio";

    elementos.paginas.forEach(secao => {
      secao.hidden = secao.id !== `pagina-${pagina}`;
    });

    elementos.linksMenu.forEach(link => {
      if (link.classList.contains("link-menu")) {
        const estaAtivo = link.dataset.pagina === pagina;
        link.classList.toggle("ativo", estaAtivo);
        if (estaAtivo) link.setAttribute("aria-current", "page");
        else link.removeAttribute("aria-current");
      }
    });

    elementos.menu.classList.remove("aberto");
    elementos.botaoMenu.setAttribute("aria-expanded", "false");
    elementos.botaoMenu.setAttribute("aria-label", "Abrir menu");
    history.replaceState(null, "", `#${pagina}`);

    if (pagina === "catalogo") renderizarCatalogo();
    if (pagina === "carrinho") {
      elementos.pedidoConcluido.hidden = true;
      elementos.areaCheckout.hidden = true;
      renderizarCarrinho();
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
    // O foco vai para o título ao trocar de seção, mas não ao abrir o site.
    if (moverFoco) {
      const tituloPagina = document.querySelector(`#pagina-${pagina} h1`);
      if (tituloPagina) tituloPagina.focus({ preventScroll: true });
    }
  }

  // Cria cada card com elementos DOM e textContent, sem inserir texto externo como HTML.
  function criarCartaoLivro(livro) {
    const artigo = document.createElement("article");
    artigo.className = "cartao-livro";
    artigo.dataset.id = livro.id;

    const areaCapa = document.createElement("div");
    areaCapa.className = "area-capa";

    const imagem = document.createElement("img");
    imagem.src = livro.capa;
    imagem.alt = livro.textoAlternativo;
    imagem.width = 145;
    imagem.height = 205;
    imagem.loading = "lazy";
    imagem.addEventListener("error", () => {
      imagem.src = "assets/images/capa-generica.svg";
    }, { once: true });
    areaCapa.appendChild(imagem);

    if (livro.destaque || livro.origemApi) {
      const selo = document.createElement("span");
      selo.className = "selo-destaque";
      selo.textContent = livro.origemApi ? "Open Library" : "Destaque";
      areaCapa.appendChild(selo);
    }

    const botaoFavorito = document.createElement("button");
    botaoFavorito.className = "botao-favorito";
    botaoFavorito.type = "button";
    botaoFavorito.dataset.acao = "favoritar";
    botaoFavorito.setAttribute("aria-pressed", String(favoritos.has(livro.id)));
    botaoFavorito.setAttribute("aria-label", favoritos.has(livro.id)
      ? `Remover ${livro.titulo} dos favoritos`
      : `Adicionar ${livro.titulo} aos favoritos`);
    botaoFavorito.textContent = favoritos.has(livro.id) ? "♥" : "♡";
    areaCapa.appendChild(botaoFavorito);

    const conteudo = document.createElement("div");
    conteudo.className = "conteudo-cartao";

    const categoria = document.createElement("span");
    categoria.className = "etiqueta-categoria";
    categoria.textContent = livro.categoria;

    const titulo = document.createElement("h2");
    titulo.className = "titulo-cartao";
    titulo.textContent = livro.titulo;

    const autor = document.createElement("p");
    autor.className = "autor-cartao";
    autor.textContent = livro.autor;

    const rodape = document.createElement("div");
    rodape.className = "rodape-cartao";
    const preco = document.createElement("span");
    preco.className = "preco-livro";
    preco.textContent = formatarMoeda(livro.preco);
    if (livro.origemApi) preco.setAttribute("aria-label", `Preço demonstrativo de ${formatarMoeda(livro.preco)}`);
    const nota = document.createElement("span");
    nota.className = "estrelas";
    nota.textContent = livro.avaliacao ? `★ ${livro.avaliacao.toFixed(1)}` : "Novo";
    nota.setAttribute("aria-label", livro.avaliacao ? `Avaliação ${livro.avaliacao} de 5` : "Livro sem avaliação");
    rodape.append(preco, nota);

    const acoes = document.createElement("div");
    acoes.className = "acoes-cartao";
    const botaoDetalhes = document.createElement("button");
    botaoDetalhes.type = "button";
    botaoDetalhes.className = "botao-detalhes";
    botaoDetalhes.dataset.acao = "detalhes";
    botaoDetalhes.textContent = "Ver detalhes";
    const botaoAdicionar = document.createElement("button");
    botaoAdicionar.type = "button";
    botaoAdicionar.className = "botao-adicionar";
    botaoAdicionar.dataset.acao = "adicionar";
    botaoAdicionar.textContent = "Adicionar";
    acoes.append(botaoDetalhes, botaoAdicionar);

    conteudo.append(categoria, titulo, autor, rodape, acoes);
    artigo.append(areaCapa, conteudo);
    return artigo;
  }

  function renderizarDestaques() {
    const destaques = livrosLocais.filter(livro => livro.destaque).slice(0, 4);
    elementos.listaDestaques.replaceChildren(...destaques.map(criarCartaoLivro));
  }

  function renderizarFiltrosCategoria() {
    const categorias = ["Todas", ...new Set(obterTodosOsLivros().map(livro => livro.categoria))];
    elementos.filtrosCategoria.replaceChildren();

    categorias.forEach(categoria => {
      const botao = document.createElement("button");
      botao.type = "button";
      botao.className = "filtro-categoria";
      botao.dataset.categoria = categoria;
      botao.textContent = categoria;
      botao.setAttribute("aria-pressed", String(categoria === categoriaSelecionada));
      elementos.filtrosCategoria.appendChild(botao);
    });
  }

  // Combina busca, categoria e favoritos antes de aplicar a ordenação.
  function obterLivrosFiltrados() {
    const busca = normalizarTexto(elementos.campoBusca.value.trim());
    let resultado = obterTodosOsLivros().filter(livro => {
      const correspondeBusca = normalizarTexto(`${livro.titulo} ${livro.autor}`).includes(busca);
      const correspondeCategoria = categoriaSelecionada === "Todas" || livro.categoria === categoriaSelecionada;
      const correspondeFavoritos = !mostrarSomenteFavoritos || favoritos.has(livro.id);
      return correspondeBusca && correspondeCategoria && correspondeFavoritos;
    });

    switch (elementos.ordenacao.value) {
      case "preco-menor":
        resultado.sort((a, b) => a.preco - b.preco);
        break;
      case "preco-maior":
        resultado.sort((a, b) => b.preco - a.preco);
        break;
      case "titulo":
        resultado.sort((a, b) => a.titulo.localeCompare(b.titulo, "pt-BR"));
        break;
      case "lancamento":
        resultado.sort((a, b) => b.ano - a.ano);
        break;
      default:
        resultado.sort((a, b) => Number(b.destaque) - Number(a.destaque));
    }

    return resultado;
  }

  function renderizarCatalogo() {
    renderizarFiltrosCategoria();
    const livros = obterLivrosFiltrados();
    const livrosVisiveis = livros.slice(0, quantidadeVisivel);

    elementos.listaLivros.setAttribute("aria-busy", "true");
    elementos.listaLivros.replaceChildren(...livrosVisiveis.map(criarCartaoLivro));
    elementos.listaLivros.setAttribute("aria-busy", "false");
    elementos.estadoVazio.hidden = livros.length !== 0;
    elementos.carregarMais.hidden = livrosVisiveis.length >= livros.length || livros.length === 0;
    elementos.resultadoCatalogo.textContent = `${livrosVisiveis.length} de ${livros.length} livro(s) exibido(s)`;
    elementos.botaoFavoritos.setAttribute("aria-pressed", String(mostrarSomenteFavoritos));
    elementos.botaoFavoritos.textContent = mostrarSomenteFavoritos ? "♥ Exibindo favoritos" : "♡ Meus favoritos";
    elementos.contadorFavoritos.textContent = favoritos.size;
  }

  function reiniciarPaginacao() {
    quantidadeVisivel = LIVROS_POR_PAGINA;
    renderizarCatalogo();
  }

  function alternarFavorito(idLivro) {
    if (favoritos.has(idLivro)) {
      favoritos.delete(idLivro);
      mostrarNotificacao("Livro removido dos favoritos.");
    } else {
      favoritos.add(idLivro);
      mostrarNotificacao("Livro adicionado aos favoritos.");
    }
    salvarFavoritos();
    renderizarDestaques();
    renderizarCatalogo();
  }

  function atualizarContadorCarrinho() {
    const quantidade = carrinho.contarUnidades();
    elementos.contadorCarrinho.textContent = quantidade;
    elementos.botaoCarrinho.setAttribute("aria-label", `Abrir carrinho, ${quantidade} item(ns)`);
  }

  function calcularValoresCompra() {
    return calcularResumoCompra(carrinho.calcularSubtotal(), cupomAplicado);
  }

  function criarItemCarrinho(item) {
    const artigo = document.createElement("article");
    artigo.className = "item-carrinho";
    artigo.dataset.id = item.livro.id;

    const imagem = document.createElement("img");
    imagem.src = item.livro.capa;
    imagem.alt = item.livro.textoAlternativo;
    imagem.width = 78;
    imagem.height = 108;
    imagem.addEventListener("error", () => { imagem.src = "assets/images/capa-generica.svg"; }, { once: true });

    const informacoes = document.createElement("div");
    const titulo = document.createElement("h2");
    titulo.textContent = item.livro.titulo;
    const autor = document.createElement("p");
    autor.textContent = item.livro.autor;
    const preco = document.createElement("p");
    preco.textContent = `${formatarMoeda(item.livro.preco)} por unidade`;

    const controles = document.createElement("div");
    controles.className = "controles-quantidade";
    const diminuir = document.createElement("button");
    diminuir.type = "button";
    diminuir.dataset.acao = "diminuir";
    diminuir.setAttribute("aria-label", `Diminuir quantidade de ${item.livro.titulo}`);
    diminuir.textContent = "−";
    diminuir.disabled = item.quantidade <= 1;
    const quantidade = document.createElement("span");
    quantidade.textContent = `Quantidade: ${item.quantidade}`;
    const aumentar = document.createElement("button");
    aumentar.type = "button";
    aumentar.dataset.acao = "aumentar";
    aumentar.setAttribute("aria-label", `Aumentar quantidade de ${item.livro.titulo}`);
    aumentar.textContent = "+";
    controles.append(diminuir, quantidade, aumentar);

    const remover = document.createElement("button");
    remover.type = "button";
    remover.className = "botao-remover";
    remover.dataset.acao = "remover";
    remover.textContent = "Remover";
    informacoes.append(titulo, autor, preco, controles, remover);

    const subtotal = document.createElement("p");
    subtotal.className = "subtotal-item";
    subtotal.textContent = formatarMoeda(item.calcularSubtotal());
    artigo.append(imagem, informacoes, subtotal);
    return artigo;
  }

  function renderizarCarrinho() {
    const estaVazio = carrinho.estaVazio();
    if (estaVazio) {
      const mensagem = document.createElement("div");
      mensagem.className = "estado-carrinho";
      const titulo = document.createElement("h2");
      titulo.textContent = "Seu carrinho está vazio";
      const texto = document.createElement("p");
      texto.textContent = "Volte ao catálogo e escolha os livros que deseja conhecer.";
      const linkCatalogo = document.createElement("a");
      linkCatalogo.href = "#catalogo";
      linkCatalogo.className = "botao botao-principal";
      linkCatalogo.dataset.pagina = "catalogo";
      linkCatalogo.textContent = "Explorar catálogo";
      mensagem.append(titulo, texto, linkCatalogo);
      elementos.listaCarrinho.replaceChildren(mensagem);
    } else {
      elementos.listaCarrinho.replaceChildren(...carrinho.itens.map(criarItemCarrinho));
    }

    const valores = calcularValoresCompra();
    elementos.valorSubtotal.textContent = formatarMoeda(valores.subtotal);
    elementos.valorFrete.textContent = valores.frete === 0 && valores.subtotal > 0 ? "Grátis" : formatarMoeda(valores.frete);
    elementos.valorDesconto.textContent = `− ${formatarMoeda(valores.desconto)}`;
    elementos.valorTotal.textContent = formatarMoeda(valores.total);
    elementos.linhaDesconto.hidden = valores.desconto === 0;
    elementos.botaoIrCheckout.disabled = estaVazio;
    elementos.botaoEsvaziar.disabled = estaVazio;
    elementos.avisoFrete.textContent = valores.subtotal >= LIMITE_FRETE_GRATIS
      ? "Você ganhou frete grátis!"
      : `Faltam ${formatarMoeda(LIMITE_FRETE_GRATIS - valores.subtotal)} para ganhar frete grátis.`;
    elementos.campoCupom.value = cupomAplicado;
    elementos.mensagemCupom.textContent = cupomAplicado === "LIVRO10"
      ? "Cupom LIVRO10 aplicado: 10% de desconto no subtotal."
      : "Use o cupom LIVRO10 para ganhar 10% de desconto.";
    atualizarContadorCarrinho();
  }

  function adicionarAoCarrinho(livro) {
    if (!livro) return;
    const adicionou = carrinho.adicionar(livro);
    if (!adicionou) {
      mostrarNotificacao("Este livro já está no limite de 99 unidades.", "erro");
      return;
    }
    salvarCarrinho();
    atualizarContadorCarrinho();
    mostrarNotificacao(`${livro.titulo} foi adicionado ao carrinho.`);
  }

  function tratarCliqueEmCard(evento) {
    const botao = evento.target.closest("button[data-acao]");
    if (!botao) return;

    const cartao = botao.closest(".cartao-livro");
    const livro = buscarLivroPorId(cartao?.dataset.id);
    if (!livro) return;

    switch (botao.dataset.acao) {
      case "adicionar":
        adicionarAoCarrinho(livro);
        break;
      case "detalhes":
        abrirDetalhes(livro);
        break;
      case "favoritar":
        alternarFavorito(livro.id);
        break;
      default:
        break;
    }
  }

  function mostrarEstrelas(valor) {
    const nota = Math.max(0, Math.min(5, Math.round(valor)));
    return "★".repeat(nota) + "☆".repeat(5 - nota);
  }

  function abrirDetalhes(livro) {
    livroSelecionado = livro;
    elementos.detalheCapa.src = livro.capa;
    elementos.detalheCapa.alt = livro.textoAlternativo;
    elementos.detalheCapa.onerror = () => { elementos.detalheCapa.src = "assets/images/capa-generica.svg"; };
    elementos.detalheCategoria.textContent = livro.categoria;
    elementos.tituloDetalhes.textContent = livro.titulo;
    elementos.detalheAutor.textContent = `Por ${livro.autor}`;
    elementos.estrelasMedia.textContent = livro.avaliacao ? mostrarEstrelas(livro.avaliacao) : "☆☆☆☆☆";
    elementos.estrelasMedia.className = "estrelas";
    elementos.textoAvaliacao.textContent = livro.avaliacao
      ? `${livro.avaliacao.toFixed(1)} de 5 (${livro.quantidadeAvaliacoes} avaliações)`
      : "Ainda sem avaliações";
    elementos.detalheSinopse.textContent = livro.sinopse;
    elementos.detalheEditora.textContent = livro.editora || "Não informada";
    elementos.detalheAno.textContent = livro.ano || "Não informado";
    elementos.detalhePaginas.textContent = livro.paginas ? `${livro.paginas} páginas` : "Não informado";
    elementos.detalheCategoriaDado.textContent = livro.categoria;
    elementos.detalhePreco.textContent = `${formatarMoeda(livro.preco)}${livro.origemApi ? " (preço demonstrativo)" : ""}`;
    elementos.linkOrigemApi.hidden = !livro.origemApi || !livro.linkOrigem;
    if (livro.origemApi && livro.linkOrigem) {
      elementos.linkOrigemApi.href = livro.linkOrigem;
    }
    elementos.mensagemAvaliacao.textContent = avaliacoes[livro.id]
      ? `Sua avaliação: ${avaliacoes[livro.id]} estrela(s). Obrigado!`
      : "Escolha uma nota de uma a cinco estrelas.";
    renderizarBotoesAvaliacao();
    navegarPara("detalhes");
  }

  function renderizarBotoesAvaliacao() {
    const notaSalva = Number(avaliacoes[livroSelecionado.id]) || 0;
    elementos.botoesAvaliacao.replaceChildren();

    for (let nota = 1; nota <= 5; nota += 1) {
      const botao = document.createElement("button");
      botao.type = "button";
      botao.className = "botao-estrela";
      botao.dataset.nota = nota;
      botao.textContent = nota <= notaSalva ? "★" : "☆";
      botao.setAttribute("aria-label", `Avaliar com ${nota} estrela(s)`);
      botao.setAttribute("aria-pressed", String(nota === notaSalva));
      elementos.botoesAvaliacao.appendChild(botao);
    }
  }

  function salvarAvaliacao(nota) {
    if (!livroSelecionado || nota < 1 || nota > 5) return;
    avaliacoes[livroSelecionado.id] = nota;
    salvarDados(CHAVE_AVALIACOES, avaliacoes);
    elementos.mensagemAvaliacao.textContent = `Sua avaliação: ${nota} estrela(s). Obrigado por participar!`;
    renderizarBotoesAvaliacao();
  }

  function aplicarCupom(codigo) {
    const cupom = validarCupom(codigo);
    if (cupom) {
      cupomAplicado = cupom;
      salvarCarrinho();
      elementos.mensagemCupom.textContent = "Cupom aplicado! Você ganhou 10% de desconto no subtotal.";
      elementos.mensagemCupom.className = "mensagem-sucesso";
    } else {
      cupomAplicado = "";
      salvarCarrinho();
      elementos.mensagemCupom.textContent = "Cupom não encontrado. Confira o código e tente novamente.";
      elementos.mensagemCupom.className = "mensagem-erro";
    }
    renderizarCarrinho();
  }

  function classificarCategoriaAPI(assuntos = []) {
    const texto = normalizarTexto(assuntos.join(" "));
    if (/juvenile|children|childrens|young adult|infant/.test(texto)) return "Infantil";
    if (/fantasy|magic|myth|science fiction|fairy/.test(texto)) return "Fantasia";
    if (/computer|programming|technology|software|database|internet/.test(texto)) return "Tecnologia";
    if (/romance|love stories|romantic fiction/.test(texto)) return "Romance";
    if (/fiction|literature|novel|short stories|poetry|biography|history|drama/.test(texto)) return "Literatura";
    return "Literatura";
  }

  function converterResultadoAPI(dado, indice) {
    const titulo = dado.title || "Livro sem título";
    const autor = Array.isArray(dado.author_name) && dado.author_name.length
      ? dado.author_name.slice(0, 2).join(", ")
      : "Autor não informado";
    const id = `openlibrary-${String(dado.key || indice).replace(/[^a-zA-Z0-9-]/g, "-")}`;
    const identificadorCapa = Number.parseInt(dado.cover_i, 10);
    const capa = Number.isInteger(identificadorCapa) && identificadorCapa > 0
      ? `https://covers.openlibrary.org/b/id/${identificadorCapa}-M.jpg`
      : "assets/images/capa-generica.svg";
    const chaveObra = typeof dado.key === "string" && dado.key.startsWith("/works/")
      ? dado.key
      : "";

    return new Livro({
      id,
      titulo,
      autor,
      editora: Array.isArray(dado.publisher) ? dado.publisher[0] : "Open Library",
      ano: dado.first_publish_year || 0,
      paginas: dado.number_of_pages_median || 0,
      preco: 49.90,
      categoria: classificarCategoriaAPI(dado.subject || []),
      sinopse: "Este registro foi localizado na Open Library. A descrição completa pode variar conforme a edição catalogada.",
      capa,
      textoAlternativo: `Capa do livro ${titulo}, registro consultado na Open Library`,
      avaliacao: 0,
      quantidadeAvaliacoes: 0,
      origemApi: true,
      linkOrigem: chaveObra ? `https://openlibrary.org${chaveObra}` : "https://openlibrary.org/"
    });
  }

  // A consulta é feita somente quando a pessoa solicita, evitando chamadas desnecessárias.
  async function buscarNaOpenLibrary(consulta) {
    const termo = consulta.trim();
    const erroTermo = validarTermoOpenLibrary(termo);
    if (erroTermo) {
      elementos.mensagemApi.textContent = erroTermo;
      return;
    }

    const chaveCache = normalizarTexto(termo);
    elementos.botaoOpenLibrary.disabled = true;
    elementos.botaoOpenLibrary.textContent = "Buscando...";
    elementos.mensagemApi.textContent = "Consultando o catálogo público da Open Library...";

    try {
      let livrosEncontrados;
      if (consultasEmCache.has(chaveCache)) {
        livrosEncontrados = consultasEmCache.get(chaveCache);
      } else {
        const parametros = new URLSearchParams({
          q: termo,
          fields: "key,title,author_name,first_publish_year,cover_i,publisher,number_of_pages_median,subject",
          limit: "10",
          lang: "pt"
        });
        const resposta = await fetch(`https://openlibrary.org/search.json?${parametros}`);
        if (!resposta.ok) throw new Error("A consulta não respondeu corretamente.");
        const dados = await resposta.json();
        livrosEncontrados = (dados.docs || []).map(converterResultadoAPI);
        consultasEmCache.set(chaveCache, livrosEncontrados);
      }

      const idsExistentes = new Set(livrosLocais.map(livro => normalizarTexto(livro.titulo)));
      livrosOnline = livrosEncontrados.filter(livro => !idsExistentes.has(normalizarTexto(livro.titulo)));
      salvarDados(CHAVE_LIVROS_API, livrosOnline.map(livro => livro.paraJSON()));
      categoriaSelecionada = "Todas";
      mostrarSomenteFavoritos = false;
      elementos.campoBusca.value = "";
      quantidadeVisivel = LIVROS_POR_PAGINA;
      renderizarCatalogo();
      elementos.mensagemApi.textContent = livrosOnline.length
        ? `${livrosOnline.length} resultado(s) da Open Library foram adicionados ao catálogo e salvos neste navegador. A categoria representa o assunto; os preços são ilustrativos.`
        : "A consulta não encontrou novos títulos para acrescentar. Tente outro termo.";
    } catch (erro) {
      elementos.mensagemApi.textContent = "Não foi possível consultar a Open Library agora. Confira sua conexão e tente novamente.";
    } finally {
      elementos.botaoOpenLibrary.disabled = false;
      elementos.botaoOpenLibrary.textContent = "Buscar na API";
    }
  }

  // Consulta o ViaCEP e preenche os campos do endereço quando o CEP é encontrado.
  async function consultarCEP() {
    const cep = elementos.checkoutCep.value.replace(/\D/g, "");
    if (!cepTemFormatoValido(cep)) {
      elementos.mensagemCep.textContent = "Digite um CEP com oito números.";
      elementos.mensagemCep.className = "mensagem-erro";
      elementos.checkoutCep.focus();
      return;
    }

    elementos.buscarCep.disabled = true;
    elementos.buscarCep.textContent = "Consultando...";
    elementos.mensagemCep.textContent = "Buscando endereço...";
    elementos.mensagemCep.className = "";

    try {
      const resposta = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      if (!resposta.ok) throw new Error("Falha na consulta do CEP.");
      const endereco = await resposta.json();

      if (!respostaCepValida(endereco, cep)) {
        cepValidado = "";
        elementos.mensagemCep.textContent = "CEP não encontrado ou inválido. Confira os oito números e tente novamente.";
        elementos.mensagemCep.className = "mensagem-erro";
        return;
      }

      cepValidado = cep;
      document.querySelector("#checkout-rua").value = endereco.logradouro || "";
      document.querySelector("#checkout-bairro").value = endereco.bairro || "";
      document.querySelector("#checkout-cidade").value = endereco.localidade || "";
      document.querySelector("#checkout-estado").value = endereco.uf || "";
      document.querySelector("#checkout-complemento").value = endereco.complemento || "";
      elementos.mensagemCep.textContent = "Endereço localizado. Confira os dados e complete o número.";
      elementos.mensagemCep.className = "mensagem-sucesso";
      document.querySelector("#checkout-numero").focus();
    } catch (erro) {
      cepValidado = "";
      elementos.mensagemCep.textContent = "Não foi possível validar o CEP agora. Confira sua conexão e tente novamente.";
      elementos.mensagemCep.className = "mensagem-erro";
    } finally {
      elementos.buscarCep.disabled = false;
      elementos.buscarCep.textContent = "Buscar CEP";
    }
  }

  function mostrarResultadoFormulario(elemento, mensagem, sucesso) {
    elemento.textContent = mensagem;
    elemento.className = sucesso ? "mensagem-formulario mensagem-sucesso" : "mensagem-formulario mensagem-erro";
  }

  function finalizarPedido(evento) {
    evento.preventDefault();
    const dados = Object.fromEntries(new FormData(elementos.formularioCheckout).entries());
    const erro = validarDadosCheckout(dados, cepValidado, carrinho.estaVazio());

    if (erro) {
      mostrarResultadoFormulario(elementos.mensagemCheckout, erro, false);
      const campoInvalido = elementos.formularioCheckout.querySelector(":invalid");
      if (campoInvalido) campoInvalido.focus();
      else if (dados.pagamento === "Cartão de crédito") {
        const camposCartao = {
          cartaoNumero: "#checkout-cartao-numero",
          cartaoTitular: "#checkout-cartao-titular",
          cartaoValidade: "#checkout-cartao-validade",
          cartaoCvv: "#checkout-cartao-cvv"
        };
        const campoCartaoInvalido = campoCartaoComErro(dados);
        document.querySelector(camposCartao[campoCartaoInvalido]).focus();
      }
      return;
    }

    const total = calcularValoresCompra().total;
    const numeroPedido = `EP-${Date.now().toString().slice(-6)}`;
    const resumoFormaPagamento = {
      Pix: "Pix demonstrativo (QR Code sem validade financeira)",
      "Cartão de crédito": "cartão de crédito com dados fictícios validados apenas neste navegador",
      Boleto: "boleto selecionado, mas não emitido"
    }[dados.pagamento];

    elementos.mensagemPedido.textContent = `Pedido ${numeroPedido} registrado para ${dados.nome}. Forma de pagamento: ${resumoFormaPagamento}. Total demonstrativo: ${formatarMoeda(total)}. Nenhum pagamento foi realizado.`;
    elementos.pixConfirmacao.hidden = dados.pagamento !== "Pix";
    elementos.pedidoConcluido.hidden = false;
    elementos.areaCheckout.hidden = true;
    carrinho.esvaziar();
    cupomAplicado = "";
    salvarCarrinho();
    renderizarCarrinho();
    elementos.formularioCheckout.reset();
    atualizarDetalhesPagamento();
    cepValidado = "";
    elementos.mensagemCep.textContent = "";
    mostrarResultadoFormulario(elementos.mensagemCheckout, "", true);
    elementos.pedidoConcluido.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function aplicarTema(tema) {
    temaAtual = tema === "escuro" ? "escuro" : "claro";
    document.documentElement.dataset.tema = temaAtual;
    elementos.botaoTema.setAttribute("aria-pressed", String(temaAtual === "escuro"));
    elementos.botaoTema.setAttribute("aria-label", temaAtual === "escuro" ? "Ativar tema claro" : "Ativar tema escuro");
    elementos.iconeTema.textContent = temaAtual === "escuro" ? "☀" : "☾";
    salvarDados(CHAVE_TEMA, temaAtual);
  }

  // Apaga os campos do cartão quando a pessoa troca de opção ou abandona o checkout.
  function limparDadosCartao() {
    ["#checkout-cartao-numero", "#checkout-cartao-titular", "#checkout-cartao-validade", "#checkout-cartao-cvv"]
      .forEach(seletor => { document.querySelector(seletor).value = ""; });
  }

  // Exibe somente os campos referentes à forma de pagamento escolhida.
  function atualizarDetalhesPagamento() {
    const formaSelecionada = document.querySelector('input[name="pagamento"]:checked')?.value;
    elementos.detalhesPix.hidden = formaSelecionada !== "Pix";
    elementos.detalhesCartao.hidden = formaSelecionada !== "Cartão de crédito";
    elementos.detalhesBoleto.hidden = formaSelecionada !== "Boleto";

    if (formaSelecionada !== "Cartão de crédito") limparDadosCartao();
  }

  // Aplica máscaras visuais; a validação real do formato fica no serviço.
  function prepararCamposCartao() {
    const numero = document.querySelector("#checkout-cartao-numero");
    const validade = document.querySelector("#checkout-cartao-validade");
    const cvv = document.querySelector("#checkout-cartao-cvv");

    numero.addEventListener("input", () => {
      const digitos = numero.value.replace(/\D/g, "").slice(0, 16);
      numero.value = digitos.replace(/(\d{4})(?=\d)/g, "$1 ");
    });

    validade.addEventListener("input", () => {
      const digitos = validade.value.replace(/\D/g, "").slice(0, 4);
      validade.value = digitos.length > 2 ? `${digitos.slice(0, 2)}/${digitos.slice(2)}` : digitos;
    });

    cvv.addEventListener("input", () => {
      cvv.value = cvv.value.replace(/\D/g, "").slice(0, 4);
    });
  }

  function iniciarEventos() {
    elementos.linksMenu.forEach(link => {
      link.addEventListener("click", evento => {
        const pagina = link.dataset.pagina;
        if (!pagina) return;
        evento.preventDefault();
        navegarPara(pagina);
      });
    });

    elementos.botaoMenu.addEventListener("click", () => {
      const menuAberto = elementos.menu.classList.toggle("aberto");
      elementos.botaoMenu.setAttribute("aria-expanded", String(menuAberto));
      elementos.botaoMenu.setAttribute("aria-label", menuAberto ? "Fechar menu" : "Abrir menu");
      if (menuAberto) elementos.menu.querySelector("a")?.focus();
    });

    elementos.botaoTema.addEventListener("click", () => {
      aplicarTema(temaAtual === "claro" ? "escuro" : "claro");
    });

    elementos.formularioBusca.addEventListener("submit", evento => {
      evento.preventDefault();
      reiniciarPaginacao();
    });
    elementos.campoBusca.addEventListener("input", () => {
      quantidadeVisivel = LIVROS_POR_PAGINA;
      renderizarCatalogo();
    });
    elementos.filtrosCategoria.addEventListener("click", evento => {
      const botao = evento.target.closest("button[data-categoria]");
      if (!botao) return;
      categoriaSelecionada = botao.dataset.categoria;
      quantidadeVisivel = LIVROS_POR_PAGINA;
      renderizarCatalogo();
    });
    elementos.ordenacao.addEventListener("change", reiniciarPaginacao);
    elementos.botaoFavoritos.addEventListener("click", () => {
      mostrarSomenteFavoritos = !mostrarSomenteFavoritos;
      quantidadeVisivel = LIVROS_POR_PAGINA;
      renderizarCatalogo();
    });
    elementos.limparFiltros.addEventListener("click", () => {
      elementos.campoBusca.value = "";
      elementos.ordenacao.value = "destaque";
      categoriaSelecionada = "Todas";
      mostrarSomenteFavoritos = false;
      reiniciarPaginacao();
    });
    elementos.carregarMais.addEventListener("click", () => {
      quantidadeVisivel += LIVROS_POR_PAGINA;
      renderizarCatalogo();
    });
    elementos.listaDestaques.addEventListener("click", tratarCliqueEmCard);
    elementos.listaLivros.addEventListener("click", tratarCliqueEmCard);

    elementos.formularioOpenLibrary.addEventListener("submit", evento => {
      evento.preventDefault();
      buscarNaOpenLibrary(elementos.campoOpenLibrary.value);
    });
    elementos.adicionarDetalhe.addEventListener("click", () => {
      adicionarAoCarrinho(livroSelecionado);
      navegarPara("carrinho");
    });
    elementos.botoesAvaliacao.addEventListener("click", evento => {
      const botao = evento.target.closest("button[data-nota]");
      if (botao) salvarAvaliacao(Number(botao.dataset.nota));
    });

    elementos.botaoCarrinho.addEventListener("click", () => navegarPara("carrinho"));
    elementos.listaCarrinho.addEventListener("click", evento => {
      const botao = evento.target.closest("button[data-acao]");
      if (!botao) return;
      const item = botao.closest(".item-carrinho");
      if (!item) return;
      const idLivro = item.dataset.id;
      const itemAtual = carrinho.itens.find(atual => atual.livro.id === idLivro);
      if (!itemAtual) return;

      if (botao.dataset.acao === "aumentar") carrinho.alterarQuantidade(idLivro, itemAtual.quantidade + 1);
      if (botao.dataset.acao === "diminuir") carrinho.alterarQuantidade(idLivro, itemAtual.quantidade - 1);
      if (botao.dataset.acao === "remover") carrinho.remover(idLivro);
      salvarCarrinho();
      renderizarCarrinho();
    });

    elementos.formularioCupom.addEventListener("submit", evento => {
      evento.preventDefault();
      aplicarCupom(elementos.campoCupom.value);
    });
    elementos.botaoEsvaziar.addEventListener("click", () => {
      carrinho.esvaziar();
      cupomAplicado = "";
      salvarCarrinho();
      renderizarCarrinho();
      elementos.areaCheckout.hidden = true;
      mostrarNotificacao("O carrinho foi esvaziado.");
    });
    elementos.botaoIrCheckout.addEventListener("click", () => {
      if (carrinho.estaVazio()) return;
      elementos.pedidoConcluido.hidden = true;
      elementos.areaCheckout.hidden = false;
      elementos.areaCheckout.scrollIntoView({ behavior: "smooth", block: "start" });
      document.querySelector("#checkout-nome").focus({ preventScroll: true });
    });
    elementos.buscarCep.addEventListener("click", consultarCEP);
    elementos.checkoutCep.addEventListener("input", () => {
      const numeros = elementos.checkoutCep.value.replace(/\D/g, "").slice(0, 8);
      elementos.checkoutCep.value = numeros.length > 5 ? `${numeros.slice(0, 5)}-${numeros.slice(5)}` : numeros;
      cepValidado = "";
      elementos.mensagemCep.textContent = "Consulte novamente o CEP após qualquer alteração.";
      elementos.mensagemCep.className = "";
    });

    document.querySelector("#checkout-numero").addEventListener("input", evento => {
      evento.target.value = evento.target.value.replace(/\D/g, "").slice(0, 6);
    });

    // O link é criado dinamicamente quando o carrinho está vazio.
    elementos.listaCarrinho.addEventListener("click", evento => {
      const link = evento.target.closest('a[data-pagina="catalogo"]');
      if (!link) return;
      evento.preventDefault();
      navegarPara("catalogo");
    });
    document.querySelectorAll('input[name="pagamento"]').forEach(opcao => {
      opcao.addEventListener("change", atualizarDetalhesPagamento);
    });
    prepararCamposCartao();

    elementos.formularioCheckout.addEventListener("submit", finalizarPedido);
    elementos.voltarResumo.addEventListener("click", () => {
      elementos.areaCheckout.hidden = true;
      const opcaoCartao = document.querySelector('input[name="pagamento"][value="Cartão de crédito"]');
      opcaoCartao.checked = false;
      atualizarDetalhesPagamento();
      elementos.botaoIrCheckout.focus();
    });
  }

  function iniciarAplicacao() {
    elementos.anoAtual.textContent = new Date().getFullYear();
    aplicarTema(temaAtual);
    salvarFavoritos();
    renderizarDestaques();
    renderizarCatalogo();
    renderizarCarrinho();
    iniciarEventos();

    const paginaInicial = window.location.hash.replace("#", "");
    if (["catalogo", "carrinho", "sobre"].includes(paginaInicial)) {
      navegarPara(paginaInicial);
    } else {
      navegarPara("inicio", false);
    }
  }

  iniciarAplicacao();
})();
