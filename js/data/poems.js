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
  {
    author: 'Fernando Pessoa', title: 'O Mostrengo', excerpt: true,
    lines: [
      'O mostrengo que está no fim do mar',
      'Na noite de breu ergueu-se a voar;',
      'À roda da nau voou três vezes,',
      'Voou três vezes a chiar,',
    ],
  },
  {
    author: 'Fernando Pessoa', title: 'Ulisses', excerpt: true,
    lines: [
      'O mito é o nada que é tudo.',
      'O mesmo sol que abre os céus',
      'É um mito brilhante e mudo —',
      'O corpo morto de Deus,',
      'Vivo e desnudo.',
    ],
  },
  {
    author: 'Fernando Pessoa', title: 'D. Sebastião, Rei de Portugal', excerpt: true,
    lines: [
      'Louco, sim, louco, porque quis grandeza',
      'Qual a Sorte a não dá.',
      'Não coube em mim minha certeza;',
      'Por isso onde o areal está',
      'Ficou meu ser que houve, não o que há.',
    ],
  },
  {
    author: 'Fernando Pessoa', title: 'Ela canta, pobre ceifeira', excerpt: true,
    lines: [
      'Ela canta, pobre ceifeira,',
      'Julgando-se feliz talvez;',
      'Canta, e ceifa, e a sua voz, cheia',
      'De alegre e anónima viuvez,',
    ],
  },
  {
    author: 'Fernando Pessoa', title: 'O menino da sua mãe', excerpt: true,
    lines: [
      'No plaino abandonado',
      'Que a morna brisa aquece,',
      'De balas trespassado —',
      'Duas, de lado a lado —,',
      'Jaz morto, e arrefece.',
    ],
  },
  {
    author: 'Fernando Pessoa', title: 'Abdicação', excerpt: true,
    lines: [
      'Toma-me, ó noite eterna, nos teus braços',
      'E chama-me teu filho… eu sou um rei',
      'que voluntariamente abandonei',
      'O meu trono de sonhos e cansaços.',
    ],
  },
  {
    author: 'Álvaro de Campos', title: 'Lisbon Revisited (1923)', excerpt: true,
    lines: [
      'Não: não quero nada.',
      'Já disse que não quero nada.',
      'Não me venham com conclusões!',
      'A única conclusão é morrer.',
    ],
  },
  {
    author: 'Álvaro de Campos', title: 'Aniversário', excerpt: true,
    lines: [
      'No tempo em que festejavam o dia dos meus anos,',
      'Eu era feliz e ninguém estava morto.',
    ],
  },
  {
    author: 'Alberto Caeiro', title: 'O Guardador de Rebanhos, IX', excerpt: true,
    lines: [
      'Sou um guardador de rebanhos.',
      'O rebanho é os meus pensamentos',
      'E os meus pensamentos são todos sensações.',
    ],
  },
  {
    author: 'Alberto Caeiro', title: 'O Guardador de Rebanhos, V', excerpt: true,
    lines: [
      'Há metafísica bastante em não pensar em nada.',
      'O que penso eu do mundo?',
      'Sei lá o que penso do mundo!',
      'Se eu adoecesse pensaria nisso.',
    ],
  },
  {
    author: 'Ricardo Reis', title: 'Segue o teu destino', excerpt: true,
    lines: [
      'Segue o teu destino,',
      'Rega as tuas plantas,',
      'Ama as tuas rosas.',
      'O resto é a sombra',
      'De árvores alheias.',
    ],
  },
  {
    author: 'Ricardo Reis', title: 'Prefiro rosas, meu amor, à pátria', excerpt: true,
    lines: [
      'Prefiro rosas, meu amor, à pátria,',
      'E antes magnólias amo',
      'Que a glória e a virtude.',
    ],
  },
  {
    author: 'Luís de Camões', title: 'Erros meus, má fortuna, amor ardente', excerpt: true,
    lines: [
      'Erros meus, má fortuna, amor ardente',
      'Em minha perdição se conjuraram;',
      'Os erros e a fortuna sobejavam,',
      'Que para mim bastava amor somente.',
    ],
  },
  {
    author: 'Luís de Camões', title: 'Descalça vai para a fonte', excerpt: true,
    lines: [
      'Descalça vai para a fonte',
      'Leonor pela verdura;',
      'Vai formosa, e não segura.',
    ],
  },
  {
    author: 'Florbela Espanca', title: 'Fumo', excerpt: true,
    lines: [
      'Longe de ti são ermos os caminhos,',
      'Longe de ti não há luar nem rosas;',
      'Longe de ti há noites silenciosas,',
      'Há dias sem calor, beirais sem ninhos!',
    ],
  },
  {
    author: 'Florbela Espanca', title: 'A minha Dor', excerpt: true,
    lines: [
      'A minha Dor é um convento ideal',
      'Cheio de claustros, sombras, arcarias,',
      'Aonde a pedra em convulsões sombrias',
      'Tem linhas dum requinte escultural.',
    ],
  },
  {
    author: 'Antero de Quental', title: 'Tormento do Ideal', excerpt: true,
    lines: [
      'Conheci a Beleza que não morre',
      'E fiquei triste.',
    ],
  },
  {
    author: 'Antero de Quental', title: 'Hino à Razão', excerpt: true,
    lines: [
      'Razão, irmã do Amor e da Justiça,',
      'Mais uma vez escuta a minha prece.',
    ],
  },
  {
    author: 'Cesário Verde', title: 'De Tarde', excerpt: true,
    lines: [
      'Naquele pic-nic de burguesas,',
      'Houve uma coisa simplesmente bela,',
      'E que, sem ter história nem grandezas,',
      'Em todo o caso dava uma aguarela.',
    ],
  },
  {
    author: 'Mário de Sá-Carneiro', title: 'Fim', excerpt: false,
    lines: [
      'Quando eu morrer batam em latas,',
      'Rompam aos saltos e aos pinotes,',
      'Façam estalar no ar chicotes,',
      'Chamem palhaços e acrobatas!',
    ],
  },
  {
    author: 'Almeida Garrett', title: 'Este inferno de amar', excerpt: true,
    lines: [
      'Este inferno de amar — como eu amo! —',
      'Quem mo pôs aqui n’alma… quem foi?',
      'Esta chama que alenta e consome,',
      'Que é a vida — e que a vida destrói —',
    ],
  },
  {
    author: 'Bocage', title: 'Já Bocage não sou!', excerpt: true,
    lines: [
      'Já Bocage não sou!… À cova escura',
      'Meu estro vai parar desfeito em vento…',
    ],
  },
];
