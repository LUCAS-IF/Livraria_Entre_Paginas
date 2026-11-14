"use strict";

// Catálogo inicial da livraria. Os dados ficam separados do HTML para facilitar alterações.
window.DADOS_LIVROS = [
  {
    id: "jardim-horas", titulo: "O Jardim das Horas", autor: "Helena Duarte",
    editora: "Aurora Editorial", ano: 2024, paginas: 288, preco: 49.90,
    categoria: "Romance", sinopse: "Ao voltar à pequena cidade onde cresceu, Clara encontra um jardim abandonado e cartas que nunca foram entregues. Entre lembranças, encontros e escolhas, ela descobre que algumas histórias precisam de tempo para florescer.",
    capa: "assets/images/jardim-horas.svg", textoAlternativo: "Capa ilustrada do livro O Jardim das Horas em tons de verde e creme",
    avaliacao: 4.8, quantidadeAvaliacoes: 36, destaque: true
  },
  {
    id: "cartas-inverno", titulo: "Cartas para o Inverno", autor: "Marina Valença",
    editora: "Selo Horizonte", ano: 2022, paginas: 240, preco: 44.90,
    categoria: "Romance", sinopse: "Uma caixa de cartas antigas aproxima duas pessoas que nunca deveriam ter se encontrado. Em uma cidade coberta pela chuva, cada página revela um segredo sobre afeto, família e recomeços.",
    capa: "assets/images/cartas-inverno.svg", textoAlternativo: "Capa do livro Cartas para o Inverno com paisagem azul e uma carta",
    avaliacao: 4.6, quantidadeAvaliacoes: 21
  },
  {
    id: "ultima-estacao", titulo: "A Última Estação", autor: "Caio Furtado",
    editora: "Páginas Livres", ano: 2025, paginas: 312, preco: 54.90,
    categoria: "Romance", sinopse: "Durante uma viagem de trem, dois desconhecidos compartilham histórias que mudam o destino de ambos. Um romance sobre encontros inesperados e a coragem de escolher novos caminhos.",
    capa: "assets/images/ultima-estacao.svg", textoAlternativo: "Capa do livro A Última Estação com ilustração de trilhos ao pôr do sol",
    avaliacao: 4.7, quantidadeAvaliacoes: 18
  },
  {
    id: "entre-linhas-cafe", titulo: "Entre Linhas e Café", autor: "Elisa Monteiro",
    editora: "Editora Ipê", ano: 2023, paginas: 196, preco: 39.90,
    categoria: "Romance", sinopse: "Uma cafeteria de bairro vira ponto de encontro para pessoas que precisam de uma pausa. Pequenas conversas mostram que a vida pode mudar quando alguém escuta com atenção.",
    capa: "assets/images/entre-linhas-cafe.svg", textoAlternativo: "Capa do livro Entre Linhas e Café com xícara e folhas",
    avaliacao: 4.5, quantidadeAvaliacoes: 14
  },
  {
    id: "mapa-estrelas", titulo: "O Mapa das Estrelas", autor: "Rafael Nogueira",
    editora: "Lume Editorial", ano: 2025, paginas: 416, preco: 69.90,
    categoria: "Fantasia", sinopse: "Quando constelações começam a desaparecer do céu, uma jovem cartógrafa recebe um mapa que aponta para lugares que não existem. Para salvar seu mundo, ela precisará atravessar fronteiras entre memória e magia.",
    capa: "assets/images/mapa-estrelas.svg", textoAlternativo: "Capa do livro O Mapa das Estrelas com céu noturno e constelações",
    avaliacao: 4.9, quantidadeAvaliacoes: 48, destaque: true
  },
  {
    id: "reino-cinzas", titulo: "Reino de Cinzas Azuis", autor: "Laura Campos",
    editora: "Arco", ano: 2021, paginas: 368, preco: 59.90,
    categoria: "Fantasia", sinopse: "Em um reino onde o fogo guarda as lembranças dos antigos reis, uma aprendiz de curandeira precisa decidir se mantém a tradição ou revela a verdade que pode mudar a história.",
    capa: "assets/images/reino-cinzas.svg", textoAlternativo: "Capa do livro Reino de Cinzas Azuis com montanhas e lua azul",
    avaliacao: 4.4, quantidadeAvaliacoes: 27
  },
  {
    id: "guardia-vale", titulo: "A Guardiã do Vale", autor: "Theo Martins",
    editora: "Aurora Editorial", ano: 2024, paginas: 352, preco: 64.90,
    categoria: "Fantasia", sinopse: "Uma antiga trilha se abre depois de cem anos e chama uma jovem que conhece cada árvore do vale. O que começa como uma busca simples se transforma em uma aventura sobre coragem e pertencimento.",
    capa: "assets/images/guardia-vale.svg", textoAlternativo: "Capa do livro A Guardiã do Vale com floresta e montanhas",
    avaliacao: 4.7, quantidadeAvaliacoes: 32
  },
  {
    id: "biblioteca-sombras", titulo: "Biblioteca das Sombras", autor: "Sofia Leal",
    editora: "Selo Horizonte", ano: 2025, paginas: 304, preco: 62.90,
    categoria: "Fantasia", sinopse: "Em uma biblioteca onde os livros registram futuros possíveis, uma restauradora encontra páginas que descrevem acontecimentos ainda não vividos. Cada leitura tem um preço, e o último volume guarda seu próprio nome.",
    capa: "assets/images/biblioteca-sombras.svg", textoAlternativo: "Capa do livro Biblioteca das Sombras com estantes e luz dourada",
    avaliacao: 4.8, quantidadeAvaliacoes: 41, destaque: true
  },
  {
    id: "javascript-misterio", titulo: "JavaScript sem Mistério", autor: "Bruno Tavares",
    editora: "Código Aberto", ano: 2024, paginas: 320, preco: 79.90,
    categoria: "Tecnologia", sinopse: "Um guia introdutório para aprender lógica, funções, eventos e manipulação do DOM por meio de pequenos projetos. Os exemplos avançam passo a passo e mostram como organizar um código que outras pessoas consigam entender.",
    capa: "assets/images/javascript-misterio.svg", textoAlternativo: "Capa do livro JavaScript sem Mistério com símbolos de código",
    avaliacao: 4.9, quantidadeAvaliacoes: 52, destaque: true
  },
  {
    id: "redes-iniciantes", titulo: "Redes para Iniciantes", autor: "Ana Ribeiro",
    editora: "Código Aberto", ano: 2023, paginas: 280, preco: 74.90,
    categoria: "Tecnologia", sinopse: "Conceitos de redes de computadores explicados com diagramas e exemplos práticos. O livro apresenta endereçamento IP, dispositivos, protocolos, redes sem fio e fundamentos de segurança.",
    capa: "assets/images/redes-iniciantes.svg", textoAlternativo: "Capa do livro Redes para Iniciantes com desenho de nós conectados",
    avaliacao: 4.6, quantidadeAvaliacoes: 25
  },
  {
    id: "banco-dados-pratica", titulo: "Banco de Dados na Prática", autor: "Pedro Azevedo",
    editora: "TecPress", ano: 2025, paginas: 360, preco: 89.90,
    categoria: "Tecnologia", sinopse: "Uma introdução ao projeto de bancos relacionais, passando por requisitos, modelo entidade-relacionamento, normalização e consultas SQL. Os exercícios usam situações próximas de sistemas do cotidiano.",
    capa: "assets/images/banco-dados-pratica.svg", textoAlternativo: "Capa do livro Banco de Dados na Prática com ícones de tabelas",
    avaliacao: 4.8, quantidadeAvaliacoes: 33
  },
  {
    id: "logica-projetos", titulo: "Lógica de Programação em Projetos", autor: "Carla Mendes",
    editora: "TecPress", ano: 2022, paginas: 240, preco: 64.90,
    categoria: "Tecnologia", sinopse: "Algoritmos, estruturas de decisão, repetição e decomposição de problemas em atividades curtas. O foco está em desenvolver o raciocínio antes de escolher uma linguagem de programação.",
    capa: "assets/images/logica-projetos.svg", textoAlternativo: "Capa do livro Lógica de Programação em Projetos com fluxograma colorido",
    avaliacao: 4.5, quantidadeAvaliacoes: 19
  },
  {
    id: "pequenos-inventores", titulo: "Pequenos Inventores", autor: "Luisa Prado",
    editora: "Amora", ano: 2024, paginas: 48, preco: 34.90,
    categoria: "Infantil", sinopse: "Um grupo de amigos transforma caixas, barbantes e ideias em invenções divertidas. Uma história ilustrada que incentiva a criatividade, a colaboração e a curiosidade.",
    capa: "assets/images/pequenos-inventores.svg", textoAlternativo: "Capa infantil do livro Pequenos Inventores com desenhos coloridos",
    avaliacao: 4.9, quantidadeAvaliacoes: 44
  },
  {
    id: "clube-curiosos", titulo: "O Clube dos Curiosos", autor: "Miguel Arantes",
    editora: "Amora", ano: 2023, paginas: 56, preco: 32.90,
    categoria: "Infantil", sinopse: "Toda semana, três crianças investigam um mistério no bairro. Com perguntas, observação e trabalho em equipe, elas descobrem que aprender pode ser uma grande aventura.",
    capa: "assets/images/clube-curiosos.svg", textoAlternativo: "Capa infantil do livro O Clube dos Curiosos com lupa e estrelas",
    avaliacao: 4.7, quantidadeAvaliacoes: 29
  },
  {
    id: "viagem-quintal", titulo: "Viagem ao Fundo do Quintal", autor: "Beatriz Luz",
    editora: "Amora", ano: 2025, paginas: 64, preco: 36.90,
    categoria: "Infantil", sinopse: "Uma tarde de brincadeira revela um mundo inteiro entre vasos, árvores e pequenas criaturas. Uma aventura delicada sobre imaginação e cuidado com a natureza.",
    capa: "assets/images/viagem-quintal.svg", textoAlternativo: "Capa infantil do livro Viagem ao Fundo do Quintal com plantas e insetos",
    avaliacao: 4.8, quantidadeAvaliacoes: 37
  },
  {
    id: "historias-dormir", titulo: "Histórias para Dormir Acordado", autor: "Nina Torres",
    editora: "Amora", ano: 2021, paginas: 72, preco: 38.90,
    categoria: "Infantil", sinopse: "Pequenos contos para imaginar cidades nas nuvens, animais que conversam e viagens até lugares distantes. Cada história termina com uma pergunta para inventar o próximo capítulo.",
    capa: "assets/images/historias-dormir.svg", textoAlternativo: "Capa infantil do livro Histórias para Dormir Acordado com lua e estrelas",
    avaliacao: 4.6, quantidadeAvaliacoes: 22
  }
];
