/* script.js - versão robusta (zera + anti-bfcache) */

const APP = (() => {
  const STORAGE_KEY = "ATR_ENEAGRAMA_V1";

  function safeParse(str) {
    try { return JSON.parse(str); } catch { return null; }
  }

  function load() {
    // Prioridade: sessionStorage
    const s = sessionStorage.getItem(STORAGE_KEY);
    if (s) return safeParse(s);

    // Migração: se existir no localStorage (versão antiga), move pra sessão
    const old = localStorage.getItem(STORAGE_KEY);
    if (old) {
      sessionStorage.setItem(STORAGE_KEY, old);
      localStorage.removeItem(STORAGE_KEY);
      return safeParse(old);
    }

    // chaves antigas (se existirem)
    const legacy = localStorage.getItem("ENEAGRAMA_TESTE") || sessionStorage.getItem("ENEAGRAMA_TESTE");
    if (legacy) {
      sessionStorage.setItem(STORAGE_KEY, legacy);
      localStorage.removeItem("ENEAGRAMA_TESTE");
      sessionStorage.removeItem("ENEAGRAMA_TESTE");
      return safeParse(legacy);
    }

    return null;
  }

  function save(state) {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function clearAll() {
    // Remove tudo que possa estar causando “respostas antigas”
    sessionStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_KEY);

    sessionStorage.removeItem("ENEAGRAMA_TESTE");
    localStorage.removeItem("ENEAGRAMA_TESTE");
    sessionStorage.removeItem("ENEAGRAMA_FORM");
    localStorage.removeItem("ENEAGRAMA_FORM");
  }

  function ensureState() {
    let st = load();
    if (!st) {
      st = {
        cadastro: {},
        answers: {}, // { q1:"A", q2:"B"... }
        createdAt: new Date().toISOString()
      };
      save(st);
    }
    return st;
  }

  function setCadastro(data) {
    const st = ensureState();
    st.cadastro = { ...data };
    st.updatedAt = new Date().toISOString();
    save(st);
  }

  function getCadastro() {
    return ensureState().cadastro || {};
  }

  function setAnswer(qKey, value) {
    const st = ensureState();
    st.answers[qKey] = value; // "A" ou "B"
    st.updatedAt = new Date().toISOString();
    save(st);
  }

  function getAnswer(qKey) {
    return (ensureState().answers || {})[qKey] || "";
  }

  function getAllAnswers() {
    return ensureState().answers || {};
  }

  function requireCadastroOrRedirect() {
    const cad = getCadastro();
    if (!cad.nome) window.location.href = "../index.html";
  }

  // ========= MATRIZ (data/matriz.json) =========
  // Formato esperado (exemplo):
  // {
  //   "q1": {"A": {"3":1}, "B":{"6":1}},
  //   "q2": {"A": {"1":1}, "B":{"5":1}}
  // }
  async function loadMatrix() {
    const res = await fetch("./data/matriz.json", { cache: "no-store" });
    if (!res.ok) throw new Error("Não consegui carregar data/matriz.json");
    return await res.json();
  }

  function computeScoresFromMatrix(matrix) {
    const answers = getAllAnswers();
    const scores = { 1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0 };

    Object.entries(answers).forEach(([qKey, choice]) => {
      const rule = matrix[qKey];
      if (!rule) return;
      const add = rule[choice];
      if (!add) return;
      Object.entries(add).forEach(([type, val]) => {
        const t = Number(type);
        scores[t] = (scores[t] || 0) + Number(val);
      });
    });

    return scores;
  }

  function top3(scores) {
    return Object.entries(scores)
      .map(([k,v]) => ({ k: Number(k), v: Number(v) }))
      .sort((a,b) => b.v - a.v)
      .slice(0,3)
      .map(x => x.k);
  }

  const TYPE_INFO = {
    1:{ title:"Tipo 1 — O Reformador",
      fortes:["Consistência e responsabilidade","Padrão alto de qualidade","Senso de justiça"],
      melhorar:["Flexibilizar o perfeccionismo","Diminuir autocobrança","Aceitar erro como parte do processo"] },
    2:{ title:"Tipo 2 — O Prestativo",
      fortes:["Empatia e acolhimento","Apoio genuíno às pessoas","Relacionamento caloroso"],
      melhorar:["Pedir ajuda sem culpa","Colocar limites","Evitar agradar para ser aceito"] },
    3:{ title:"Tipo 3 — O Realizador",
      fortes:["Foco em resultados","Energia e produtividade","Capacidade de execução e influência"],
      melhorar:["Desacelerar e sentir mais","Evitar confundir valor pessoal com performance","Mais autenticidade no processo"] },
    4:{ title:"Tipo 4 — O Individualista",
      fortes:["Profundidade emocional","Criatividade e identidade","Sensibilidade estética"],
      melhorar:["Evitar dramatizar/ruminar","Praticar gratidão e constância","Reduzir comparação"] },
    5:{ title:"Tipo 5 — O Investigador",
      fortes:["Análise e estratégia","Autonomia e precisão","Calma em cenários complexos"],
      melhorar:["Não se isolar","Compartilhar emoções e necessidades","Entrar em ação mais rápido"] },
    6:{ title:"Tipo 6 — O Leal",
      fortes:["Lealdade e comprometimento","Antecipação de riscos","Trabalho em equipe e proteção do grupo"],
      melhorar:["Reduzir ansiedade e dúvidas","Confiar mais em si","Evitar buscar garantias o tempo todo"] },
    7:{ title:"Tipo 7 — O Entusiasta",
      fortes:["Otimismo e criatividade","Versatilidade","Rapidez para oportunidades"],
      melhorar:["Terminar o que começa","Tolerar desconforto","Planejar com profundidade"] },
    8:{ title:"Tipo 8 — O Desafiador",
      fortes:["Coragem e proteção","Decisão e liderança","Franqueza e força"],
      melhorar:["Abaixar intensidade","Escutar com abertura","Mostrar vulnerabilidade com segurança"] },
    9:{ title:"Tipo 9 — O Pacificador",
      fortes:["Equilíbrio e mediação","Calma e estabilidade","Boa convivência e harmonia"],
      melhorar:["Se posicionar mais","Evitar procrastinar","Dizer ‘não’ quando necessário"] },
  };

  function buildTriadText(topArr) {
    const [a,b,c] = topArr;
    return {
      headline: `Sua Tríade é ${a}-${b}-${c}`,
      resumo: `O ${a} aparece como predominante, com influências do ${b} e do ${c}.`,
      blocos: [a,b,c].map(k => ({
        k,
        title: TYPE_INFO[k].title,
        fortes: TYPE_INFO[k].fortes,
        melhorar: TYPE_INFO[k].melhorar
      }))
    };
  }

  function buildWhatsAppMessage(cad, tri, scores) {
    const lines = [];
    lines.push(`RESULTADO ENEAGRAMA — ${cad.nome || "Participante"}`);
    if (cad.email) lines.push(`Email: ${cad.email}`);
    if (cad.telefone) lines.push(`Telefone: ${cad.telefone}`);
    if (cad.empresa) lines.push(`Empresa: ${cad.empresa}`);
    lines.push("");
    lines.push(tri.headline);
    lines.push(tri.resumo);
    lines.push("");
    lines.push("Ranking (pontuação):");
    Object.entries(scores).sort((a,b)=>b[1]-a[1]).forEach(([k,v]) => lines.push(`- Tipo ${k}: ${v}`));
    lines.push("");
    tri.blocos.forEach(b => {
      lines.push(b.title);
      lines.push(`Pontos fortes: ${b.fortes.join("; ")}`);
      lines.push(`A melhorar: ${b.melhorar.join("; ")}`);
      lines.push("");
    });
    lines.push("—");
    lines.push("Atrius • Teste Eneagrama / Competências Emocionais");
    return lines.join("\n");
  }

  function toWaLink(text) {
    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  }

  // ===== Helper p/ páginas de perguntas =====
  function initQuestionPage({ formId, qKeys, prevHref, nextHref }) {
    requireCadastroOrRedirect();
    const form = document.getElementById(formId);

    // ANTI-BFCACHE: sempre reseta o form quando a página reaparece
    window.addEventListener("pageshow", () => {
      form.reset();
      // repopula somente a sessão atual
      qKeys.forEach(q => {
        const v = getAnswer(q);
        if (!v) return;
        const el = document.querySelector(`input[name="${q}"][value="${v}"]`);
        if (el) el.checked = true;
      });
    });

    // Botão voltar (se existir)
    const back = document.getElementById("backBtn");
    if (back && prevHref) {
      back.addEventListener("click", () => window.location.href = prevHref);
    }

    // Submit
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      qKeys.forEach(q => {
        const checked = document.querySelector(`input[name="${q}"]:checked`);
        if (checked) setAnswer(q, checked.value);
      });
      window.location.href = nextHref;
    });
  }

  return {
    clearAll,
    setCadastro, getCadastro,
    setAnswer, getAnswer, getAllAnswers,
    initQuestionPage,
    loadMatrix, computeScoresFromMatrix, top3,
    buildTriadText, buildWhatsAppMessage, toWaLink,
  };
})();
