// ======================================================
//  UTILITÁRIOS (LocalStorage)
// ======================================================

function getRespostas() {
  return JSON.parse(localStorage.getItem("respostas")) || [];
}

function setRespostas(respostas) {
  localStorage.setItem("respostas", JSON.stringify(respostas));
}

function setUsuario(usuario) {
  localStorage.setItem("usuario", JSON.stringify(usuario));
}

function getUsuario() {
  return JSON.parse(localStorage.getItem("usuario")) || null;
}


// ======================================================
//  SALVAR RESPOSTA (1 por pergunta) + MARCA VISUAL
// ======================================================

function salvarResposta(pergunta, alternativa, elemento) {
  let respostas = getRespostas();

  // remove resposta anterior dessa pergunta (se existir)
  respostas = respostas.filter(r => r.pergunta !== pergunta);

  // adiciona a nova resposta
  respostas.push({ pergunta, alternativa });

  // salva
  setRespostas(respostas);

  // --- feedback visual (marcação do botão) ---
  if (elemento) {
    const card = elemento.closest(".question-card");
    if (card) {
      card.querySelectorAll(".option-btn").forEach(btn => btn.classList.remove("selected"));
    }
    elemento.classList.add("selected");
  }
}


// ======================================================
//  RESTAURAR SELEÇÕES (quando voltar para uma página)
//  - opcional, mas deixa perfeito: ao abrir page1/page2, ele marca o que já foi clicado
// ======================================================

function restaurarSelecoes() {
  const respostas = getRespostas();

  respostas.forEach(r => {
    const selector = `[data-pergunta="${r.pergunta}"][data-alt="${r.alternativa}"]`;
    const btn = document.querySelector(selector);
    if (btn) {
      // marca visualmente
      const card = btn.closest(".question-card");
      if (card) card.querySelectorAll(".option-btn").forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
    }
  });
}


// ======================================================
//  CARREGAR MATRIZ DE PONTUAÇÃO
//  Observação: pages usam "../data/..." e root usa "data/..."
//  Aqui usamos caminho relativo padrão para as páginas dentro de /pages
// ======================================================

async function carregarMatriz() {
  // Se estiver dentro de /pages, funciona:
  // ../data/matriz.json
  // Se estiver na raiz, funciona:
  // data/matriz.json
  const path = window.location.pathname.includes("/pages/")
    ? "../data/matriz.json"
    : "data/matriz.json";

  const matriz = await fetch(path).then(r => r.json());
  return matriz;
}


// ======================================================
//  CALCULAR RESULTADO FINAL
// ======================================================

async function calcularResultado() {
  const matriz = await carregarMatriz();

  // pontuação dos 9 perfis
  const score = { 1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0 };

  const respostas = getRespostas();

  respostas.forEach(r => {
    const mapaPergunta = matriz[r.pergunta];
    if (!mapaPergunta) return;

    const perfil = mapaPergunta[r.alternativa];
    if (!perfil) return;

    score[perfil] += 1;
  });

  localStorage.setItem("resultado", JSON.stringify(score));

  // vai para resultado (se estiver dentro de pages, resultado geralmente fica em /pages/resultado.html ou /resultado.html)
  // Você comentou que tem "resultado.html" na pasta pages ou raiz. Vamos tentar os dois:
  if (window.location.pathname.includes("/pages/")) {
    window.location.href = "resultado.html";
  } else {
    window.location.href = "pages/resultado.html";
  }
}


// ======================================================
//  TOP 3 PERFIS
// ======================================================

function obterTop3(score) {
  return Object.entries(score)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([perfil, pontos]) => ({ perfil, pontos }));
}


// ======================================================
//  RESULTADO (para você montar depois na tela)
// ======================================================

function carregarResultadoNaPagina() {
  const score = JSON.parse(localStorage.getItem("resultado")) || null;
  const usuario = getUsuario();

  if (!score) {
    console.warn("Sem resultado calculado ainda.");
    return;
  }

  const top3 = obterTop3(score);
  console.log("Usuário:", usuario);
  console.log("Score:", score);
  console.log("Top3:", top3);

  // aqui você vai preencher seu HTML do resultado
  // (a gente monta isso quando chegar na página final)
}


// ======================================================
//  AJUDA: LIMPAR TUDO (se quiser reiniciar teste)
// ======================================================

function resetarTeste() {
  localStorage.removeItem("usuario");
  localStorage.removeItem("respostas");
  localStorage.removeItem("resultado");
}
