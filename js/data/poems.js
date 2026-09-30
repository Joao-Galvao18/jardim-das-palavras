// Poemas

const POEMS = [
  {
    author: 'Fernando Pessoa', title: 'Autopsicografia', excerpt: true,
    lines: [
      'O poeta é um fingidor.',
      'Finge tão completamente',
      'Que chega a fingir que é dor',
      'A dor que deveras sente.',
    ],
  },
  {
    author: 'Fernando Pessoa', title: 'Mar Português', excerpt: true,
    lines: [
      'Ó mar salgado, quanto do teu sal',
      'São lágrimas de Portugal!',
      'Por te cruzarmos, quantas mães choraram,',
      'Quantos filhos em vão rezaram!',
    ],
  },
  {
    author: 'Fernando Pessoa', title: 'Mar Português', excerpt: true,
    lines: [
      'Valeu a pena? Tudo vale a pena',
      'Se a alma não é pequena.',
      'Quem quer passar além do Bojador',
      'Tem que passar além da dor.',
    ],
  },
  {
    author: 'Fernando Pessoa', title: 'Isto', excerpt: true,
    lines: [
      'Dizem que finjo ou minto',
      'Tudo que escrevo. Não.',
      'Eu simplesmente sinto',
      'Com a imaginação.',
      'Não uso o coração.',
    ],
  },
  {
    author: 'Ricardo Reis', title: 'Para ser grande, sê inteiro', excerpt: false,
    lines: [
      'Para ser grande, sê inteiro: nada',
      'Teu exagera ou exclui.',
      'Sê todo em cada coisa. Põe quanto és',
      'No mínimo que fazes.',
      'Assim em cada lago a lua toda',
      'Brilha, porque alta vive.',
    ],
  },
  {
    author: 'Álvaro de Campos', title: 'Tabacaria', excerpt: true,
    lines: [
      'Não sou nada.',
      'Nunca serei nada.',
      'Não posso querer ser nada.',
      'À parte isso, tenho em mim todos os sonhos do mundo.',
    ],
  },
  {
    author: 'Alberto Caeiro', title: 'O Guardador de Rebanhos, II', excerpt: true,
    lines: [
      'O meu olhar é nítido como um girassol.',
      'Tenho o costume de andar pelas estradas',
      'Olhando para a direita e para a esquerda,',
      'E de vez em quando olhando para trás…',
    ],
  },
  {
    author: 'Luís de Camões', title: 'Amor é fogo que arde sem se ver', excerpt: true,
    lines: [
      'Amor é fogo que arde sem se ver,',
      'é ferida que dói, e não se sente;',
      'é um contentamento descontente;',
      'é dor que desatina sem doer.',
    ],
  },
  {
    author: 'Luís de Camões', title: 'Mudam-se os tempos, mudam-se as vontades', excerpt: true,
    lines: [
      'Mudam-se os tempos, mudam-se as vontades,',
      'muda-se o ser, muda-se a confiança;',
      'todo o mundo é composto de mudança,',
      'tomando sempre novas qualidades.',
    ],
  },
  {
    author: 'Florbela Espanca', title: 'Ser Poeta', excerpt: true,
    lines: [
      'Ser poeta é ser mais alto, é ser maior',
      'Do que os homens! Morder como quem beija!',
      'É ser mendigo e dar como quem seja',
      'Rei do Reino de Aquém e de Além Dor!',
    ],
  },
  {
    author: 'Florbela Espanca', title: 'Amar!', excerpt: true,
    lines: [
      'Eu quero amar, amar perdidamente!',
      'Amar só por amar: Aqui… além…',
      'Mais Este e Aquele, o Outro e toda a gente…',
      'Amar! Amar! E não amar ninguém!',
    ],
  },
  {
    author: 'Florbela Espanca', title: 'Fanatismo', excerpt: true,
    lines: [
      'Minh’alma, de sonhar-te, anda perdida.',
      'Meus olhos andam cegos de te ver!',
      'Não és sequer a razão do meu viver,',
      'Pois que tu és já toda a minha vida!',
    ],
  },
  {
    author: 'Cesário Verde', title: 'O Sentimento dum Ocidental', excerpt: true,
    lines: [
      'Nas nossas ruas, ao anoitecer,',
      'Há tal soturnidade, há tal melancolia,',
      'Que as sombras, o bulício, o Tejo, a maresia',
      'Despertam-me um desejo absurdo de sofrer.',
    ],
  },
  {
    author: 'Camilo Pessanha', title: 'Imagens que passais pela retina', excerpt: true,
    lines: [
      'Imagens que passais pela retina',
      'Dos meus olhos, porque não vos fixais?',
      'Que passais como a água cristalina',
      'Por uma fonte para nunca mais!…',
    ],
  },
  {
    author: 'Mário de Sá-Carneiro', title: 'Quase', excerpt: true,
    lines: [
      'Um pouco mais de sol — eu era brasa,',
      'Um pouco mais de azul — eu era além.',
      'Para atingir, faltou-me um golpe d’asa…',
      'Se ao menos eu permanecesse aquém…',
    ],
  },
  {
    author: 'Antero de Quental', title: 'Na mão de Deus', excerpt: true,
    lines: [
      'Na mão de Deus, na sua mão direita,',
      'Descansou afinal meu coração.',
      'Do palácio encantado da Ilusão',
      'Desci a passo e passo a escada estreita.',
    ],
  },
  {
    author: 'Fernando Pessoa', title: 'O Infante', excerpt: true,
    lines: [
      'Deus quer, o homem sonha, a obra nasce.',
      'Deus quis que a terra fosse toda uma,',
      'Que o mar unisse, já não separasse.',
    ],
  },
  {
    author: 'Fernando Pessoa', title: 'Liberdade', excerpt: true,
    lines: [
      'Ai que prazer',
      'Não cumprir um dever,',
      'Ter um livro para ler',
      'E não o fazer!',
    ],
  },
  {
    author: 'Fernando Pessoa', title: 'Não sei quantas almas tenho', excerpt: true,
    lines: [
      'Não sei quantas almas tenho.',
      'Cada momento mudei.',
      'Continuamente me estranho.',
      'Nunca me vi nem acabei.',
    ],
  },
  {
    author: 'Álvaro de Campos', title: 'Todas as cartas de amor são ridículas', excerpt: true,
    lines: [
      'Todas as cartas de amor são',
      'Ridículas.',
      'Não seriam cartas de amor se não fossem',
      'Ridículas.',
    ],
  },
  {
    author: 'Alberto Caeiro', title: 'O Guardador de Rebanhos, XX', excerpt: true,
    lines: [
      'O Tejo é mais belo que o rio que corre pela minha aldeia,',
      'Mas o Tejo não é mais belo que o rio que corre pela minha aldeia',
      'Porque o Tejo não é o rio que corre pela minha aldeia.',
    ],
  },
  {
    author: 'Ricardo Reis', title: 'Vem sentar-te comigo, Lídia, à beira do rio', excerpt: true,
    lines: [
      'Vem sentar-te comigo, Lídia, à beira do rio.',
      'Sossegadamente fitemos o seu curso e aprendamos',
      'Que a vida passa, e não estamos de mãos enlaçadas.',
      '(Enlacemos as mãos.)',
    ],
  },
  {
    author: 'Luís de Camões', title: 'Alma minha gentil, que te partiste', excerpt: true,
    lines: [
      'Alma minha gentil, que te partiste',
      'Tão cedo desta vida, descontente,',
      'Repousa lá no Céu eternamente,',
      'E viva eu cá na terra sempre triste.',
    ],
  },
  {
    author: 'Luís de Camões', title: 'Sete anos de pastor Jacob servia', excerpt: true,
    lines: [
      'Sete anos de pastor Jacob servia',
      'Labão, pai de Raquel, serrana bela;',
      'Mas não servia ao pai, servia a ela,',
      'E a ela só por prémio pretendia.',
    ],
  },
  {
    author: 'Luís de Camões', title: 'Os Lusíadas, Canto I', excerpt: true,
    lines: [
      'As armas e os barões assinalados',
      'Que da ocidental praia Lusitana',
      'Por mares nunca de antes navegados',
      'Passaram ainda além da Taprobana,',
    ],
  },
  {
    author: 'Florbela Espanca', title: 'Eu', excerpt: true,
    lines: [
      'Eu sou a que no mundo anda perdida,',
      'Eu sou a que na vida não tem norte,',
      'Sou a irmã do Sonho, e desta sorte',
      'Sou a crucificada… a dolorida…',
    ],
  },
  {
    author: 'Florbela Espanca', title: 'Vaidade', excerpt: true,
    lines: [
      'Sonho que sou a Poetisa eleita,',
      'Aquela que diz tudo e tudo sabe,',
      'Que tem a inspiração pura e perfeita,',
      'Que reúne num verso a imensidade!',
    ],
  },
  {
    author: 'Camilo Pessanha', title: 'Inscrição', excerpt: false,
    lines: [
      'Eu vi a luz em um país perdido.',
      'A minha alma é lânguida e inerme.',
      'Oh! Quem pudesse deslizar sem ruído!',
      'No chão sumir-se, como faz um verme…',
    ],
  },
  {
    author: 'Mário de Sá-Carneiro', title: 'Dispersão', excerpt: true,
    lines: [
      'Perdi-me dentro de mim',
      'Porque eu era labirinto,',
      'E hoje, quando me sinto,',
      'É com saudades de mim.',
    ],
  },
  {
    author: 'Almeida Garrett', title: 'Não te amo', excerpt: true,
    lines: [
      'Não te amo, quero-te: o amor vem d’alma.',
      'E eu n’alma — tenho a calma,',
      'A calma — do jazigo.',
      'Ai! não te amo, não.',
    ],
  },
];
